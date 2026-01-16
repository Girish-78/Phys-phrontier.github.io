
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PhysicsResource, ResourceType } from '../types';

interface ResourceCardProps {
  resource: PhysicsResource;
  isAdmin: boolean;
  onDelete: (id: string) => void;
  onEdit?: (resource: PhysicsResource) => void;
}

const ResourceCard: React.FC<ResourceCardProps> = ({ resource, isAdmin, onDelete, onEdit }) => {
  const navigate = useNavigate();

  const getBadgeStyles = (type: ResourceType) => {
    switch (type) {
      case ResourceType.SIMULATION: return 'bg-indigo-600 text-white';
      case ResourceType.WORKSHEET: return 'bg-emerald-600 text-white';
      case ResourceType.CHEATSHEET: return 'bg-amber-600 text-white';
      default: return 'bg-slate-600 text-white';
    }
  };

  const getThumbnailUrl = () => {
    if (resource.thumbnailUrl && (resource.thumbnailUrl.startsWith('http') || resource.thumbnailUrl.startsWith('data:image'))) {
      return resource.thumbnailUrl;
    }
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

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: resource.title,
          text: `Practice physics with this ${resource.type}: ${resource.description}`,
          url: resource.contentUrl,
        });
      } else {
        await navigator.clipboard.writeText(resource.contentUrl);
        alert('Resource link copied to clipboard!');
      }
    } catch (err) {
      console.warn('Share feature restricted or cancelled.');
    }
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const link = document.createElement('a');
      link.href = resource.contentUrl;
      link.download = `${resource.title.replace(/\s+/g, '_')}_Phrontier`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      window.open(resource.contentUrl, '_blank');
    }
  };

  return (
    <div className="group relative bg-[#0F172A] rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl hover:shadow-indigo-500/20 hover:-translate-y-3 transition-all duration-500 animate-in fade-in zoom-in-95">
      <div className="h-56 sm:h-64 relative overflow-hidden">
        <img 
          src={getThumbnailUrl()} 
          alt={resource.title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 brightness-[0.8] group-hover:brightness-100" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-transparent opacity-90"></div>
        
        <div className="absolute top-6 left-6 z-10 flex flex-col gap-2">
          <span className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.25em] shadow-2xl ${getBadgeStyles(resource.type)}`}>
            {resource.type}
          </span>
        </div>

        {isAdmin && (
          <div className="absolute top-6 right-6 z-20 flex gap-2">
            <button 
              onClick={(e) => { 
                e.preventDefault(); 
                e.stopPropagation();
                if(onEdit) {
                  onEdit(resource);
                  navigate('/upload');
                }
              }}
              className="bg-black/40 backdrop-blur-xl p-3 rounded-2xl text-white hover:bg-indigo-600 transition-all border border-white/10"
              title="Edit Resource"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
            </button>
            <button 
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(resource.id); }}
              className="bg-black/40 backdrop-blur-xl p-3 rounded-2xl text-white hover:bg-red-600 hover:scale-110 transition-all border border-white/10"
              title="Delete Resource"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
          </div>
        )}
      </div>

      <div className="p-9">
        <div className="flex items-center justify-between mb-5">
          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] bg-indigo-500/10 px-4 py-2 rounded-xl border border-indigo-500/20">{resource.category}</span>
          <div className="flex gap-1">
            <button 
              onClick={handleShare}
              className="p-2.5 text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-xl transition-all"
              title="Copy Link / Share"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 100-2.684 3 3 0 000 2.684zm0 12.684a3 3 0 100-2.684 3 3 0 000 2.684z"></path></svg>
            </button>
            {resource.type !== ResourceType.SIMULATION && (
              <button 
                onClick={handleDownload}
                className="p-2.5 text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-xl transition-all"
                title="Download Material"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
              </button>
            )}
          </div>
        </div>
        <h3 className="font-black text-white text-2xl mb-4 leading-tight tracking-tight line-clamp-1 group-hover:text-indigo-400 transition-colors">{resource.title}</h3>
        <p className="text-slate-400 text-sm line-clamp-2 mb-10 leading-relaxed font-medium">{resource.description}</p>
        
        <Link 
          to={`/play/${resource.id}`}
          className="w-full bg-[#1E293B] group-hover:bg-indigo-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all duration-300 shadow-xl"
        >
          {resource.type === ResourceType.SIMULATION ? 'Launch Simulator' : 'Explore Concept'}
          <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
        </Link>
      </div>
    </div>
  );
};

export default ResourceCard;
