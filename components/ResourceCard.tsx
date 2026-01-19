
import React from 'react';
import { Link } from 'react-router-dom';
import { PhysicsResource } from '../types';
import { Scale, Activity, Beaker, Share2, Edit3, Trash2, ArrowUpRight } from 'lucide-react';

interface ResourceCardProps {
  resource: PhysicsResource;
  isAdmin: boolean;
  onDelete: (id: string) => void;
  onEdit?: (resource: PhysicsResource) => void;
}

const ResourceCard: React.FC<ResourceCardProps> = ({ resource, isAdmin, onDelete, onEdit }) => {
  const getIcon = () => {
    const title = resource.title.toLowerCase();
    if (title.includes('gravit')) return <Scale className="w-12 h-12 text-emerald-400" />;
    if (title.includes('wave') || title.includes('oscillat')) return <Activity className="w-12 h-12 text-sky-400" />;
    return <Beaker className="w-12 h-12 text-indigo-400" />;
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/#/play/${resource.id}`);
      alert('Simulation link copied!');
    } catch (err) {
      console.warn('Clipboard restricted');
    }
  };

  return (
    <div className="group relative bg-[#0F172A] rounded-[2.5rem] border border-white/5 p-8 shadow-2xl hover:shadow-indigo-500/10 hover:border-indigo-500/20 transition-all duration-500 flex flex-col h-full">
      <div className="flex justify-between items-start mb-8">
        <div className="p-5 bg-white/5 rounded-3xl border border-white/10 group-hover:bg-indigo-500/10 group-hover:border-indigo-500/30 transition-all duration-500">
          {getIcon()}
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <>
              <button onClick={() => onEdit?.(resource)} className="p-2.5 bg-white/5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                <Edit3 size={16} />
              </button>
              <button onClick={() => onDelete(resource.id)} className="p-2.5 bg-white/5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
                <Trash2 size={16} />
              </button>
            </>
          )}
          <button onClick={handleShare} className="p-2.5 bg-white/5 rounded-xl text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all">
            <Share2 size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-3 py-1 rounded-lg border border-indigo-500/20">
            {resource.category}
          </span>
        </div>
        <h3 className="font-black text-white text-xl mb-3 tracking-tight group-hover:text-indigo-300 transition-colors">
          {resource.title}
        </h3>
        <p className="text-slate-400 text-sm line-clamp-2 leading-relaxed font-medium mb-8">
          {resource.description}
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-3 pt-6 border-t border-white/5">
        <Link to={`/play/${resource.id}`} className="flex items-center justify-center gap-2 py-3.5 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-500 transition-all">
          Lab Profile
        </Link>
        <a href={resource.contentUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 py-3.5 bg-white/5 text-slate-300 border border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all">
          Quick Launch <ArrowUpRight size={14} />
        </a>
      </div>
    </div>
  );
};

export default ResourceCard;
