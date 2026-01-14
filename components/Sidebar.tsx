
import React from 'react';
import { Link } from 'react-router-dom';
import { Category, UserRole } from '../types';

interface SidebarProps {
  categories: Category[];
  activeCategory: string | null;
  onCategorySelect: (id: string | null) => void;
  onLogout: () => void;
  userName: string;
  userRole: UserRole;
}

const Sidebar: React.FC<SidebarProps> = ({ categories, activeCategory, onCategorySelect, onLogout, userName, userRole }) => {
  return (
    <aside className="w-72 bg-white border-r border-slate-200 flex flex-col h-full overflow-hidden">
      <div className="p-6 border-b border-slate-100">
        <Link to="/" onClick={() => onCategorySelect(null)} className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.691.346a6 6 0 01-3.86.517l-2.388-.477a2 2 0 00-1.022.547l-1.168 1.168a2 2 0 001.414 3.414h15.428a2 2 0 001.414-3.414l-1.168-1.168z"></path></svg>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-700 to-cyan-600 bg-clip-text text-transparent">Phys Phrontier</span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-hide">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2 mb-4">Core Library</h3>
        <nav className="space-y-1">
          <button 
            onClick={() => onCategorySelect(null)}
            className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-colors ${activeCategory === null ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <span>📚</span> All Resources
          </button>
          
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onCategorySelect(cat.name)}
              className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-colors ${activeCategory === cat.name ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <span className="text-xl">{cat.icon}</span>
              <span className="truncate">{cat.name}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-4">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
            {userName.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">{userName}</p>
            <p className="text-xs text-slate-500 capitalize">{userRole.toLowerCase()}</p>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 py-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors font-semibold text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
