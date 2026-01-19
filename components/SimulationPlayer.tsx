
import React, { useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { PhysicsResource, ResourceType } from '../types';

interface SimulationPlayerProps {
  resources: PhysicsResource[];
}

const SimulationPlayer: React.FC<SimulationPlayerProps> = ({ resources }) => {
  const { id } = useParams<{ id: string }>();
  const resource = resources.find(r => r.id === id);

  if (!resource) return <Navigate to="/" />;

  const outcomes = Array.isArray(resource.learningOutcomes) ? resource.learningOutcomes : [];

  return (
    <div className="max-w-7xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-10">
        <div>
          <Link to="/" className="inline-flex items-center gap-2 text-indigo-400 font-black text-xs uppercase tracking-widest mb-4 hover:gap-3 transition-all bg-white/5 border border-white/10 px-5 py-2.5 rounded-full">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7 7-7"></path></svg>
            Library
          </Link>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tighter leading-none mb-4">{resource.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-slate-400">
            <span className="font-black text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-lg text-[10px] uppercase tracking-wider">{resource.category}</span>
            <span className="text-sm font-medium">By {resource.author}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-8">
          <div className="relative aspect-video bg-[#020617] rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white/5">
            <iframe src={resource.contentUrl} className="w-full h-full border-none" title={resource.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
          </div>
          
          <div className="bg-[#0F172A] rounded-[2.5rem] p-10 border border-white/5 shadow-2xl">
            <h3 className="text-xl font-black text-white mb-6">Abstract</h3>
            <p className="text-slate-400 leading-relaxed text-lg font-medium">{resource.description}</p>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          {outcomes.length > 0 && (
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[2.5rem] p-10 shadow-2xl">
              <h3 className="text-xl font-black text-white mb-8">Targets</h3>
              <ul className="space-y-6">
                {outcomes.map((outcome, idx) => (
                  <li key={idx} className="flex gap-4">
                    <div className="w-8 h-8 min-w-[2rem] bg-white/10 rounded-xl flex items-center justify-center text-white text-[10px] font-black border border-white/10">
                      {idx + 1}
                    </div>
                    <span className="font-bold text-indigo-50 leading-tight pt-1 text-sm">{outcome}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {resource.userGuide && (
            <div className="bg-[#0F172A] rounded-[2.5rem] p-10 border border-white/5 shadow-2xl">
              <h3 className="text-xl font-black text-white mb-6 flex items-center gap-3">
                <span className="text-indigo-400">📌</span>
                Instructions
              </h3>
              <div className="text-slate-400 text-sm italic font-medium">"{resource.userGuide}"</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimulationPlayer;
