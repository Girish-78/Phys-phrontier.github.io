
import React from 'react';
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
    description: 'Explore trajectories with varying velocity and angles.',
    userGuide: 'Adjust the sliders to set velocity and launch angle. Click "Fire" to observe the path.',
    learningOutcomes: ['Understand parabolic paths', 'Relate range to launch angle'],
    contentUrl: 'https://phet.colorado.edu/sims/html/projectile-motion/latest/projectile-motion_en.html',
    createdAt: '2024-05-01'
  },
  {
    id: '2',
    title: 'Surya Siddhanta: Planetary Models',
    category: 'Astronomy',
    subCategory: 'Indian Astronomy (Surya Siddhanta)',
    type: ResourceType.SIMULATION,
    author: 'Astronomy Dept.',
    description: 'A visualization of the epicycle models from ancient Indian texts.',
    userGuide: 'Select a planet to see its Manda and Shighra epicycles.',
    learningOutcomes: ['Understand Indian planetary models', 'Visualize epicycles'],
    contentUrl: 'https://www.google.com/logos/2010/lunar_eclipse-hp.html', // Placeholder
    createdAt: '2024-05-02'
  },
  {
    id: '3',
    title: 'Ray Optics Cheat Sheet',
    category: 'Optics',
    subCategory: 'Ray Optics',
    type: ResourceType.CHEATSHEET,
    author: 'Physics Phrontier Team',
    description: 'Concise summary of lens and mirror formulas.',
    userGuide: 'Download and keep handy for quick revision.',
    learningOutcomes: ['Master lens formulas', 'Quick sign convention guide'],
    contentUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    createdAt: '2024-05-03'
  }
];
