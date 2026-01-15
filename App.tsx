
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
      <div className="min-h-screen flex items-center justify-center bg-[#0F172A] p-4">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
        <div className="bg-white/10 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md text-center border border-white/10 relative overflow-hidden group">
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-indigo-500/30 blur-3xl rounded-full group-hover:bg-indigo-500/50 transition-all"></div>
          <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-cyan-500/30 blur-3xl rounded-full group-hover:bg-cyan-500/50 transition-all"></div>
          
          <div className="mb-6 inline-flex p-4 bg-gradient-to-br from-indigo-500 to-cyan-400 rounded-3xl shadow-lg">
             <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.691.346a6 6 0 01-3.86.517l-2.388-.477a2 2 0 00-1.022.547l-1.168 1.168a2 2 0 001.414 3.414h15.428a2 2 0 001.414-3.414l-1.168-1.168z"></path></svg>
          </div>
          <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Physics Phrontier</h1>
          <p className="text-slate-400 mb-10 font-medium">Next-gen interactive lab for future engineers.</p>
          <div className="space-y-4">
            <button 
              onClick={() => login(UserRole.STUDENT)}
              className="w-full py-4 bg-white text-indigo-900 rounded-2xl font-bold hover:bg-slate-100 transition-all active:scale-95 shadow-lg"
            >
              Continue as Student
            </button>
            <button 
              onClick={() => login(UserRole.ADMIN)}
              className="w-full py-4 bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 rounded-2xl font-bold hover:bg-indigo-600/30 transition-all active:scale-95"
            >
              Admin Portal
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <HashRouter>
      <div className="flex h-screen bg-slate-50 text-slate-800 relative">
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
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

        <main className="flex-1 overflow-y-auto w-full">
          <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <button 
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
              </button>
              <div className="relative w-full max-w-md group">
                <input 
                  type="text"
                  placeholder="Search labs, formulas..."
                  className="w-full pl-11 pr-4 py-3 bg-slate-100/50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-400/20 focus:bg-white focus:border-indigo-400 transition-all outline-none text-sm font-medium"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <span className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-3 ml-4">
              {user.role === UserRole.ADMIN && (
                <Link 
                  to="/upload"
                  className="hidden sm:flex bg-indigo-600 text-white px-5 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                  Add Lab
                </Link>
              )}
              {user.role === UserRole.ADMIN && (
                 <Link to="/upload" className="sm:hidden p-3 bg-indigo-600 text-white rounded-xl">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                 </Link>
              )}
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 hidden sm:flex items-center justify-center text-white font-black shadow-lg">
                {user.name.charAt(0)}
              </div>
            </div>
          </header>

          <div className="p-4 sm:p-8 max-w-[1600px] mx-auto">
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
