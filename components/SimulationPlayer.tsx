
import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { PhysicsResource } from '../types';
import { Scale, Activity, Beaker, ExternalLink, ArrowLeft } from 'lucide-react';

interface SimulationPlayerProps {
  resources: PhysicsResource[];
}

const SimulationPlayer: React.FC<SimulationPlayerProps> = ({ resources }) => {
  const { id } = useParams<{ id: string }>();
  const resource = resources.find(r => r.id === id);

  if (!resource) return <Navigate to="/" />;

  const getIcon = () => {
    const title = resource.title.toLowerCase();
    if (title.includes('gravit')) return <Scale className="w-16 h-16 text-emerald-400" />;
    if (title.includes('wave') || title.includes('oscillat')) return <Activity className="w-16 h-16 text-sky-400" />;
    return <Beaker className="w-16 h-16 text-indigo-400" />;
  };

  const outcomes = Array.isArray(resource.learningOutcomes) ? resource.learningOutcomes : [];

  return (
    <div className="max-w-7xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="mb-12">
        <Link to="/" className="inline-flex items-center gap-3 text-slate-400 font-black text-[10px] uppercase tracking-widest mb-8 hover:text-white transition-all bg-white/5 border border-white/10 px-6 py-3 rounded-full">
          <ArrowLeft size={14} /> Back to Library
        </Link>
        <div className="flex flex-col md:flex-row md:items-center gap-8">
          <div className="p-6 bg-white/5 border border-white/10 rounded-[2.5rem] shadow-2xl">
            {getIcon()}
          </div>
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="font-black text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-lg text-[10px] uppercase tracking-[0.2em] border border-indigo-500/20">{resource.category}</span>
              <span className="text-xs font-bold text-slate-500">By {resource.author}</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tighter leading-none">{resource.title}</h1>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-8">
          <div className="relative aspect-video bg-black rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white/5">
            <iframe src={resource.contentUrl} className="w-full h-full border-none" title={resource.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
          </div>
          
          <div className="bg-[#0F172A] rounded-[3rem] p-10 border border-white/5 shadow-2xl">
            <h3 className="text-xl font-black text-white mb-6 uppercase tracking-widest text-[12px] text-indigo-400">Mission Parameters</h3>
            <p className="text-slate-400 leading-relaxed text-lg font-medium">{resource.description}</p>
            
            <div className="mt-12 flex flex-wrap gap-4">
               <a href={resource.contentUrl} target="_blank" rel="noopener noreferrer" className="px-10 py-5 bg-indigo-600 text-white rounded-full font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:scale-[1.02] transition-all">
                  Launch Full Lab <ExternalLink size={16} />
               </a>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          {outcomes.length > 0 && (
            <div className="bg-gradient-to-br from-indigo-600/20 to-indigo-900/20 rounded-[3rem] p-10 border border-indigo-500/10 backdrop-blur-xl">
              <h3 className="text-sm font-black text-white mb-8 uppercase tracking-[0.3em] text-indigo-300">Objectives</h3>
              <ul className="space-y-6">
                {outcomes.map((outcome, idx) => (
                  <li key={idx} className="flex gap-4 group">
                    <div className="w-8 h-8 min-w-[2rem] bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400 text-[10px] font-black border border-indigo-500/20 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                      {idx + 1}
                    </div>
                    <span className="font-bold text-slate-300 leading-tight pt-1 text-sm">{outcome}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {resource.userGuide && (
            <div className="bg-[#0F172A] rounded-[3rem] p-10 border border-white/5">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6">Briefing</h3>
              <div className="text-slate-400 text-sm font-medium italic leading-relaxed">"{resource.userGuide}"</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimulationPlayer;
