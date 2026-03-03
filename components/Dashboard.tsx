
import React from 'react';
import { PhysicsResource } from '../types';
import ResourceCard from './ResourceCard';

interface DashboardProps {
  resources: PhysicsResource[];
  isAdmin: boolean;
  onDelete: (id: string) => void;
  onEdit: (resource: PhysicsResource) => void;
  loading: boolean;
  error?: string | null;
  onRetry?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ resources, isAdmin, onDelete, onEdit, loading, error, onRetry }) => {
  if (loading && resources.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-6 font-black text-indigo-400 uppercase tracking-widest text-[10px]">Cloud Lab Sync Active...</p>
      </div>
    );
  }

  if (error && resources.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-40 text-center">
        <div className="w-16 h-16 bg-red-500/10 rounded-3xl flex items-center justify-center mb-8 border border-red-500/20">
          <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
        </div>
        <h3 className="text-2xl font-black text-white mb-4 tracking-tight">Sync Failure</h3>
        <p className="text-slate-400 max-w-md mx-auto font-medium mb-8">{error}</p>
        <button onClick={onRetry} className="px-8 py-4 bg-white text-indigo-950 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all active:scale-95">
          Retry Connection
        </button>
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
