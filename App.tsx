
import React, { useState, useMemo } from 'react';
import { HashRouter, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
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

  // Simple Auth simulation
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md text-center">
          <h1 className="text-4xl font-extrabold text-blue-600 mb-2">Physics Phrontier</h1>
          <p className="text-gray-500 mb-8 font-medium">Empowering JEE/NEET aspirants with interactive physics</p>
          <div className="space-y-4">
            <button 
              onClick={() => login(UserRole.STUDENT)}
              className="w-full py-4 bg-white border-2 border-blue-500 text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-colors"
            >
              Continue as Student
            </button>
            <button 
              onClick={() => login(UserRole.ADMIN)}
              className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-shadow shadow-lg"
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
      <div className="flex h-screen bg-slate-50 text-slate-800">
        <Sidebar 
          categories={CATEGORIES} 
          activeCategory={activeCategory} 
          onCategorySelect={setActiveCategory}
          onLogout={logout}
          userName={user.name}
          userRole={user.role}
        />

        <main className="flex-1 overflow-y-auto">
          {/* Header */}
          <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between">
            <div className="relative w-full max-w-xl">
              <input 
                type="text"
                placeholder="Search topics, simulations, worksheets..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border-none rounded-2xl focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <span className="absolute left-3 top-3 text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </span>
            </div>
            <div className="flex items-center gap-4 ml-4">
              {user.role === UserRole.ADMIN && (
                <Link 
                  to="/upload"
                  className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-md hover:bg-blue-700 transition-all flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                  New Resource
                </Link>
              )}
            </div>
          </header>

          <div className="p-6">
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
