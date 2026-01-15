
import React from 'react';
import { Link } from 'react-router-dom';
import { PhysicsResource, ResourceType } from '../types';

interface ResourceCardProps {
  resource: PhysicsResource;
  isAdmin: boolean;
  onDelete: (id: string) => void;
}

const ResourceCard: React.FC<ResourceCardProps> = ({ resource, isAdmin, onDelete }) => {
  const getBadgeStyles = (type: ResourceType) => {
    switch (type) {
      case ResourceType.SIMULATION: return 'bg-indigo-500 text-white';
      case ResourceType.WORKSHEET: return 'bg-emerald-500 text-white';
      case ResourceType.CHEATSHEET: return 'bg-orange-500 text-white';
      default: return 'bg-slate-500 text-white';
    }
  };

  // Improved fallback logic based on category
  const getPlaceholder = (category: string) => {
    const maps: Record<string, string> = {
      'Mechanics': 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&q=80&w=800',
      'Astronomy': 'https://images.unsplash.com/photo-1464802686167-b939a6910659?auto=format&fit=crop&q=80&w=800',
      'Optics': 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&q=80&w=800',
      'Modern Physics': 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=800',
      'Thermodynamics': 'https://images.unsplash.com/photo-1532187875605-7fe359843f68?auto=format&fit=crop&q=80&w=800'
    };
    return maps[category] || 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&q=80&w=800';
  };

  const thumbnail = resource.thumbnailUrl || getPlaceholder(resource.category);

  return (
    <div className="group relative bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 animate-in fade-in zoom-in-95 duration-700">
      <div className="h-56 relative overflow-hidden bg-slate-100">
        <img 
          src={thumbnail} 
          alt={resource.title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 brightness-95 group-hover:brightness-105" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-60"></div>
        
        <div className="absolute top-4 left-4 z-10">
          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg ${getBadgeStyles(resource.type)}`}>
            {resource.type}
          </span>
        </div>

        {isAdmin && (
          <button 
            onClick={(e) => { e.preventDefault(); onDelete(resource.id); }}
            className="absolute top-4 right-4 bg-white/20 backdrop-blur-md p-2.5 rounded-2xl text-white hover:bg-red-500 hover:scale-110 transition-all z-10 border border-white/20"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
          </button>
        )}

        <div className="absolute bottom-4 left-5 right-5 z-10 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 text-xs font-black">
                    {resource.author.charAt(0)}
                </div>
                <span className="text-white text-xs font-bold opacity-90 truncate max-w-[120px]">{resource.author}</span>
            </div>
        </div>
      </div>

      <div className="p-7">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-lg">{resource.category}</span>
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-tighter truncate">{resource.subCategory}</span>
        </div>
        <h3 className="font-black text-slate-900 text-xl mb-3 leading-tight tracking-tight line-clamp-1 group-hover:text-indigo-600 transition-colors">{resource.title}</h3>
        <p className="text-slate-500 text-sm line-clamp-2 mb-6 leading-relaxed font-medium">{resource.description}</p>
        
        <Link 
          to={`/play/${resource.id}`}
          className="w-full bg-slate-50 group-hover:bg-indigo-600 group-hover:text-white text-slate-900 py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all duration-300 shadow-inner group-hover:shadow-indigo-200"
        >
          {resource.type === ResourceType.SIMULATION ? 'Launch Lab' : 'View Module'}
          <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
        </Link>
      </div>
    </div>
  );
};

export default ResourceCard;
