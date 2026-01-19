
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PhysicsResource, ResourceType } from '../types';
import { CATEGORIES } from '../constants';
import { generateThumbnail } from '../services/geminiService';

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

  const handleManualGenerate = async () => {
    if (!formData.title || !formData.description) {
      alert("Provide a Title and Abstract first.");
      return;
    }
    setGeneratingAI(true);
    try {
      const imageUrl = await generateThumbnail(formData.title, formData.description);
      if (imageUrl) {
        setFormData(prev => ({ ...prev, thumbnailUrl: imageUrl }));
      } else {
        throw new Error();
      }
    } catch (err) {
      alert("AI visual generation timed out. You can still publish with a placeholder.");
      // Fallback placeholder to ensure they can still publish
      setFormData(prev => ({ ...prev, thumbnailUrl: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&q=80&w=800' }));
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
        learningOutcomes: (editData?.learningOutcomes || []), // Server will fill if empty
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
        throw new Error("Cloud sync failed.");
      }
    } catch (err: any) {
      alert(err.message || "Failed to publish.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-in fade-in duration-500">
      <div className="flex items-center gap-8 mb-12">
        <button type="button" onClick={() => navigate(-1)} className="w-12 h-12 flex items-center justify-center bg-[#0F172A] border border-white/10 rounded-2xl text-slate-400 hover:text-white active:scale-95 transition-all">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7 7-7m8 14l-7-7 7-7"></path></svg>
        </button>
        <h1 className="text-4xl font-black text-white">{editData ? 'Edit Lab' : 'New Lab'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10 bg-[#0F172A] p-10 rounded-[3.5rem] border border-white/5 shadow-2xl">
        <div className="grid grid-cols-1 gap-10">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Simulation Title</label>
            <input required type="text" className="w-full px-6 py-5 rounded-3xl bg-[#020617] border border-white/5 text-white font-bold outline-none focus:border-indigo-500 transition-all" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Interactive URL</label>
            <input required type="url" className="w-full px-6 py-5 rounded-3xl bg-[#020617] border border-white/5 text-white font-bold outline-none focus:border-indigo-500 transition-all" value={formData.contentUrl} onChange={(e) => setFormData({ ...formData, contentUrl: e.target.value })} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Category</label>
              <select className="w-full px-6 py-5 rounded-3xl bg-[#020617] border border-white/5 text-slate-400 font-bold outline-none appearance-none" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                {CATEGORIES.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Author</label>
              <input required type="text" className="w-full px-6 py-5 rounded-3xl bg-[#020617] border border-white/5 text-white font-bold outline-none" value={formData.author} onChange={(e) => setFormData({ ...formData, author: e.target.value })} />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Abstract</label>
            <textarea required rows={3} className="w-full px-6 py-6 rounded-[2rem] bg-[#020617] border border-white/5 text-white font-bold outline-none resize-none" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Experiment Visual</label>
            <div className="p-8 bg-white/5 border-2 border-dashed border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center min-h-[300px] text-center">
              {formData.thumbnailUrl ? (
                <div className="space-y-5">
                  <img src={formData.thumbnailUrl} alt="Visual" className="w-48 h-48 mx-auto rounded-[2rem] shadow-2xl" />
                  <button type="button" onClick={handleManualGenerate} disabled={generatingAI} className="text-indigo-400 text-[10px] font-black uppercase hover:text-white transition-all">
                    {generatingAI ? 'Regenerating...' : 'Regenerate Visual'}
                  </button>
                </div>
              ) : (
                <button type="button" onClick={handleManualGenerate} disabled={generatingAI} className="bg-indigo-600 text-white px-10 py-5 rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all">
                  {generatingAI ? 'AI is Visualizing...' : 'Create AI Visual'}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex justify-end gap-4">
          <button type="button" onClick={() => navigate(-1)} className="px-8 py-4 text-slate-500 font-bold uppercase text-[10px] tracking-widest">Cancel</button>
          <button type="submit" disabled={loading || generatingAI} className="px-16 py-5 bg-indigo-600 text-white rounded-full font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-indigo-500 transition-all disabled:opacity-50">
            {loading ? 'Publishing Lab...' : (editData ? 'Sync Changes' : 'Go Live')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadForm;
