export interface Project {
  _id?: string;
  name: string;
  category: string;
  subcategory?: string;
  maturityLevel: string;
  githubStars?: number;
  lastUpdated?: Date;
  homepageUrl?: string;
  repoUrl?: string;
  logo?: string;
  description?: string;
  extra?: {
    github?: string;
    url?: string;
    twitter?: string;
  };
}

