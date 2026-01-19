
export enum UserRole {
  ADMIN = 'ADMIN',
  STUDENT = 'STUDENT'
}

// Added missing ResourceType enum members to resolve property 'CHEATSHEET' and 'WORKSHEET' errors
export enum ResourceType {
  SIMULATION = 'Simulation',
  WORKSHEET = 'Worksheet',
  CHEATSHEET = 'Cheatsheet'
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
  contentUrl: string; // URL for simulation (iframe)
  thumbnailUrl?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  subCategories: string[];
}
