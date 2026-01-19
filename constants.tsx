
import { Category, ResourceType, PhysicsResource } from './types';

export const CATEGORIES: Category[] = [
  { id: 'mechanics', name: 'Mechanics', icon: '⚡', subCategories: ['Kinematics', 'Dynamics', 'Rotation', 'Gravitation'] },
  { id: 'thermo', name: 'Thermodynamics', icon: '🔥', subCategories: ['Heat Transfer', 'Laws of Thermodynamics', 'Kinetic Theory'] },
  { id: 'waves', name: 'Waves & Oscillations', icon: '🌊', subCategories: ['SHM', 'Sound Waves', 'Wave Motion'] },
  { id: 'electricity', name: 'Electricity', icon: '💡', subCategories: ['Electrostatics', 'Current Electricity', 'Capacitance'] },
  { id: 'magnetism', name: 'Magnetism', icon: '🧲', subCategories: ['Magnetic Effects', 'EMI', 'AC Currents'] },
  { id: 'optics', name: 'Optics', icon: '🔭', subCategories: ['Ray Optics', 'Wave Optics'] },
  { id: 'modern', name: 'Modern Physics', icon: '⚛️', subCategories: ['Atoms', 'Nuclei', 'Dual Nature'] },
  { id: 'astronomy', name: 'Astronomy', icon: '🪐', subCategories: ['Indian Astronomy (Surya Siddhanta)', 'Celestial Mechanics', 'Observational Astronomy'] },
];

export const MOCK_RESOURCES: PhysicsResource[] = [
  {
    id: '1',
    title: 'Projectile Motion Explorer',
    category: 'Mechanics',
    subCategory: 'Kinematics',
    type: ResourceType.SIMULATION,
    author: 'Dr. Aryabhata',
    description: 'Explore trajectories with varying velocity and angles. Master the art of the perfect launch.',
    userGuide: 'Adjust the sliders to set velocity and launch angle. Click "Fire" to observe the path.',
    learningOutcomes: ['Understand parabolic paths', 'Relate range to launch angle', 'Calculate time of flight'],
    contentUrl: 'https://phet.colorado.edu/sims/html/projectile-motion/latest/projectile-motion_en.html',
    createdAt: '2024-05-01',
    thumbnailUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=800'
  }
];
