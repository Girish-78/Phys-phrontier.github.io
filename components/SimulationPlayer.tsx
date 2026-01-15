
import React, { useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { PhysicsResource, ResourceType } from '../types';

interface SimulationPlayerProps {
  resources: PhysicsResource[];
}

const SimulationPlayer: React.FC<SimulationPlayerProps> = ({ resources }) => {
  const { id } = useParams<{ id: string }>();
  const [showErrorHelp, setShowErrorHelp] = useState(false);
  const resource = resources.find(r => r.id === id);

  if (!resource) return <Navigate to="/" />;

  const isSimulation = resource.type === ResourceType.SIMULATION;

  return (
    <div className="max-w-7xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-10">
        <div>
          <Link to="/" className="inline-flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-widest mb-4 hover:gap-3 transition-all bg-indigo-50 px-4 py-2 rounded-full">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7 7-7"></path></svg>
            Library
          </Link>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tighter leading-none mb-4">{resource.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-slate-500">
            <span className="font-extrabold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg text-xs uppercase tracking-wider">{resource.category}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
            <span className="text-sm font-bold">{resource.subCategory}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
            <span className="text-sm font-medium">By {resource.author}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <a 
            href={resource.contentUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex-1 sm:flex-none bg-white border border-slate-200 text-slate-900 px-8 py-4 rounded-[1.5rem] font-black text-sm uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
            Open Standalone
          </a>
          <button className="p-4 bg-indigo-600 text-white rounded-[1.5rem] shadow-xl shadow-indigo-100 hover:scale-105 transition-transform">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 100-2.684 3 3 0 000 2.684zm0 12.684a3 3 0 100-2.684 3 3 0 000 2.684z"></path></svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-8">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            <div className="relative aspect-video bg-black rounded-[2.25rem] overflow-hidden shadow-2xl border-8 border-white">
                {isSimulation ? (
                <>
                    <iframe 
                    src={resource.contentUrl} 
                    className="w-full h-full border-none"
                    title={resource.title}
                    onLoad={() => {
                        // After 3 seconds, if user hasn't interacted, maybe show help
                        setTimeout(() => setShowErrorHelp(true), 3000);
                    }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    ></iframe>
                </>
                ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-white p-12 text-center">
                    <div className="w-24 h-24 bg-indigo-500/20 rounded-full flex items-center justify-center mb-8 border border-indigo-500/30">
                        <svg className="w-12 h-12 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    </div>
                    <h2 className="text-3xl font-black mb-4 tracking-tight">Study Module Available</h2>
                    <p className="text-slate-400 mb-10 max-w-sm font-medium">Ready to dive into the formulas and theory? Click the button below to view the module.</p>
                    <a 
                    href={resource.contentUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20"
                    >
                    Open Full {resource.type}
                    </a>
                </div>
                )}
            </div>
          </div>

          {isSimulation && showErrorHelp && (
            <div className="flex items-start gap-4 p-6 bg-amber-50 border border-amber-200 rounded-[2rem] shadow-sm animate-in slide-in-from-top-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <div>
                <p className="font-black text-amber-900 text-sm uppercase tracking-widest mb-1">Canvas Blocked?</p>
                <p className="text-amber-800 text-sm font-medium leading-relaxed">
                  Some sources (like GitHub or EDU domains) prevent embedding. If you see a blank space or an error message above, don't worry—you can still access it:
                  <a href={resource.contentUrl} target="_blank" rel="noopener noreferrer" className="ml-1 font-black underline hover:text-amber-600 transition-colors">
                    Click here to open the lab in a direct window.
                  </a>
                </p>
              </div>
            </div>
          )}
          
          <div className="bg-white rounded-[2rem] p-10 border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -z-0"></div>
            <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3 relative z-10">
              <span className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center text-lg">💡</span>
              Module Overview
            </h3>
            <p className="text-slate-600 leading-relaxed text-lg font-medium relative z-10">{resource.description}</p>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="bg-indigo-600 rounded-[2.25rem] p-10 shadow-2xl shadow-indigo-200 relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full group-hover:scale-110 transition-transform"></div>
            <h3 className="text-xl font-black text-white mb-8 flex items-center gap-3">
              <svg className="w-6 h-6 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
              Success Criteria
            </h3>
            <ul className="space-y-6">
              {resource.learningOutcomes.map((outcome, idx) => (
                <li key={idx} className="flex gap-4 group/item">
                  <div className="w-8 h-8 min-w-[2rem] bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white text-xs font-black border border-white/20 group-hover/item:scale-110 transition-transform">
                    {idx + 1}
                  </div>
                  <span className="font-bold text-indigo-50 leading-tight pt-1">{outcome}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-[2.25rem] p-10 border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
                 <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L1 21h22L12 2zm0 3.45L19.55 19H4.45L12 5.45zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z"/></svg>
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
              <span className="text-emerald-500">📌</span>
              Quick Guide
            </h3>
            <div className="text-slate-600 text-sm leading-relaxed whitespace-pre-line bg-slate-50 p-6 rounded-3xl border border-slate-100 italic font-medium relative">
              "{resource.userGuide}"
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimulationPlayer;
