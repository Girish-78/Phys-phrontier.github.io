
import React, { useState, useMemo } from 'react';
import { HashRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { User, UserRole, PhysicsResource } from './types';
import { CATEGORIES, MOCK_RESOURCES } from './constants';
import Dashboard from './components/Dashboard';
import UploadForm from './components/UploadForm';
import SimulationPlayer from './components/SimulationPlayer';
import Sidebar from './components/Sidebar';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [resources, setResources] = useState<PhysicsResource[]>(MOCK_RESOURCES);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const login = (role: UserRole) => {
    setUser({ id: '1', name: role === UserRole.ADMIN ? 'Admin User' : 'Student Explorer', role });
  };

  const logout = () => setUser(null);

  const filteredResources = useMemo(() => {
    return resources.filter(res => {
      const matchesSearch = res.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            res.subCategory.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory ? res.category === activeCategory : true;
      return matchesSearch && matchesCategory;
    });
  }, [resources, searchQuery, activeCategory]);

  const handleAddResource = (newRes: PhysicsResource) => {
    setResources(prev => [newRes, ...prev]);
  };

  const handleDeleteResource = (id: string) => {
    setResources(prev => prev.filter(r => r.id !== id));
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617] p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(79,70,229,0.1),transparent_50%)]"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none"></div>
        
        <div className="bg-white/5 backdrop-blur-2xl p-8 sm:p-12 rounded-[3.5rem] shadow-2xl w-full max-w-md text-center border border-white/10 relative z-10 animate-in fade-in zoom-in-95 duration-1000">
          <div className="mb-10 inline-flex p-6 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-[2rem] shadow-2xl shadow-indigo-500/40 transform -rotate-6">
             <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.691.346a6 6 0 01-3.86.517l-2.388-.477a2 2 0 00-1.022.547l-1.168 1.168a2 2 0 001.414 3.414h15.428a2 2 0 001.414-3.414l-1.168-1.168z"></path></svg>
          </div>
          <h1 className="text-5xl font-black text-white mb-3 tracking-tighter">Physics Phrontier</h1>
          <p className="text-indigo-300/60 mb-12 font-bold uppercase text-[10px] tracking-[0.3em]">Interactive Lab OS v2.0</p>
          
          <div className="space-y-4">
            <button 
              onClick={() => login(UserRole.STUDENT)}
              className="group w-full py-5 bg-white text-indigo-900 rounded-3xl font-black text-sm uppercase tracking-widest hover:bg-indigo-50 transition-all active:scale-95 shadow-xl flex items-center justify-center gap-3"
            >
              Start Exploring
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
            </button>
            <button 
              onClick={() => login(UserRole.ADMIN)}
              className="w-full py-5 bg-white/5 text-slate-300 border border-white/10 rounded-3xl font-black text-xs uppercase tracking-[0.2em] hover:bg-white/10 transition-all active:scale-95"
            >
              Admin Terminal
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <HashRouter>
      <div className="flex h-screen bg-[#0F172A] text-slate-200 relative overflow-hidden">
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        <Sidebar 
          categories={CATEGORIES} 
          activeCategory={activeCategory} 
          onCategorySelect={(cat) => {
            setActiveCategory(cat);
            setSidebarOpen(false);
          }}
          onLogout={logout}
          userName={user.name}
          userRole={user.role}
          isOpen={isSidebarOpen}
        />

        <main className="flex-1 overflow-y-auto w-full relative">
          <header className="sticky top-0 z-30 bg-[#0F172A]/80 backdrop-blur-2xl border-b border-white/5 px-6 sm:px-10 py-5 flex items-center justify-between">
            <div className="flex items-center gap-6 flex-1">
              <button 
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-3 text-slate-400 hover:bg-white/5 rounded-2xl transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
              </button>
              <div className="relative w-full max-w-lg group">
                <input 
                  type="text"
                  placeholder="Search discovery engine..."
                  className="w-full pl-14 pr-6 py-4 bg-[#1E293B] border border-white/5 rounded-[1.5rem] focus:ring-4 focus:ring-indigo-500/20 focus:bg-[#1E293B] focus:border-indigo-500/50 transition-all outline-none text-sm font-bold placeholder:text-slate-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <span className="absolute left-5 top-4.5 text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-4 ml-6">
              {user.role === UserRole.ADMIN && (
                <Link 
                  to="/upload"
                  className="hidden md:flex bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-indigo-500/20 hover:bg-indigo-500 hover:-translate-y-1 transition-all items-center gap-3"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                  New Experiment
                </Link>
              )}
              {user.role === UserRole.ADMIN && (
                 <Link to="/upload" className="md:hidden p-4 bg-indigo-600 text-white rounded-2xl">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                 </Link>
              )}
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 hidden sm:flex items-center justify-center text-white font-black shadow-xl shadow-indigo-500/20 text-lg border border-white/10">
                {user.name.charAt(0)}
              </div>
            </div>
          </header>

          <div className="p-6 sm:p-10 max-w-[1600px] mx-auto scrollbar-hide">
            <Routes>
              <Route path="/" element={<Dashboard resources={filteredResources} isAdmin={user.role === UserRole.ADMIN} onDelete={handleDeleteResource} />} />
              <Route path="/upload" element={user.role === UserRole.ADMIN ? <UploadForm onAdd={handleAddResource} /> : <Navigate to="/" />} />
              <Route path="/play/:id" element={<SimulationPlayer resources={resources} />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </main>
      </div>
    </HashRouter>
  );
};

export default App;
