
import React, { useState, useEffect } from 'react';
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
  
  const [formData, setFormData] = useState({
    title: '',
    category: CATEGORIES[0].name,
    subCategory: '',
    type: ResourceType.SIMULATION,
    author: '',
    description: '',
    userGuide: '',
    contentUrl: '',
    learningOutcomes: '',
    thumbnailUrl: ''
  });

  useEffect(() => {
    if (editData) {
      setFormData({
        ...editData,
        learningOutcomes: Array.isArray(editData.learningOutcomes) ? editData.learningOutcomes.join('\n') : ''
      });
    }
  }, [editData]);

  const handleGenerateAIThumbnail = async () => {
    if (!formData.title || !formData.description) {
      alert("Please provide a Title and Description first so Gemini can visualize the topic.");
      return;
    }
    
    setGeneratingAI(true);
    try {
      const imageUrl = await generateThumbnail(formData.title, formData.description);
      if (imageUrl) {
        setFormData(prev => ({ ...prev, thumbnailUrl: imageUrl }));
      } else {
        throw new Error("Gemini could not generate an image at this moment.");
      }
    } catch (err: any) {
      alert(err.message || "AI Image generation failed.");
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.contentUrl) {
      alert("Please provide the Simulation URL.");
      return;
    }

    setLoading(true);
    
    const outcomes = await generateLearningOutcomes(formData.title, formData.category, formData.description);

    const payload: PhysicsResource = {
      ...formData,
      id: editData ? editData.id : Date.now().toString(),
      learningOutcomes: outcomes,
      userGuide: formData.userGuide || '',
      createdAt: editData ? editData.createdAt : new Date().toISOString()
    } as PhysicsResource;

    try {
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
        throw new Error("Failed to save to global database.");
      }
    } catch (err: any) {
      alert(err.message || "Sync Error: Could not reach the global vault.");
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
          <h1 className="text-4xl font-black text-white tracking-tight leading-none mb-1">{editData ? 'Modify Simulation' : 'Launch New Experiment'}</h1>
          <p className="text-indigo-500 text-[10px] font-black uppercase tracking-[0.3em] bg-indigo-500/10 px-3 py-1 rounded-full inline-block">Instant Cloud Metadata Sync</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-12 bg-[#0F172A] p-12 rounded-[4rem] border border-white/10 shadow-2xl relative">
        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Simulation Title</label>
          <input required type="text" placeholder="e.g. Centripetal Force Visualization" className="w-full px-8 py-6 rounded-[2.25rem] bg-[#020617] border border-white/5 outline-none font-bold text-white focus:border-indigo-500/50 transition-all shadow-inner" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Simulation Link (URL)</label>
          <input required type="url" placeholder="Paste PhET or external simulation URL here..." className="w-full px-8 py-6 rounded-[2.25rem] bg-[#020617] border border-white/5 outline-none font-bold text-white focus:border-indigo-500/50 transition-all shadow-inner" value={formData.contentUrl} onChange={(e) => setFormData({ ...formData, contentUrl: e.target.value })} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Category</label>
            <select className="w-full px-8 py-6 rounded-[2rem] bg-[#020617] border border-white/5 outline-none font-bold text-slate-400 focus:border-indigo-500/50 appearance-none shadow-inner" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
              {CATEGORIES.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Author / Institution</label>
            <input required type="text" placeholder="e.g. PhET Labs" className="w-full px-8 py-6 rounded-[2rem] bg-[#020617] border border-white/5 outline-none font-bold text-white focus:border-indigo-500/50 transition-all shadow-inner" value={formData.author} onChange={(e) => setFormData({ ...formData, author: e.target.value })} />
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Abstract & Description</label>
          <textarea required rows={4} placeholder="What will students discover in this lab?" className="w-full px-8 py-8 rounded-[2.5rem] bg-[#020617] border border-white/5 outline-none font-bold text-white resize-none focus:border-indigo-500/50 transition-all shadow-inner" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Experiment Visual (AI Generated)</label>
          <div className="flex flex-col items-center justify-center p-10 bg-white/5 border-2 border-dashed border-white/10 rounded-[3rem] text-center relative overflow-hidden group">
            {formData.thumbnailUrl ? (
              <div className="space-y-6">
                <img src={formData.thumbnailUrl} alt="AI Preview" className="w-48 h-48 mx-auto rounded-[2.5rem] shadow-2xl ring-4 ring-indigo-500/20 group-hover:scale-105 transition-transform duration-500" />
                <button type="button" onClick={handleGenerateAIThumbnail} disabled={generatingAI} className="text-indigo-400 text-xs font-black uppercase tracking-widest hover:text-indigo-300 flex items-center gap-2 mx-auto bg-white/5 px-6 py-3 rounded-full">
                  {generatingAI ? 'Regenerating...' : 'Regenerate with Gemini'}
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="w-20 h-20 bg-indigo-500/10 rounded-[2rem] flex items-center justify-center mx-auto text-indigo-400">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                </div>
                <div>
                   <h3 className="text-white font-black text-lg mb-1">Visual Generator</h3>
                   <p className="text-slate-500 text-xs font-medium px-4">Click below to have Gemini AI create a custom high-tech laboratory thumbnail for this experiment.</p>
                </div>
                <button type="button" onClick={handleGenerateAIThumbnail} disabled={generatingAI} className="bg-indigo-600 text-white px-10 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-indigo-500/40 hover:bg-indigo-500 transition-all disabled:opacity-30 flex items-center gap-3 mx-auto">
                  {generatingAI ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Visualizing Topic...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                      Generate AI Visual
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col sm:flex-row justify-end gap-6">
          <button type="button" onClick={() => navigate(-1)} className="px-12 py-6 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-600 hover:text-slate-400 transition-colors">Discard</button>
          <button type="submit" disabled={loading || generatingAI} className="px-16 py-7 bg-indigo-600 text-white rounded-[2.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-indigo-500/50 hover:bg-indigo-500 transition-all disabled:opacity-20 active:scale-95 flex items-center justify-center gap-3">
            {loading ? 'Publishing Lab...' : (editData ? 'Sync Changes' : 'Go Live Globally')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadForm;
