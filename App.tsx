
import React, { useState, useMemo, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { User, UserRole, PhysicsResource, ResourceType } from './types';
import { CATEGORIES } from './constants';
import Dashboard from './components/Dashboard';
import UploadForm from './components/UploadForm';
import SimulationPlayer from './components/SimulationPlayer';
import Sidebar from './components/Sidebar';

export const dynamic = 'force-dynamic';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [resources, setResources] = useState<PhysicsResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<PhysicsResource | null>(null);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/resources', { 
          cache: 'no-store'
        });
        if (response.ok) {
          const data = await response.json();
          setResources(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        console.error("Cloud fetch failed", e);
      } finally {
        setLoading(false);
      }
    };
    
    if (user) fetchResources();
  }, [user]);

  const login = (role: UserRole) => {
    setUser({ id: '1', name: role === UserRole.ADMIN ? 'Admin Terminal' : 'Student Explorer', role });
  };

  const logout = () => setUser(null);

  const filteredResources = useMemo(() => {
    return resources.filter(res => {
      if (!res) return false;
      const searchStr = `${res.title} ${res.description} ${res.category}`.toLowerCase();
      const matchesSearch = searchStr.includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory ? res.category === activeCategory : true;
      return matchesSearch && matchesCategory;
    });
  }, [resources, searchQuery, activeCategory]);

  const handleAddResource = (newRes: PhysicsResource) => {
    setResources(prev => [newRes, ...prev]);
  };

  const handleUpdateResource = (updatedRes: PhysicsResource) => {
    setResources(prev => prev.map(r => r.id === updatedRes.id ? updatedRes : r));
    setEditingResource(null);
  };

  const handleDeleteResource = async (id: string) => {
    if(window.confirm("Permanently remove this simulation?")) {
      try {
        const response = await fetch(`/api/resources?id=${id}`, { method: 'DELETE' });
        if (response.ok) {
          setResources(prev => prev.filter(r => r.id !== id));
        }
      } catch (e) {
        alert("Failed to delete from cloud database.");
      }
    }
  };

  const handleEditClick = (res: PhysicsResource) => {
    setEditingResource(res);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617] p-4 relative overflow-hidden text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(79,70,229,0.15),transparent_60%)]"></div>
        <div className="bg-white/5 backdrop-blur-3xl p-10 sm:p-14 rounded-[4rem] shadow-2xl w-full max-w-md border border-white/10 relative z-10">
          <div className="mb-10 inline-flex p-6 bg-gradient-to-br from-indigo-500 to-violet-700 rounded-[2.5rem] shadow-2xl">
             <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          </div>
          <h1 className="text-5xl font-black text-white mb-2 tracking-tighter">Phrontier</h1>
          <p className="text-indigo-400 mb-12 font-black uppercase text-[10px] tracking-[0.4em]">Simulation Hub</p>
          <div className="space-y-4">
            <button onClick={() => login(UserRole.STUDENT)} className="w-full py-5 bg-white text-indigo-950 rounded-3xl font-black text-sm uppercase tracking-widest hover:bg-indigo-50 transition-all active:scale-95 shadow-xl">Enter Lab</button>
            <button onClick={() => login(UserRole.ADMIN)} className="w-full py-5 bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 rounded-3xl font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-500/20 transition-all active:scale-95">Admin OS</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <HashRouter>
      <div className="flex h-screen bg-[#020617] text-slate-200 relative overflow-hidden">
        {isSidebarOpen && <div className="fixed inset-0 bg-black/70 backdrop-blur-xl z-40 lg:hidden" onClick={() => setSidebarOpen(false)}></div>}
        <Sidebar categories={CATEGORIES} activeCategory={activeCategory} onCategorySelect={(cat) => { setActiveCategory(cat); setSidebarOpen(false); }} onLogout={logout} userName={user.name} userRole={user.role} isOpen={isSidebarOpen} />
        <main className="flex-1 overflow-y-auto w-full relative">
          <header className="sticky top-0 z-30 bg-[#020617]/80 backdrop-blur-3xl border-b border-white/5 px-6 sm:px-10 py-6 flex items-center justify-between gap-6">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-3.5 text-slate-400 hover:bg-white/5 rounded-2xl transition-all">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
            </button>
            <div className="relative flex-1 max-w-xl group">
              <input type="text" placeholder="Search experiments..." className="w-full pl-14 pr-6 py-4.5 bg-[#0F172A] border border-white/10 rounded-[1.75rem] focus:ring-4 focus:ring-indigo-500/20 outline-none text-sm font-bold shadow-inner" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              <span className="absolute left-5 top-4.5 text-slate-500"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg></span>
            </div>
            {user.role === UserRole.ADMIN && (
              <Link to="/upload" className="hidden md:flex bg-indigo-600 text-white px-8 py-4.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-indigo-500 transition-all items-center gap-3" onClick={() => setEditingResource(null)}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                Publish Lab
              </Link>
            )}
          </header>

          <div className="p-6 sm:p-10 max-w-[1600px] mx-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-40">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-6 font-black text-indigo-400 uppercase tracking-widest text-[10px]">Cloud Lab Sync Active...</p>
              </div>
            ) : (
              <Routes>
                <Route path="/" element={<Dashboard resources={filteredResources} isAdmin={user.role === UserRole.ADMIN} onDelete={handleDeleteResource} onEdit={handleEditClick} />} />
                <Route path="/upload" element={user.role === UserRole.ADMIN ? <UploadForm onAdd={handleAddResource} onUpdate={handleUpdateResource} editData={editingResource} /> : <Navigate to="/" />} />
                <Route path="/play/:id" element={<SimulationPlayer resources={resources} />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            )}
          </div>
        </main>
      </div>
    </HashRouter>
  );
};

export default App;
