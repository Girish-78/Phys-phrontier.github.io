
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

  // Predictive Thumbnail Baseline
  useEffect(() => {
    if (!formData.thumbnailUrl || (!formData.thumbnailUrl.includes('unsplash') && !formData.thumbnailUrl.includes('public.blob.vercel-storage.com'))) {
      setFormData(prev => ({ ...prev, thumbnailUrl: CATEGORY_THUMBS[formData.category] || CATEGORY_THUMBS['Mechanics'] }));
    }
  }, [formData.category]);

  const uploadBase64ToBlob = async (base64Data: string, filename: string) => {
    try {
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/png' });

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'x-filename': `${filename}-${Date.now()}.png`,
          'x-content-type': 'image/png'
        },
        body: blob
      });
      const data = await res.json();
      return data.url;
    } catch (err) {
      console.error("Blob mirror failed", err);
      return null;
    }
  };

  const handleManualGenerate = async () => {
    if (!formData.title) return alert("Simulation Title is required for AI visuals.");
    
    setGeneratingAI(true);
    
    // Hard 20s timeout for better UX
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("AI_TIMEOUT")), 20000)
    );

    try {
      const base64: any = await Promise.race([
        generateThumbnail(formData.title, formData.description),
        timeoutPromise
      ]);
      
      if (base64) {
        // Step 2: Mirror to Vercel Blob immediately for speed/reliability
        const blobUrl = await uploadBase64ToBlob(base64, formData.title.replace(/\s+/g, '-').toLowerCase());
        if (blobUrl) {
          setFormData(prev => ({ ...prev, thumbnailUrl: blobUrl }));
        } else {
          setFormData(prev => ({ ...prev, thumbnailUrl: `data:image/png;base64,${base64}` }));
        }
      }
    } catch (err: any) {
      alert("AI visual generation is currently congested. Using professional category placeholder.");
      setFormData(prev => ({ ...prev, thumbnailUrl: CATEGORY_THUMBS[formData.category] }));
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.contentUrl) return alert("Please provide the simulation URL.");

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

      const result = await response.json();

      if (response.ok) {
        if (editData) onUpdate(payload);
        else onAdd(payload);
        navigate('/');
      } else {
        throw new Error(result.error || "Database sync failed.");
      }
    } catch (err: any) {
      alert("Publish Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-6">
          <button type="button" onClick={() => navigate(-1)} className="p-4 bg-[#0F172A] border border-white/10 rounded-2xl text-slate-400 hover:text-white transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7 7-7"></path></svg>
          </button>
          <h1 className="text-3xl font-black text-white">{editData ? 'Modify Lab' : 'Register Lab'}</h1>
        </div>
        <div className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-full uppercase tracking-widest border border-emerald-500/20">Optimized Pipeline</div>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#0F172A] p-8 sm:p-12 rounded-[3.5rem] border border-white/5 shadow-2xl space-y-10">
        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Simulation Identity (Title)</label>
          <input required type="text" className="w-full px-6 py-5 rounded-[1.5rem] bg-[#020617] border border-white/10 text-white font-bold focus:border-indigo-500 outline-none transition-all" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Concept Domain</label>
            <select className="w-full px-6 py-5 rounded-[1.5rem] bg-[#020617] border border-white/10 text-slate-300 font-bold outline-none appearance-none cursor-pointer" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
              {CATEGORIES.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Simulator URL</label>
            <input required type="url" placeholder="PhET or External Link" className="w-full px-6 py-5 rounded-[1.5rem] bg-[#020617] border border-white/10 text-white font-bold focus:border-indigo-500 outline-none" value={formData.contentUrl} onChange={(e) => setFormData({ ...formData, contentUrl: e.target.value })} />
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Lead Author / Institution</label>
          <input required type="text" className="w-full px-6 py-5 rounded-[1.5rem] bg-[#020617] border border-white/10 text-white font-bold focus:border-indigo-500 outline-none" value={formData.author} onChange={(e) => setFormData({ ...formData, author: e.target.value })} />
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Module Abstract</label>
          <textarea required rows={3} placeholder="Describe the physical phenomena explored..." className="w-full px-6 py-5 rounded-[1.5rem] bg-[#020617] border border-white/10 text-white font-bold resize-none" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
        </div>

        <div className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-8">
          <div className="w-48 h-48 rounded-[2rem] overflow-hidden shadow-2xl bg-black border border-white/10 relative">
             <img src={formData.thumbnailUrl} alt="Preview" className="w-full h-full object-cover" />
             {generatingAI && <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center"><div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>}
          </div>
          <div className="flex-1 space-y-4 text-center md:text-left">
            <h4 className="text-white font-bold uppercase tracking-tight">AI Illustration</h4>
            <p className="text-slate-500 text-xs font-medium leading-relaxed">By default, we use high-quality category visuals. Click below to generate a custom 3D illustration of your specific experiment.</p>
            <button type="button" onClick={handleManualGenerate} disabled={generatingAI} className="px-6 py-3 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-600 hover:text-white transition-all disabled:opacity-30">
              {generatingAI ? 'AI is Painting...' : 'Generate Lab Visual'}
            </button>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-end gap-4">
          <button type="button" onClick={() => navigate(-1)} className="px-8 py-4 text-slate-500 font-bold uppercase text-[10px] tracking-widest hover:text-slate-300">Discard</button>
          <button type="submit" disabled={loading} className="px-16 py-5 bg-indigo-600 text-white rounded-full font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50">
            {loading ? 'Finalizing Lab...' : (editData ? 'Save Changes' : 'Go Live Now')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadForm;
