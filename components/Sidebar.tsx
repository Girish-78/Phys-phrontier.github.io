
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
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ categories, activeCategory, onCategorySelect, onLogout, userName, userRole, isOpen }) => {
  return (
    <aside className={`
      fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 flex flex-col h-full transform transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    `}>
      <div className="p-8 border-b border-slate-100">
        <Link to="/" onClick={() => onCategorySelect(null)} className="flex items-center gap-4 group">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-indigo-400 rounded-[1.25rem] flex items-center justify-center text-white shadow-xl shadow-indigo-100 group-hover:rotate-6 transition-all duration-300">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.691.346a6 6 0 01-3.86.517l-2.388-.477a2 2 0 00-1.022.547l-1.168 1.168a2 2 0 001.414 3.414h15.428a2 2 0 001.414-3.414l-1.168-1.168z"></path></svg>
          </div>
          <div>
            <span className="text-xl font-black bg-gradient-to-r from-indigo-700 to-indigo-500 bg-clip-text text-transparent block tracking-tight">Phrontier</span>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block -mt-1">Interactive Labs</span>
          </div>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-8 scrollbar-hide">
        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] px-4 mb-6 opacity-70">Main Library</h3>
        <nav className="space-y-1.5">
          <button 
            onClick={() => onCategorySelect(null)}
            className={`w-full text-left px-5 py-4 rounded-[1.25rem] flex items-center gap-4 transition-all duration-300 ${activeCategory === null ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 scale-[1.02] font-bold' : 'text-slate-600 hover:bg-slate-100 hover:pl-6'}`}
          >
            <span className="text-lg">📚</span> 
            <span className="text-sm">Explore All</span>
          </button>
          
          <div className="my-6 border-t border-slate-100 mx-4"></div>
          
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] px-4 mb-4 opacity-70">Subject Areas</h3>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onCategorySelect(cat.name)}
              className={`w-full text-left px-5 py-4 rounded-[1.25rem] flex items-center gap-4 transition-all duration-300 ${activeCategory === cat.name ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 scale-[1.02] font-bold' : 'text-slate-600 hover:bg-slate-100 hover:pl-6'}`}
            >
              <span className="text-xl opacity-80">{cat.icon}</span>
              <span className="truncate text-sm">{cat.name}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="p-6 bg-slate-50/50 border-t border-slate-100">
        <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4 mb-4 group">
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black shadow-inner group-hover:bg-indigo-600 group-hover:text-white transition-all">
            {userName.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-900 truncate">{userName}</p>
            <p className="text-[10px] font-extrabold text-indigo-500 uppercase tracking-widest">{userRole}</p>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 py-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all font-bold text-xs uppercase tracking-widest"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
