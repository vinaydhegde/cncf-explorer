import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as yaml from 'js-yaml';
import { ProjectsService } from '../projects/projects.service';
import { CreateProjectDto } from '../projects/dto/create-project.dto';

interface LandscapeItem {
  name: string;
  homepage_url?: string;
  repo_url?: string;
  logo?: string;
  description?: string;
  project?: string; // Maturity level: sandbox, incubating, graduated
  extra?: {
    github?: string;
    url?: string;
    twitter?: string;
  };
}

interface LandscapeCategory {
  name: string;
  subcategories?: Array<{
    name: string;
    items?: LandscapeItem[];
  }>;
  items?: LandscapeItem[];
  category?: string;
}

interface LandscapeData {
  landscape: LandscapeCategory[];
}

@Injectable()
export class LandscapeService {
  private readonly logger = new Logger(LandscapeService.name);
  // CNCF landscape only provides YAML file, JSON is generated during build
  private readonly LANDSCAPE_YAML_URLS = [
    'https://raw.githubusercontent.com/cncf/landscape/main/landscape.yml',
    'https://raw.githubusercontent.com/cncf/landscape/master/landscape.yml',
    'https://github.com/cncf/landscape/raw/main/landscape.yml',
  ];

  constructor(private readonly projectsService: ProjectsService) {}

  async fetchAndParseLandscape(): Promise<LandscapeData> {
    let lastError: any = null;

    for (const url of this.LANDSCAPE_YAML_URLS) {
      try {
        this.logger.log(`Attempting to fetch landscape YAML from: ${url}`);

        const response = await axios.get(url, {
          headers: {
            'Accept': 'application/x-yaml, text/yaml, text/plain',
          },
          timeout: 30000, // 30 second timeout
        });

        this.logger.log(`Successfully fetched landscape YAML from: ${url}`);

        // Parse YAML to JavaScript object
        const parsedData = yaml.load(response.data) as LandscapeData;
        
        if (!parsedData || !parsedData.landscape) {
          throw new Error('Invalid landscape data structure');
        }

        return parsedData;
      } catch (error: any) {
        this.logger.warn(`Failed to fetch from ${url}: ${error.message}`);
        lastError = error;
        // Continue to next URL
        continue;
      }
    }

    // If all URLs failed, throw the last error
    this.logger.error(`Failed to fetch landscape data from all URLs. Last error: ${lastError?.message}`);
    throw new Error(`Failed to fetch landscape YAML. Tried ${this.LANDSCAPE_YAML_URLS.length} URLs. Last error: ${lastError?.message}`);
  }

  async syncProjectsToDatabase(): Promise<{ imported: number; updated: number }> {
    try {
      // Fetch and parse YAML file (CNCF landscape only provides YAML)
      const landscapeData = await this.fetchAndParseLandscape();
      this.logger.log('Successfully fetched and parsed landscape YAML');

      const projects: CreateProjectDto[] = [];

      // Parse landscape data and extract projects
      // CNCF landscape structure: landscape -> category -> subcategories -> subcategory -> items -> item
      for (const entry of landscapeData.landscape || []) {
        // Handle both wrapped (category: {...}) and direct category structures
        const category = (entry as any).category || entry;
        
        if (!category || typeof category !== 'object' || !category.name) {
          continue; // Skip invalid entries
        }
        
        const categoryName = category.name;
        
        // Get category-level maturity if available
        const categoryMaturity = category.maturity || category.level;

        // Process items directly in category (if items are at category level)
        if (category.items && Array.isArray(category.items)) {
          for (const itemWrapper of category.items) {
            const item = itemWrapper.item || itemWrapper;
            if (item && item.name) {
              const project = this.mapItemToProject(item, categoryName);
              // Override with category-level maturity if item doesn't have one
              if (categoryMaturity && !item.project) {
                project.maturityLevel = this.normalizeMaturityLevel(categoryMaturity);
              }
              projects.push(project);
            }
          }
        }

        // Process subcategories
        if (category.subcategories && Array.isArray(category.subcategories)) {
          for (const subcategoryWrapper of category.subcategories) {
            const subcategory = subcategoryWrapper.subcategory || subcategoryWrapper;
            
            if (!subcategory || typeof subcategory !== 'object' || !subcategory.name) {
              continue; // Skip invalid subcategories
            }
            
            const subcategoryName = subcategory.name;
            
            if (subcategory.items && Array.isArray(subcategory.items)) {
              for (const itemWrapper of subcategory.items) {
                const item = itemWrapper.item || itemWrapper;
                if (item && item.name) {
                  const project = this.mapItemToProject(item, categoryName, subcategoryName);
                  // Override with category-level maturity if item doesn't have one
                  if (categoryMaturity && !item.project) {
                    project.maturityLevel = this.normalizeMaturityLevel(categoryMaturity);
                  }
                  projects.push(project);
                }
              }
            }
          }
        }
      }

      // Bulk import/update projects
      await this.projectsService.bulkCreate(projects);

      this.logger.log(`Successfully synced ${projects.length} projects to database`);
      return { imported: projects.length, updated: projects.length };
    } catch (error) {
      this.logger.error(`Error syncing projects: ${error.message}`);
      throw error;
    }
  }

  private extractMaturityLevel(item: LandscapeItem, category: string, subcategory?: string): string {
    // In CNCF landscape YAML, maturity level is in the 'project' field of each item
    // Format: project: "sandbox" | "incubating" | "graduated"
    let maturityLevel = 'Sandbox'; // Default

    // First priority: check the 'project' field (this is the standard CNCF landscape format)
    if (item.project && item.project.trim() !== '') {
      maturityLevel = String(item.project);
    } else {
      // Fallback: check other possible fields
      const itemAny = item as any;
      if (itemAny.maturity) {
        maturityLevel = String(itemAny.maturity);
      } else if (itemAny.cncf_maturity) {
        maturityLevel = String(itemAny.cncf_maturity);
      } else if (itemAny.level) {
        maturityLevel = String(itemAny.level);
      } else if (itemAny.cncf_level) {
        maturityLevel = String(itemAny.cncf_level);
      } else if (itemAny.stage) {
        maturityLevel = String(itemAny.stage);
      }
      
      // Also check category/subcategory names for maturity indicators as last resort
      const categoryLower = category.toLowerCase();
      const subcategoryLower = subcategory?.toLowerCase() || '';
      
      if (categoryLower.includes('graduated') || subcategoryLower.includes('graduated')) {
        maturityLevel = 'Graduated';
      } else if (categoryLower.includes('incubating') || subcategoryLower.includes('incubating')) {
        maturityLevel = 'Incubating';
      } else if (categoryLower.includes('sandbox') || subcategoryLower.includes('sandbox')) {
        maturityLevel = 'Sandbox';
      }
    }

    // Normalize maturity level names
    return this.normalizeMaturityLevel(maturityLevel);
  }

  private normalizeMaturityLevel(maturity: string): string {
    if (!maturity) {
      return 'Sandbox'; // Default
    }
    
    const maturityLower = maturity.toLowerCase().trim();
    
    // Handle exact matches first (most common in CNCF landscape)
    if (maturityLower === 'graduated') {
      return 'Graduated';
    } else if (maturityLower === 'incubating') {
      return 'Incubating';
    } else if (maturityLower === 'sandbox') {
      return 'Sandbox';
    }
    
    // Handle partial matches
    if (maturityLower.includes('graduated')) {
      return 'Graduated';
    } else if (maturityLower.includes('incubating')) {
      return 'Incubating';
    } else if (maturityLower.includes('sandbox')) {
      return 'Sandbox';
    }
    
    // Default to Sandbox if we can't determine
    this.logger.debug(`Unknown maturity level: ${maturity}, defaulting to Sandbox`);
    return 'Sandbox';
  }

  private mapItemToProject(item: LandscapeItem, category: string, subcategory?: string): CreateProjectDto {
    // Determine maturity level from item properties or default
    // CNCF landscape structure may vary, so we check multiple possible fields
    let maturityLevel = this.extractMaturityLevel(item, category, subcategory);

    const itemAny = item as any;

    // Extract GitHub stars if available (would need GitHub API call for real data)
    let githubStars: number | undefined;
    if (item.extra?.github) {
      // In a real implementation, you'd fetch this from GitHub API
      // For now, we'll leave it undefined
    }

    // Extract repo URL from various possible fields
    let repoUrl = item.repo_url;
    if (!repoUrl && item.extra?.github) {
      repoUrl = item.extra.github;
    }
    if (!repoUrl && itemAny.repo) {
      repoUrl = itemAny.repo;
    }

    return {
      name: item.name,
      category: category,
      subcategory: subcategory,
      maturityLevel: maturityLevel,
      githubStars: githubStars,
      homepageUrl: item.homepage_url || item.extra?.url,
      repoUrl: repoUrl,
      logo: item.logo,
      description: item.description,
      extra: item.extra,
      lastUpdated: new Date(),
    };
  }

  async fetchGitHubStars(repoUrl: string): Promise<number | null> {
    try {
      // Extract owner/repo from URL
      const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (!match) {
        return null;
      }

      const [, owner, repo] = match;
      const apiUrl = `https://api.github.com/repos/${owner}/${repo}`;

      const response = await axios.get(apiUrl, {
        headers: {
          Accept: 'application/vnd.github.v3+json',
        },
      });

      return response.data.stargazers_count || null;
    } catch (error) {
      this.logger.warn(`Could not fetch GitHub stars for ${repoUrl}: ${error.message}`);
      return null;
    }
  }
}

