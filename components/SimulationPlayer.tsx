
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
  const isDataUrl = resource.contentUrl?.startsWith('data:');

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: resource.title,
          text: `Check out this physics resource: ${resource.description}`,
          url: isDataUrl ? window.location.href : resource.contentUrl,
        });
      } else {
        const urlToCopy = isDataUrl ? window.location.href : resource.contentUrl;
        await navigator.clipboard.writeText(urlToCopy);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      console.warn('Share restricted');
    }
  };

  const outcomes = Array.isArray(resource.learningOutcomes) ? resource.learningOutcomes : [];

  return (
    <div className="max-w-7xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-10">
        <div>
          <Link to="/" className="inline-flex items-center gap-2 text-indigo-400 font-black text-xs uppercase tracking-widest mb-4 hover:gap-3 transition-all bg-white/5 border border-white/10 px-5 py-2.5 rounded-full">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7 7-7"></path></svg>
            Back to Library
          </Link>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tighter leading-none mb-4">{resource.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-slate-400">
            <span className="font-black text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-lg text-[10px] uppercase tracking-wider">{resource.category}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
            <span className="text-sm font-bold uppercase tracking-tighter text-slate-500">{resource.type}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
            <span className="text-sm font-medium">By {resource.author}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          {!isDataUrl && (
            <a 
              href={resource.contentUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none bg-[#1E293B] border border-white/5 text-white px-8 py-4.5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
              Direct Access
            </a>
          )}
          <button 
            onClick={handleShare}
            className="p-4.5 bg-indigo-600 text-white rounded-[1.5rem] shadow-2xl shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all"
          >
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 100-2.684 3 3 0 000 2.684zm0 12.684a3 3 0 100-2.684 3 3 0 000 2.684z"></path></svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-8">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-[2.5rem] blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
            <div className="relative aspect-video bg-[#020617] rounded-[2.25rem] overflow-hidden shadow-2xl border-4 border-white/5">
                {isSimulation ? (
                <iframe 
                  src={resource.contentUrl} 
                  className="w-full h-full border-none"
                  title={resource.title}
                  onLoad={() => {
                      setTimeout(() => setShowErrorHelp(true), 3000);
                  }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
                ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-[#0F172A] text-white p-12 text-center">
                    <div className="w-24 h-24 bg-indigo-500/10 rounded-[2rem] flex items-center justify-center mb-8 border border-indigo-500/20">
                        <svg className="w-12 h-12 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    </div>
                    <h2 className="text-3xl font-black mb-4 tracking-tight">Study Material Ready</h2>
                    <p className="text-slate-400 mb-10 max-w-sm font-medium">This {resource.type} is ready for review. You can view it directly or download it for offline study.</p>
                    <div className="flex gap-4">
                      <a 
                        href={resource.contentUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-2xl shadow-indigo-500/20"
                      >
                        View {resource.type}
                      </a>
                    </div>
                </div>
                )}
            </div>
          </div>

          {isSimulation && showErrorHelp && (
            <div className="flex items-start gap-4 p-6 bg-indigo-500/5 border border-indigo-500/10 rounded-[2rem] shadow-sm animate-in slide-in-from-top-4">
              <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <div>
                <p className="font-black text-indigo-300 text-[10px] uppercase tracking-widest mb-1">Display Issues?</p>
                <p className="text-slate-400 text-sm font-medium leading-relaxed">
                  If the simulation is not loading, it might be due to security restrictions. Try opening it in a new window:
                  <a href={resource.contentUrl} target="_blank" rel="noopener noreferrer" className="ml-2 font-black underline text-indigo-400 hover:text-indigo-300 transition-colors">
                    Open Lab Directly
                  </a>
                </p>
              </div>
            </div>
          )}
          
          <div className="bg-[#0F172A] rounded-[2.5rem] p-10 border border-white/5 shadow-2xl relative overflow-hidden">
            <h3 className="text-xl font-black text-white mb-6 flex items-center gap-3 relative z-10">
              <span className="w-10 h-10 bg-indigo-600/10 border border-indigo-600/20 text-indigo-400 rounded-xl flex items-center justify-center text-lg">📝</span>
              Abstract
            </h3>
            <p className="text-slate-400 leading-relaxed text-lg font-medium relative z-10">{resource.description}</p>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          {isSimulation && outcomes.length > 0 && (
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[2.5rem] p-10 shadow-2xl shadow-indigo-500/20 relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full group-hover:scale-110 transition-transform"></div>
              <h3 className="text-xl font-black text-white mb-8 flex items-center gap-3">
                <svg className="w-6 h-6 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
                Targets
              </h3>
              <ul className="space-y-6">
                {outcomes.map((outcome, idx) => (
                  <li key={idx} className="flex gap-4 group/item">
                    <div className="w-8 h-8 min-w-[2rem] bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center text-white text-[10px] font-black border border-white/10 group-hover/item:scale-110 transition-transform">
                      {idx + 1}
                    </div>
                    <span className="font-bold text-indigo-50 leading-tight pt-1 text-sm">{outcome}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {isSimulation && resource.userGuide && (
            <div className="bg-[#0F172A] rounded-[2.5rem] p-10 border border-white/5 shadow-2xl relative overflow-hidden">
              <h3 className="text-xl font-black text-white mb-6 flex items-center gap-3">
                <span className="text-indigo-400">📌</span>
                Instructions
              </h3>
              <div className="text-slate-400 text-sm leading-relaxed whitespace-pre-line bg-white/5 p-6 rounded-[2rem] border border-white/5 italic font-medium relative">
                "{resource.userGuide}"
              </div>
            </div>
          )}
          
          <div className="bg-[#0F172A] rounded-[2.5rem] p-10 border border-white/5 shadow-2xl">
             <h3 className="text-xl font-black text-white mb-6">Metadata</h3>
             <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-white/5">
                   <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Added</span>
                   <span className="text-sm font-bold text-slate-300">{resource.createdAt ? new Date(resource.createdAt).toLocaleDateString() : 'Unknown'}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-white/5">
                   <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Topic</span>
                   <span className="text-sm font-bold text-slate-300">{resource.subCategory || 'General'}</span>
                </div>
                <div className="flex justify-between items-center py-3">
                   <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Role</span>
                   <span className="text-sm font-bold text-indigo-400">Admin-Verified</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimulationPlayer;
