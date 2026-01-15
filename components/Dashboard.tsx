
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
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter leading-none mb-3">Discovery Engine</h2>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">Showing {resources.length} active learning modules</p>
        </div>
        <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"></path></svg>
            </div>
            <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg>
            </div>
        </div>
      </div>

      {resources.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center bg-white rounded-[3rem] border border-slate-100 shadow-sm">
          <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-8 border border-slate-100">
            <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Empty Discovery</h3>
          <p className="text-slate-500 max-w-xs mx-auto font-medium">We couldn't find any resources matching your criteria. Try resetting your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8">
          {resources.map((res) => (
            <ResourceCard key={res.id} resource={res} isAdmin={isAdmin} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
