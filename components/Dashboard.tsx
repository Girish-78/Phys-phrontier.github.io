
import React from 'react';
import { PhysicsResource } from '../types';
import ResourceCard from './ResourceCard';

interface DashboardProps {
  resources: PhysicsResource[];
  isAdmin: boolean;
  onDelete: (id: string) => void;
  onEdit: (resource: PhysicsResource) => void;
  loading: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ resources, isAdmin, onDelete, onEdit, loading }) => {
  if (loading && resources.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-6 font-black text-indigo-400 uppercase tracking-widest text-[10px]">Cloud Lab Sync Active...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter leading-none mb-3">Discovery Engine</h2>
          <p className="text-indigo-300 font-bold uppercase text-[10px] tracking-[0.2em]">
            {loading ? 'Refreshing Library...' : `Synchronized with browser: ${resources.length} active modules`}
          </p>
        </div>
      </div>

      {resources.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center bg-white/5 rounded-[3rem] border border-white/10 shadow-sm">
          <div className="w-24 h-24 bg-white/5 rounded-[2rem] flex items-center justify-center mb-8 border border-white/10">
            <svg className="w-10 h-10 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Empty Discovery</h3>
          <p className="text-slate-400 max-w-xs mx-auto font-medium">We couldn't find any resources matching your search. Try adjusting keywords or clearing filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8">
          {resources.map((res) => (
            <ResourceCard 
              key={res.id} 
              resource={res} 
              isAdmin={isAdmin} 
              onDelete={onDelete} 
              onEdit={onEdit} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
