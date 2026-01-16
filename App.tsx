
import React, { useState, useMemo, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { User, UserRole, PhysicsResource, ResourceType } from './types';
import { CATEGORIES, MOCK_RESOURCES } from './constants';
import Dashboard from './components/Dashboard';
import UploadForm from './components/UploadForm';
import SimulationPlayer from './components/SimulationPlayer';
import Sidebar from './components/Sidebar';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [resources, setResources] = useState<PhysicsResource[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<ResourceType | 'All'>('All');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<PhysicsResource | null>(null);

  // Initialize data from LocalStorage or Mock
  useEffect(() => {
    const saved = localStorage.getItem('phrontier_resources_v3');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setResources(Array.isArray(parsed) && parsed.length > 0 ? parsed : MOCK_RESOURCES);
      } catch (e) {
        console.error("Failed to parse saved resources", e);
        setResources(MOCK_RESOURCES);
      }
    } else {
      setResources(MOCK_RESOURCES);
    }
  }, []);

  // Save to LocalStorage whenever resources change
  useEffect(() => {
    if (resources.length > 0) {
      try {
        localStorage.setItem('phrontier_resources_v3', JSON.stringify(resources));
      } catch (e) {
        console.error("LocalStorage save failed (likely quota exceeded)", e);
        if (e instanceof DOMException && e.name === 'QuotaExceededError') {
          alert("Storage Limit Reached: The PDF or images you uploaded are too large to save in this browser's local memory. Try using a smaller file or a direct URL instead.");
        }
      }
    }
  }, [resources]);

  const login = (role: UserRole) => {
    setUser({ id: '1', name: role === UserRole.ADMIN ? 'Admin Terminal' : 'Student Explorer', role });
  };

  const logout = () => setUser(null);

  // Advanced Search through all metadata with safety checks
  const filteredResources = useMemo(() => {
    return resources.filter(res => {
      if (!res) return false;
      const title = res.title || '';
      const desc = res.description || '';
      const author = res.author || '';
      const cat = res.category || '';
      const subCat = res.subCategory || '';
      const type = res.type || '';
      
      const searchStr = `${title} ${desc} ${author} ${cat} ${subCat} ${type}`.toLowerCase();
      const matchesSearch = searchStr.includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory ? res.category === activeCategory : true;
      const matchesType = filterType === 'All' ? true : res.type === filterType;
      return matchesSearch && matchesCategory && matchesType;
    });
  }, [resources, searchQuery, activeCategory, filterType]);

  const handleAddResource = (newRes: PhysicsResource) => {
    setResources(prev => [newRes, ...prev]);
  };

  const handleUpdateResource = (updatedRes: PhysicsResource) => {
    setResources(prev => prev.map(r => r.id === updatedRes.id ? updatedRes : r));
    setEditingResource(null);
  };

  const handleDeleteResource = (id: string) => {
    if(window.confirm("Permanently delete this resource? This cannot be undone.")) {
      setResources(prev => prev.filter(r => r.id !== id));
    }
  };

  const handleEditClick = (res: PhysicsResource) => {
    setEditingResource(res);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617] p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(79,70,229,0.15),transparent_60%)]"></div>
        <div className="bg-white/5 backdrop-blur-3xl p-10 sm:p-14 rounded-[4rem] shadow-2xl w-full max-w-md text-center border border-white/10 relative z-10 animate-in fade-in zoom-in-95 duration-700">
          <div className="mb-10 inline-flex p-6 bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 rounded-[2.5rem] shadow-2xl shadow-indigo-500/40 transform -rotate-3">
             <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.691.346a6 6 0 01-3.86.517l-2.388-.477a2 2 0 00-1.022.547l-1.168 1.168a2 2 0 001.414 3.414h15.428a2 2 0 001.414-3.414l-1.168-1.168z"></path></svg>
          </div>
          <h1 className="text-5xl font-black text-white mb-4 tracking-tighter">Phrontier</h1>
          <p className="text-indigo-300/80 mb-12 font-bold uppercase text-[10px] tracking-[0.4em]">Interactive Lab OS v2.5</p>
          
          <div className="space-y-4">
            <button 
              onClick={() => login(UserRole.STUDENT)}
              className="group w-full py-5 bg-white text-indigo-950 rounded-3xl font-black text-sm uppercase tracking-widest hover:bg-indigo-50 transition-all active:scale-95 shadow-xl flex items-center justify-center gap-3"
            >
              Enter Classroom
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
            </button>
            <button 
              onClick={() => login(UserRole.ADMIN)}
              className="w-full py-5 bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 rounded-3xl font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-500/20 transition-all active:scale-95"
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
      <div className="flex h-screen bg-[#020617] text-slate-200 relative overflow-hidden">
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-xl z-40 lg:hidden"
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
          <header className="sticky top-0 z-30 bg-[#020617]/80 backdrop-blur-3xl border-b border-white/5 px-6 sm:px-10 py-6 flex items-center justify-between">
            <div className="flex items-center gap-6 flex-1">
              <button 
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-3.5 text-slate-400 hover:bg-white/5 rounded-2xl transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
              </button>
              <div className="relative w-full max-w-xl group">
                <input 
                  type="text"
                  placeholder="Universal search: Labs, authors, formulas..."
                  className="w-full pl-14 pr-6 py-4.5 bg-[#0F172A] border border-white/10 rounded-[1.75rem] focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all outline-none text-sm font-bold placeholder:text-slate-600 shadow-inner"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <span className="absolute left-5 top-4.5 text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-4 ml-6">
              <select 
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="hidden sm:block bg-[#0F172A] border border-white/10 text-xs font-black uppercase tracking-widest px-4 py-4 rounded-2xl text-slate-400 focus:text-white outline-none"
              >
                <option value="All">All Types</option>
                <option value={ResourceType.SIMULATION}>Simulations</option>
                <option value={ResourceType.WORKSHEET}>Worksheets</option>
                <option value={ResourceType.CHEATSHEET}>Cheatsheets</option>
              </select>

              <button 
                onClick={() => {setSearchQuery(''); setActiveCategory(null); setFilterType('All');}}
                className="p-4.5 bg-white/5 border border-white/10 text-slate-400 rounded-2xl hover:text-indigo-400 hover:bg-indigo-500/10 transition-all"
                title="Reset Workspace"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
              </button>

              {user.role === UserRole.ADMIN && (
                <Link 
                  to="/upload"
                  className="hidden md:flex bg-indigo-600 text-white px-8 py-4.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-indigo-500/30 hover:bg-indigo-500 hover:-translate-y-1 transition-all items-center gap-3"
                  onClick={() => setEditingResource(null)}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                  Publish Lab
                </Link>
              )}
            </div>
          </header>

          <div className="p-6 sm:p-10 max-w-[1600px] mx-auto">
            <Routes>
              <Route path="/" element={
                <Dashboard 
                  resources={filteredResources} 
                  isAdmin={user.role === UserRole.ADMIN} 
                  onDelete={handleDeleteResource} 
                  onEdit={handleEditClick} 
                />
              } />
              <Route path="/upload" element={
                user.role === UserRole.ADMIN ? 
                <UploadForm onAdd={handleAddResource} onUpdate={handleUpdateResource} editData={editingResource} /> : 
                <Navigate to="/" />
              } />
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
