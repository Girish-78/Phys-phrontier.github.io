
import React from 'react';
import { PhysicsResource } from '../types';
import ResourceCard from './ResourceCard';

interface DashboardProps {
  resources: PhysicsResource[];
  isAdmin: boolean;
  onDelete: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ resources, isAdmin, onDelete }) => {
  return (
    <div>
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900">Explore Resources</h2>
          <p className="text-slate-500 mt-1">Found {resources.length} interactive learning materials</p>
        </div>
      </div>

      {resources.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
          <h3 className="text-xl font-bold text-slate-800">No results found</h3>
          <p className="text-slate-500 max-w-xs mt-2">Try adjusting your search or category filters to find what you're looking for.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {resources.map((res) => (
            <ResourceCard key={res.id} resource={res} isAdmin={isAdmin} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
