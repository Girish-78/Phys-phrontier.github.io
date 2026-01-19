
export enum UserRole {
  ADMIN = 'ADMIN',
  STUDENT = 'STUDENT'
}

export enum ResourceType {
  SIMULATION = 'Simulation'
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
  thumbnailUrl?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  subCategories: string[];
}
