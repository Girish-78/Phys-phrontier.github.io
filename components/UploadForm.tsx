
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PhysicsResource, ResourceType } from '../types';
import { CATEGORIES } from '../constants';
import { generateThumbnail, generateLearningOutcomes } from '../services/geminiService';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&q=80&w=800';

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
    thumbnailUrl: '',
    learningOutcomes: [] as string[]
  });

  useEffect(() => {
    if (editData) {
      setFormData({ ...editData } as any);
    }
  }, [editData]);

  // Sync category thumbnail
  useEffect(() => {
    if (!formData.thumbnailUrl || (!formData.thumbnailUrl.includes('unsplash') && !formData.thumbnailUrl.includes('blob'))) {
      setFormData(prev => ({ ...prev, thumbnailUrl: CATEGORY_THUMBS[formData.category] || CATEGORY_THUMBS['Mechanics'] }));
    }
  }, [formData.category]);

  const uploadBase64ToBlob = async (base64Data: string, filename: string) => {
    try {
      if (!base64Data) return null;
      const byteCharacters = atob(base64Data);
      const byteArray = new Uint8Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) byteArray[i] = byteCharacters.charCodeAt(i);
      
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'x-filename': `${filename}.png`, 'x-content-type': 'image/png' },
        body: new Blob([byteArray], { type: 'image/png' })
      });
      
      if (!res.ok) return null;
      const data = await res.json();
      return data.url;
    } catch (err) {
      console.error("Blob upload error", err);
      return null;
    }
  };

  const handleMagicFill = async () => {
    if (!formData.title) return alert("Title required.");
    setGeneratingAI(true);

    try {
      const outcomes = await generateLearningOutcomes(formData.title, formData.category, formData.description);
      const base64 = await generateThumbnail(formData.title, formData.description);
      
      let thumbUrl = formData.thumbnailUrl;
      if (base64) {
        const uploaded = await uploadBase64ToBlob(base64, formData.title.replace(/\s+/g, '-').toLowerCase());
        thumbUrl = uploaded || thumbUrl; 
      }

      setFormData(prev => ({ ...prev, learningOutcomes: outcomes, thumbnailUrl: thumbUrl }));
    } catch (err) {
      alert("AI task failed. You can still publish manually.");
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Mandatory Cleanse: If thumbnailUrl is still a data URI (upload failed), strip it
      // Database (KV) will reject the request if it's too big
      let safeThumb = formData.thumbnailUrl;
      if (safeThumb?.startsWith('data:')) {
        console.warn("Base64 string detected, reverting to fallback to ensure sync success.");
        safeThumb = FALLBACK_IMAGE;
      }

      const payload = { 
        ...formData, 
        thumbnailUrl: safeThumb,
        learningOutcomes: formData.learningOutcomes.length > 0 ? formData.learningOutcomes : ["Explore Physics Concepts"],
        id: editData ? editData.id : Date.now().toString(),
        createdAt: editData ? editData.createdAt : new Date().toISOString()
      };

      const response = await fetch('/api/resources', {
        method: editData ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        // This is where the 'Unexpected Token A' (An error occurred...) usually happens
        const errorText = await response.text();
        throw new Error(`The server returned a non-JSON response. This usually means the database is unreachable or the payload is too large. Details: ${errorText.substring(0, 100)}`);
      }

      const result = await response.json();
      if (response.ok) {
        editData ? onUpdate(payload as any) : onAdd(payload as any);
        navigate('/');
      } else {
        throw new Error(result.error || "Cloud sync rejected.");
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
        <button type="button" onClick={() => navigate(-1)} className="p-4 bg-[#0F172A] border border-white/10 rounded-2xl text-slate-400 hover:text-white transition-all">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7 7-7"></path></svg>
        </button>
        <button type="button" onClick={handleMagicFill} disabled={generatingAI} className="px-6 py-3 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">
          {generatingAI ? 'AI PROCESSING...' : '✨ ENHANCE WITH AI'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#0F172A] p-8 sm:p-12 rounded-[3.5rem] border border-white/5 shadow-2xl space-y-10">
        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Simulation Identity</label>
          <input required type="text" className="w-full px-6 py-5 rounded-[1.5rem] bg-[#020617] border border-white/10 text-white font-bold outline-none focus:border-indigo-500 transition-all" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Category</label>
            <select className="w-full px-6 py-5 rounded-[1.5rem] bg-[#020617] border border-white/10 text-slate-300 font-bold outline-none" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
              {CATEGORIES.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Source URL</label>
            <input required type="url" className="w-full px-6 py-5 rounded-[1.5rem] bg-[#020617] border border-white/10 text-white font-bold outline-none" value={formData.contentUrl} onChange={(e) => setFormData({ ...formData, contentUrl: e.target.value })} />
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Author / Creator</label>
          <input required type="text" className="w-full px-6 py-5 rounded-[1.5rem] bg-[#020617] border border-white/10 text-white font-bold outline-none" value={formData.author} onChange={(e) => setFormData({ ...formData, author: e.target.value })} />
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Abstract</label>
          <textarea required rows={3} className="w-full px-6 py-5 rounded-[1.5rem] bg-[#020617] border border-white/10 text-white font-bold resize-none" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
        </div>

        <div className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-8">
          <div className="w-40 h-40 rounded-[2rem] overflow-hidden shadow-2xl bg-black border border-white/10 relative">
             <img src={formData.thumbnailUrl || FALLBACK_IMAGE} alt="Visual" className="w-full h-full object-cover" />
             {generatingAI && <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center"><div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>}
          </div>
          <div className="flex-1 space-y-2">
            <h4 className="text-white font-bold text-sm">Targets & Outcomes</h4>
            {formData.learningOutcomes.length > 0 ? (
              <ul className="text-xs text-slate-400 space-y-1">
                {formData.learningOutcomes.map((o, i) => <li key={i}>• {o}</li>)}
              </ul>
            ) : (
              <p className="text-[10px] text-slate-500 italic">No targets defined yet.</p>
            )}
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-end gap-4">
          <button type="button" onClick={() => navigate(-1)} className="px-8 py-4 text-slate-500 font-bold uppercase text-[10px] tracking-widest">Discard</button>
          <button type="submit" disabled={loading || generatingAI} className="px-16 py-5 bg-indigo-600 text-white rounded-full font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50">
            {loading ? 'SYNCING...' : 'PUBLISH LAB'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadForm;
