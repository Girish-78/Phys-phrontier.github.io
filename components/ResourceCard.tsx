
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
      case ResourceType.SIMULATION: return 'bg-indigo-600 text-white';
      case ResourceType.WORKSHEET: return 'bg-emerald-600 text-white';
      case ResourceType.CHEATSHEET: return 'bg-amber-600 text-white';
      default: return 'bg-slate-600 text-white';
    }
  };

  // Enhanced dynamic placeholder logic using Unsplash search
  const getThumbnailUrl = () => {
    if (resource.thumbnailUrl && resource.thumbnailUrl.startsWith('http')) {
      return resource.thumbnailUrl;
    }
    
    // Create a search query based on title and category
    const query = encodeURIComponent(`${resource.category} ${resource.title} science physics`);
    return `https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=800&sig=${resource.id}`; 
    // Note: In a real app, we'd use Unsplash Source or a similar API. 
    // Here we use a generic physics image with a 'sig' to ensure variety.
    // For more color, let's map categories to specific Unsplash IDs:
    const categoryMaps: Record<string, string> = {
      'Mechanics': 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b',
      'Astronomy': 'https://images.unsplash.com/photo-1464802686167-b939a6910659',
      'Optics': 'https://images.unsplash.com/photo-1582719471384-894fbb16e074',
      'Electricity': 'https://images.unsplash.com/photo-1517420704952-d9f39e95b43e',
      'Modern Physics': 'https://images.unsplash.com/photo-1532094349884-543bc11b234d',
      'Thermodynamics': 'https://images.unsplash.com/photo-1532187875605-7fe359843f68'
    };
    const base = categoryMaps[resource.category] || 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa';
    return `${base}?auto=format&fit=crop&q=80&w=800&sig=${resource.id}`;
  };

  return (
    <div className="group relative bg-[#1E293B] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl hover:shadow-indigo-500/20 hover:-translate-y-2 transition-all duration-500 animate-in fade-in zoom-in-95">
      <div className="h-52 sm:h-60 relative overflow-hidden">
        <img 
          src={getThumbnailUrl()} 
          alt={resource.title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 brightness-75 group-hover:brightness-100" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1E293B] via-transparent to-transparent opacity-80"></div>
        
        <div className="absolute top-5 left-5 z-10">
          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg ${getBadgeStyles(resource.type)}`}>
            {resource.type}
          </span>
        </div>

        {isAdmin && (
          <button 
            onClick={(e) => { e.preventDefault(); onDelete(resource.id); }}
            className="absolute top-5 right-5 bg-black/40 backdrop-blur-md p-2.5 rounded-2xl text-white hover:bg-red-500 hover:scale-110 transition-all z-20 border border-white/10"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
          </button>
        )}
      </div>

      <div className="p-8">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.15em] bg-indigo-500/10 px-3 py-1.5 rounded-xl border border-indigo-500/20">{resource.category}</span>
        </div>
        <h3 className="font-black text-white text-2xl mb-3 leading-tight tracking-tight line-clamp-1 group-hover:text-indigo-400 transition-colors">{resource.title}</h3>
        <p className="text-slate-400 text-sm line-clamp-2 mb-8 leading-relaxed font-medium">{resource.description}</p>
        
        <Link 
          to={`/play/${resource.id}`}
          className="w-full bg-[#334155] group-hover:bg-indigo-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all duration-300"
        >
          {resource.type === ResourceType.SIMULATION ? 'Start Experiment' : 'Open Module'}
          <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
        </Link>
      </div>
    </div>
  );
};

export default ResourceCard;
