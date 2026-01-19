
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
  createdAt: string;
  // Added optional thumbnailUrl to fix interface mismatch errors
  thumbnailUrl?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  subCategories: string[];
}
