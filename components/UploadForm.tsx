
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PhysicsResource, ResourceType } from '../types';
import { CATEGORIES } from '../constants';
import { generateLearningOutcomes, generateThumbnail } from '../services/geminiService';

interface UploadFormProps {
  onAdd: (resource: PhysicsResource) => void;
  onUpdate: (resource: PhysicsResource) => void;
  editData: PhysicsResource | null;
}

const UploadForm: React.FC<UploadFormProps> = ({ onAdd, onUpdate, editData }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  
  // Changed from NodeJS.Timeout to any to fix "Cannot find namespace 'NodeJS'" error in browser environments
  const autoGenTimerRef = useRef<any>(null);
  
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
      setFormData({
        ...editData,
      } as any);
    }
  }, [editData]);

  // Automatic Visualization Logic
  useEffect(() => {
    // Only auto-generate if we have enough info and haven't generated one yet (or if info changed significantly)
    if (formData.title.length > 5 && formData.description.length > 20 && !formData.thumbnailUrl && !generatingAI) {
      if (autoGenTimerRef.current) clearTimeout(autoGenTimerRef.current);
      
      autoGenTimerRef.current = setTimeout(() => {
        handleGenerateAIThumbnail();
      }, 3000); // 3-second debounce
    }
    
    return () => { if (autoGenTimerRef.current) clearTimeout(autoGenTimerRef.current); };
  }, [formData.title, formData.description]);

  const handleGenerateAIThumbnail = async () => {
    if (!formData.title || !formData.description) return;
    
    setGeneratingAI(true);
    try {
      const imageUrl = await generateThumbnail(formData.title, formData.description);
      if (imageUrl) {
        setFormData(prev => ({ ...prev, thumbnailUrl: imageUrl }));
      }
    } catch (err: any) {
      console.warn("Auto-visual failed, will retry on next edit.");
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.contentUrl) {
      alert("Please provide the simulation URL.");
      return;
    }

    setLoading(true);
    try {
      // Final outcome generation
      const outcomes = await generateLearningOutcomes(formData.title, formData.category, formData.description);

      const payload: PhysicsResource = {
        ...formData,
        id: editData ? editData.id : Date.now().toString(),
        learningOutcomes: outcomes,
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
        throw new Error("Database Sync Failed.");
      }
    } catch (err: any) {
      alert(err.message || "Failed to publish simulation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-in fade-in duration-700">
      <div className="flex items-center gap-8 mb-14">
        <button type="button" onClick={() => navigate(-1)} className="w-14 h-14 flex items-center justify-center bg-[#0F172A] border border-white/10 rounded-2xl text-slate-400 hover:text-white transition-all shadow-lg active:scale-95">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7 7-7m8 14l-7-7 7-7"></path></svg>
        </button>
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight leading-none mb-1">{editData ? 'Modify Module' : 'Publish Experiment'}</h1>
          <p className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.3em] bg-emerald-500/10 px-3 py-1 rounded-full inline-block">AI Auto-Visualize Active</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-12 bg-[#0F172A] p-12 rounded-[4rem] border border-white/10 shadow-2xl relative">
        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Simulation Identity (Title)</label>
          <input required type="text" placeholder="e.g. Kinetic Theory of Gases" className="w-full px-8 py-6 rounded-[2.25rem] bg-[#020617] border border-white/5 outline-none font-bold text-white focus:border-indigo-500/50 shadow-inner" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Interactive Simulation URL</label>
          <input required type="url" placeholder="Paste PhET or external simulation link..." className="w-full px-8 py-6 rounded-[2.25rem] bg-[#020617] border border-white/5 outline-none font-bold text-white focus:border-indigo-500/50 shadow-inner" value={formData.contentUrl} onChange={(e) => setFormData({ ...formData, contentUrl: e.target.value })} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Domain</label>
            <select className="w-full px-8 py-6 rounded-[2rem] bg-[#020617] border border-white/5 outline-none font-bold text-slate-400 focus:border-indigo-500/50 shadow-inner" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
              {CATEGORIES.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Lead Author</label>
            <input required type="text" placeholder="Your Name or Institution" className="w-full px-8 py-6 rounded-[2rem] bg-[#020617] border border-white/5 outline-none font-bold text-white shadow-inner" value={formData.author} onChange={(e) => setFormData({ ...formData, author: e.target.value })} />
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Abstract & Description</label>
          <textarea required rows={4} placeholder="Describe the physics experiment in detail..." className="w-full px-8 py-8 rounded-[2.5rem] bg-[#020617] border border-white/5 outline-none font-bold text-white resize-none shadow-inner" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
          <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest px-2 italic">Gemini uses this abstract to automatically paint the experiment's thumbnail.</p>
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Automatic Visual Branding</label>
          <div className="flex flex-col items-center justify-center min-h-[350px] bg-white/5 border-2 border-dashed border-white/10 rounded-[3rem] text-center relative overflow-hidden">
            {formData.thumbnailUrl ? (
              <div className="space-y-6 animate-in zoom-in duration-1000">
                <div className="relative group">
                  <img src={formData.thumbnailUrl} alt="AI Generated Visual" className="w-64 h-64 mx-auto rounded-[3rem] shadow-2xl ring-4 ring-indigo-500/20 group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-indigo-600/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-[3rem] flex items-center justify-center">
                     <span className="bg-black/60 backdrop-blur-xl px-4 py-2 rounded-full text-[10px] text-white font-black uppercase tracking-widest">AI Generated</span>
                  </div>
                </div>
                <button type="button" onClick={handleGenerateAIThumbnail} disabled={generatingAI} className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] hover:text-white transition-colors bg-white/5 px-6 py-2 rounded-full">
                  {generatingAI ? 'Refreshing Visual...' : 'Regenerate Illustration'}
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-6 px-10">
                <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center transition-all duration-500 ${generatingAI ? 'bg-indigo-500/20 animate-pulse' : 'bg-white/5'}`}>
                  {generatingAI ? (
                    <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-10 h-10 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  )}
                </div>
                <div>
                  <p className="text-white font-black text-sm uppercase tracking-widest mb-2">
                    {generatingAI ? 'Gemini is Painting...' : 'Waiting for Description'}
                  </p>
                  <p className="text-slate-500 text-[10px] font-medium leading-relaxed max-w-xs mx-auto">
                    {generatingAI ? 'Creating a professional laboratory visual for your experiment based on your abstract.' : 'The AI will automatically generate a custom thumbnail once you finish writing the abstract above.'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col sm:flex-row justify-end gap-6">
          <button type="button" onClick={() => navigate(-1)} className="px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-600 hover:text-slate-400">Discard</button>
          <button type="submit" disabled={loading || generatingAI} className="px-20 py-7 bg-indigo-600 text-white rounded-[2.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-indigo-500 transition-all active:scale-95 disabled:opacity-30">
            {loading ? 'Synchronizing Lab...' : (editData ? 'Sync Changes' : 'Go Live on Phrontier')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadForm;
