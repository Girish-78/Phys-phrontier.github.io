
export enum UserRole {
  ADMIN = 'ADMIN',
  STUDENT = 'STUDENT'
}

export enum ResourceType {
  SIMULATION = 'Simulation',
  WORKSHEET = 'Worksheet',
  STUDY_MATERIAL = 'Study Material',
  VISUAL_SUMMARY = 'Visual Summary'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
}

export interface PhysicsResource {
  id: string;
  title: string;
  category: string;
  subCategory: string;
  type: ResourceType;
  author: string;
  description: string;
  userGuide: string;
  learningOutcomes: string[];
  contentUrl: string; 
  createdAt: string;
  thumbnailUrl?: string;
  keywords?: string[];
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  subCategories: string[];
}
