
import React from 'react';
import { Link } from 'react-router-dom';
import { PhysicsResource, ResourceType } from '../types';

interface ResourceCardProps {
  resource: PhysicsResource;
  isAdmin: boolean;
  onDelete: (id: string) => void;
}

const ResourceCard: React.FC<ResourceCardProps> = ({ resource, isAdmin, onDelete }) => {
  const getBadgeColor = (type: ResourceType) => {
    switch (type) {
      case ResourceType.SIMULATION: return 'bg-blue-100 text-blue-700';
      case ResourceType.WORKSHEET: return 'bg-emerald-100 text-emerald-700';
      case ResourceType.CHEATSHEET: return 'bg-amber-100 text-amber-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="group relative bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="h-48 relative overflow-hidden bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white">
        {resource.thumbnailUrl ? (
          <img src={resource.thumbnailUrl} alt={resource.title} className="w-full h-full object-cover" />
        ) : (
          <div className="p-8 text-center flex flex-col items-center">
             <div className="text-5xl mb-3 transform group-hover:scale-125 transition-transform duration-500 drop-shadow-lg">
               {resource.category === 'Astronomy' ? '🪐' : '🔭'}
             </div>
             <p className="font-black text-lg leading-tight opacity-90 uppercase tracking-tighter">{resource.title}</p>
          </div>
        )}
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${getBadgeColor(resource.type)}`}>
            {resource.type}
          </span>
        </div>
        {isAdmin && (
          <button 
            onClick={(e) => { e.preventDefault(); onDelete(resource.id); }}
            className="absolute top-4 right-4 bg-white/20 backdrop-blur-md p-2 rounded-full text-white hover:bg-red-500 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
          </button>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">{resource.category}</span>
          <span className="text-slate-300">•</span>
          <span className="text-xs text-slate-500 truncate">{resource.subCategory}</span>
        </div>
        <h3 className="font-bold text-slate-900 text-lg mb-2 line-clamp-1">{resource.title}</h3>
        <p className="text-slate-500 text-sm line-clamp-2 mb-4 leading-relaxed">{resource.description}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600">
              {resource.author.charAt(0)}
            </div>
            <span className="text-xs text-slate-500 font-medium">{resource.author}</span>
          </div>
          
          <Link 
            to={`/play/${resource.id}`}
            className="text-blue-600 text-sm font-bold flex items-center gap-1 hover:underline group-hover:gap-2 transition-all"
          >
            {resource.type === ResourceType.SIMULATION ? 'Play Now' : 'View File'}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResourceCard;
