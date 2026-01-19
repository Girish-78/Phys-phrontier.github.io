
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PhysicsResource, ResourceType } from '../types';
import { CATEGORIES } from '../constants';
import { generateThumbnail } from '../services/geminiService';

const CATEGORY_THUMBS: Record<string, string> = {
  'Mechanics': 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800',
  'Thermodynamics': 'https://images.unsplash.com/photo-1532187875605-1ef6c013bb92?auto=format&fit=crop&w=800',
  'Waves & Oscillations': 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800',
  'Electricity': 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800',
  'Magnetism': 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=800',
  'Optics': 'https://images.unsplash.com/photo-1551033406-611cf9a28f67?auto=format&fit=crop&w=800',
  'Modern Physics': 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=800',
  'Astronomy': 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=800',
};

interface UploadFormProps {
  onAdd: (resource: PhysicsResource) => void;
  onUpdate: (resource: PhysicsResource) => void;
  editData: PhysicsResource | null;
}

const UploadForm: React.FC<UploadFormProps> = ({ onAdd, onUpdate, editData }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    category: CATEGORIES[0].name,
    subCategory: '',
    type: ResourceType.SIMULATION,
    author: '',
    description: '',
    userGuide: '',
    contentUrl: '',
    thumbnailUrl: ''
  });

  useEffect(() => {
    if (editData) {
      setFormData({ ...editData } as any);
    }
  }, [editData]);

  // Predictive Thumbnail Update
  useEffect(() => {
    if (!formData.thumbnailUrl || formData.thumbnailUrl.includes('unsplash')) {
      setFormData(prev => ({ ...prev, thumbnailUrl: CATEGORY_THUMBS[formData.category] || CATEGORY_THUMBS['Mechanics'] }));
    }
  }, [formData.category]);

  const handleManualGenerate = async () => {
    if (!formData.title) return alert("Enter a Title first.");
    
    setGeneratingAI(true);
    
    // Circuit Breaker: If AI takes > 15 seconds, fail gracefully
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Timeout")), 15000)
    );

    try {
      const result: any = await Promise.race([
        generateThumbnail(formData.title, formData.description),
        timeoutPromise
      ]);
      
      if (result) {
        setFormData(prev => ({ ...prev, thumbnailUrl: result }));
      } else {
        throw new Error();
      }
    } catch (err) {
      alert("AI is taking too long. Using a high-quality category visual instead.");
      setFormData(prev => ({ ...prev, thumbnailUrl: CATEGORY_THUMBS[formData.category] }));
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.contentUrl) return alert("Simulation URL required.");

    setLoading(true);
    try {
      const payload: PhysicsResource = {
        ...formData,
        id: editData ? editData.id : Date.now().toString(),
        learningOutcomes: (editData?.learningOutcomes || []),
        createdAt: editData ? editData.createdAt : new Date().toISOString()
      } as PhysicsResource;

      const response = await fetch('/api/resources', {
        method: editData ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        if (editData) onUpdate(payload);
        else onAdd(payload);
        navigate('/');
      } else {
        throw new Error("Sync failure.");
      }
    } catch (err: any) {
      alert(err.message || "Publish failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-6">
          <button type="button" onClick={() => navigate(-1)} className="p-4 bg-[#0F172A] border border-white/10 rounded-2xl text-slate-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7 7-7"></path></svg>
          </button>
          <h1 className="text-3xl font-black text-white">{editData ? 'Edit Experiment' : 'New Experiment'}</h1>
        </div>
        <div className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-full uppercase tracking-widest border border-emerald-500/20">Fast-Sync Active</div>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#0F172A] p-8 sm:p-12 rounded-[3.5rem] border border-white/5 shadow-2xl space-y-10">
        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Simulation Title</label>
          <input required type="text" className="w-full px-6 py-5 rounded-[1.5rem] bg-[#020617] border border-white/10 text-white font-bold focus:border-indigo-500 outline-none" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Concept Category</label>
            <select className="w-full px-6 py-5 rounded-[1.5rem] bg-[#020617] border border-white/10 text-slate-300 font-bold outline-none" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
              {CATEGORIES.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Content URL</label>
            <input required type="url" className="w-full px-6 py-5 rounded-[1.5rem] bg-[#020617] border border-white/10 text-white font-bold focus:border-indigo-500 outline-none" value={formData.contentUrl} onChange={(e) => setFormData({ ...formData, contentUrl: e.target.value })} />
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Abstract</label>
          <textarea required rows={3} className="w-full px-6 py-5 rounded-[1.5rem] bg-[#020617] border border-white/10 text-white font-bold resize-none" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
        </div>

        <div className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-8">
          <div className="w-48 h-48 rounded-[2rem] overflow-hidden shadow-2xl bg-black border border-white/10 relative">
             <img src={formData.thumbnailUrl} alt="Preview" className="w-full h-full object-cover" />
             {generatingAI && <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center"><div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>}
          </div>
          <div className="flex-1 space-y-4 text-center md:text-left">
            <h4 className="text-white font-bold">Experiment Visual</h4>
            <p className="text-slate-500 text-xs">We've assigned a high-quality visual for your category. Use AI to create a custom one if needed.</p>
            <button type="button" onClick={handleManualGenerate} disabled={generatingAI} className="px-6 py-3 bg-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-white/20 transition-all">
              {generatingAI ? 'AI Processing...' : 'Upgrade to AI Visual'}
            </button>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-end gap-4">
          <button type="button" onClick={() => navigate(-1)} className="px-8 py-4 text-slate-500 font-bold uppercase text-[10px] tracking-widest">Cancel</button>
          <button type="submit" disabled={loading} className="px-16 py-5 bg-indigo-600 text-white rounded-full font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50">
            {loading ? 'Finalizing...' : 'Publish Instantly'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadForm;
