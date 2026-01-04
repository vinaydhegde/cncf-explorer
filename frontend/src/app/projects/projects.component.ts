import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectsService } from '../services/projects.service';
import { EnterpriseSolutionsService } from '../services/enterprise-solutions.service';
import { Project } from '../models/project.model';
import { EnterpriseSolution } from '../models/enterprise-solution.model';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements OnInit {
  projects: Project[] = [];
  filteredProjects: Project[] = [];
  enterpriseSolutions: EnterpriseSolution[] = [];
  categories: string[] = [];
  subcategories: string[] = [];
  enterpriseModalSubcategories: string[] = []; // Subcategories for enterprise solution modal
  maturityLevels: string[] = [];
  
  selectedMaturity: string = '';
  selectedCategory: string = '';
  selectedSubcategory: string = '';
  
  loading = false;
  error: string | null = null;
  success: string | null = null;
  
  showEnterpriseModal = false;
  showAllSolutionsModal = false;
  editingSolution: EnterpriseSolution | null = null;
  enterpriseForm: EnterpriseSolution = {
    category: '',
    name: '',
    description: '',
    websiteUrl: '',
    cncfProjectUsed: '',
    additionalInfo: '',
    subcategories: []
  };

  constructor(
    private projectsService: ProjectsService,
    private enterpriseSolutionsService: EnterpriseSolutionsService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.error = null;

    // Load projects
    this.projectsService.getProjects(
      this.selectedMaturity, 
      this.selectedCategory, 
      this.selectedSubcategory
    ).subscribe({
      next: (projects) => {
        this.projects = projects;
        this.filteredProjects = projects;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load projects: ' + err.message;
        this.loading = false;
      }
    });

    // Load categories
    this.projectsService.getCategories()
      .subscribe({
        next: (categories) => {
          this.categories = categories;
        },
        error: (err) => {
          console.error('Failed to load categories:', err);
        }
      });

    // Load maturity levels
    this.projectsService.getMaturityLevels()
      .subscribe({
        next: (levels) => {
          this.maturityLevels = levels.filter(level => level && level.trim() !== '');
        },
        error: (err) => {
          console.error('Failed to load maturity levels:', err);
        }
      });

    // Load subcategories when category changes
    this.loadSubcategories();

    // Load enterprise solutions
    this.loadEnterpriseSolutions();
  }

  loadSubcategories() {
    if (!this.selectedCategory || this.selectedCategory.trim() === '') {
      // Load all subcategories if no category selected
      this.projectsService.getSubcategories()
        .subscribe({
          next: (subcategories) => {
            this.subcategories = subcategories;
            if (this.selectedSubcategory && !subcategories.includes(this.selectedSubcategory)) {
              this.selectedSubcategory = '';
            }
          },
          error: (err) => {
            console.error('Failed to load subcategories:', err);
            this.subcategories = [];
          }
        });
    } else {
      // Load subcategories for selected category
      this.projectsService.getSubcategories(this.selectedCategory)
        .subscribe({
          next: (subcategories) => {
            this.subcategories = subcategories;
            // Reset subcategory selection if current category doesn't have it
            if (this.selectedSubcategory && !subcategories.includes(this.selectedSubcategory)) {
              this.selectedSubcategory = '';
            }
          },
          error: (err) => {
            console.error('Failed to load subcategories:', err);
            this.subcategories = [];
          }
        });
    }
  }

  onCategoryChange() {
    this.selectedSubcategory = ''; // Reset subcategory when category changes
    this.loadSubcategories();
  }

  loadEnterpriseSolutions() {
    this.enterpriseSolutionsService.getEnterpriseSolutions()
      .subscribe({
        next: (solutions) => {
          this.enterpriseSolutions = solutions;
        },
        error: (err) => {
          console.error('Failed to load enterprise solutions:', err);
        }
      });
  }

  applyFilters() {
    this.loadData();
  }

  clearFilters() {
    this.selectedMaturity = '';
    this.selectedCategory = '';
    this.selectedSubcategory = '';
    this.loadData();
  }

  syncLandscape() {
    this.loading = true;
    this.error = null;
    this.success = null;

    this.projectsService.syncLandscape()
      .subscribe({
        next: (result) => {
          this.success = `Successfully synced ${result.imported || 0} projects`;
          this.loading = false;
          this.loadData();
        },
        error: (err) => {
          this.error = 'Failed to sync landscape: ' + err.message;
          this.loading = false;
        }
      });
  }

  getMaturityBadgeClass(maturity: string): string {
    const maturityLower = maturity.toLowerCase();
    if (maturityLower.includes('sandbox')) return 'badge-sandbox';
    if (maturityLower.includes('incubating')) return 'badge-incubating';
    if (maturityLower.includes('graduated')) return 'badge-graduated';
    return 'badge-category';
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return 'N/A';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString();
  }

  // Enterprise Solutions Management
  openEnterpriseModal(category?: string) {
    this.enterpriseForm = {
      category: category || this.selectedCategory || '',
      name: '',
      description: '',
      websiteUrl: '',
      cncfProjectUsed: '',
      additionalInfo: '',
      subcategories: []
    };
    this.editingSolution = null;
    this.showEnterpriseModal = true;
    // Load subcategories for the selected category
    // Use setTimeout to ensure the modal is rendered first
    setTimeout(() => {
      this.loadSubcategoriesForModal();
    }, 100);
  }
  
  loadSubcategoriesForModal() {
    const category = this.enterpriseForm.category;
    if (category && category.trim() !== '') {
      this.projectsService.getSubcategories(category)
        .subscribe({
          next: (subcategories) => {
            this.enterpriseModalSubcategories = subcategories;
          },
          error: (err) => {
            console.error('Failed to load subcategories for modal:', err);
            this.enterpriseModalSubcategories = [];
          }
        });
    } else {
      // Load all subcategories if no category selected
      this.projectsService.getSubcategories()
        .subscribe({
          next: (subcategories) => {
            this.enterpriseModalSubcategories = subcategories;
          },
          error: (err) => {
            console.error('Failed to load subcategories:', err);
            this.enterpriseModalSubcategories = [];
          }
        });
    }
  }
  
  toggleSubcategory(subcategory: string) {
    if (!this.enterpriseForm.subcategories) {
      this.enterpriseForm.subcategories = [];
    }
    const index = this.enterpriseForm.subcategories.indexOf(subcategory);
    if (index > -1) {
      this.enterpriseForm.subcategories.splice(index, 1);
    } else {
      this.enterpriseForm.subcategories.push(subcategory);
    }
  }
  
  isSubcategorySelected(subcategory: string): boolean {
    if (!this.enterpriseForm.subcategories || this.enterpriseForm.subcategories.length === 0) {
      return false;
    }
    return this.enterpriseForm.subcategories?.includes(subcategory) || false;
  }
  
  onEnterpriseCategoryChange() {
    // Reset subcategories when category changes
    this.enterpriseForm.subcategories = [];
    this.loadSubcategoriesForModal();
  }
  
  selectAllSubcategories() {
    if (!this.enterpriseForm.subcategories) {
      this.enterpriseForm.subcategories = [];
    }
    // If all are selected, deselect all. Otherwise, select all.
    const allSelected = this.enterpriseModalSubcategories.every(sub => 
      this.enterpriseForm.subcategories?.includes(sub) || false
    );
    
    if (allSelected) {
      this.enterpriseForm.subcategories = [];
    } else {
      this.enterpriseForm.subcategories = [...this.enterpriseModalSubcategories];
    }
  }
  
  areAllSubcategoriesSelected(): boolean {
    if (!this.enterpriseForm.subcategories || this.enterpriseForm.subcategories.length === 0) {
      return false;
    }
    if (this.enterpriseModalSubcategories.length === 0) {
      return false;
    }
    return this.enterpriseModalSubcategories.every(sub => 
      this.enterpriseForm.subcategories?.includes(sub) || false
    );
  }
  
  onSubcategoryHover(event: Event, subcat: string, isEntering: boolean): void {
    const target = event.currentTarget as HTMLElement;
    if (!target) return;
    
    const isSelected = this.isSubcategorySelected(subcat);
    if (isEntering) {
      target.style.background = isSelected ? '#d4e5ff' : '#f8f9fa';
    } else {
      target.style.background = isSelected ? '#e7f3ff' : 'transparent';
    }
  }
  
  openAllSolutionsModal() {
    console.log('Opening all solutions modal, count:', this.enterpriseSolutions.length);
    this.showAllSolutionsModal = true;
  }
  
  closeAllSolutionsModal() {
    this.showAllSolutionsModal = false;
  }

  editEnterpriseSolution(solution: EnterpriseSolution) {
    this.editingSolution = solution;
    this.enterpriseForm = { 
      ...solution,
      subcategories: solution.subcategories ? [...solution.subcategories] : []
    };
    this.showEnterpriseModal = true;
    // Load subcategories for the selected category
    this.loadSubcategoriesForModal();
  }

  closeEnterpriseModal() {
    this.showEnterpriseModal = false;
    this.editingSolution = null;
    this.enterpriseForm = {
      category: '',
      name: '',
      description: '',
      websiteUrl: '',
      cncfProjectUsed: '',
      additionalInfo: '',
      subcategories: []
    };
  }

  saveEnterpriseSolution() {
    if (!this.enterpriseForm.name || !this.enterpriseForm.category) {
      this.error = 'Name and category are required';
      return;
    }

    if (this.editingSolution) {
      this.enterpriseSolutionsService.updateEnterpriseSolution(
        this.editingSolution._id!,
        this.enterpriseForm
      ).subscribe({
        next: () => {
          this.success = 'Enterprise solution updated successfully';
          this.closeEnterpriseModal();
          this.loadEnterpriseSolutions();
        },
        error: (err) => {
          this.error = 'Failed to update solution: ' + err.message;
        }
      });
    } else {
      this.enterpriseSolutionsService.createEnterpriseSolution(this.enterpriseForm)
        .subscribe({
          next: () => {
            this.success = 'Enterprise solution added successfully';
            this.closeEnterpriseModal();
            this.loadEnterpriseSolutions();
          },
          error: (err) => {
            this.error = 'Failed to add solution: ' + err.message;
          }
        });
    }
  }

  deleteEnterpriseSolution(id: string) {
    if (confirm('Are you sure you want to delete this enterprise solution?')) {
      this.enterpriseSolutionsService.deleteEnterpriseSolution(id)
        .subscribe({
          next: () => {
            this.success = 'Enterprise solution deleted successfully';
            this.loadEnterpriseSolutions();
          },
          error: (err) => {
            this.error = 'Failed to delete solution: ' + err.message;
          }
        });
    }
  }

  getEnterpriseSolutionsForProject(project: Project): EnterpriseSolution[] {
    // Match by category and optionally by CNCF project name and subcategory
    return this.enterpriseSolutions.filter(s => {
      const categoryMatch = s.category === project.category;
      const projectMatch = s.cncfProjectUsed && 
        project.name.toLowerCase().includes(s.cncfProjectUsed.toLowerCase());
      
      // Check subcategory matching
      let subcategoryMatch = true; // Default: show for all if no subcategories specified
      
      // If subcategories array exists and has items, check for match
      if (s.subcategories && s.subcategories.length > 0) {
        // Solution has specific subcategories selected
        if (project.subcategory) {
          // Project has a subcategory - check if it matches
          subcategoryMatch = s.subcategories.includes(project.subcategory);
        } else {
          // Project has no subcategory, but solution has subcategories specified
          // Don't show this solution for projects without subcategories
          subcategoryMatch = false;
        }
      }
      // If subcategories array is empty or undefined, show for all (subcategoryMatch remains true)
      
      return (categoryMatch || projectMatch) && subcategoryMatch;
    });
  }
}

