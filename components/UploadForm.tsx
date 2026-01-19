
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
    thumbnailUrl: ''
  });

  useEffect(() => {
    if (editData) {
      setFormData({
        ...editData,
      } as any);
    }
  }, [editData]);

  const handleGenerateAIThumbnail = async () => {
    if (!formData.title || !formData.description) {
      alert("Please provide a Title and Description so Gemini can visualize the topic.");
      return;
    }
    
    setGeneratingAI(true);
    try {
      const imageUrl = await generateThumbnail(formData.title, formData.description);
      if (imageUrl) {
        setFormData(prev => ({ ...prev, thumbnailUrl: imageUrl }));
      } else {
        throw new Error("Gemini AI failed to produce a visual.");
      }
    } catch (err: any) {
      alert(err.message || "AI Visual Handshake Failed.");
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.contentUrl) {
      alert("Provide a Simulation URL.");
      return;
    }

    setLoading(true);
    try {
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
        throw new Error("KV Sync Failed.");
      }
    } catch (err: any) {
      alert(err.message || "Cloud distribution error.");
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
          <h1 className="text-4xl font-black text-white tracking-tight leading-none mb-1">{editData ? 'Modify Lab' : 'Launch Experiment'}</h1>
          <p className="text-indigo-500 text-[10px] font-black uppercase tracking-[0.3em] bg-indigo-500/10 px-3 py-1 rounded-full inline-block">Secure Metadata Sync Active</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-12 bg-[#0F172A] p-12 rounded-[4rem] border border-white/10 shadow-2xl relative">
        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Simulation Title</label>
          <input required type="text" className="w-full px-8 py-6 rounded-[2.25rem] bg-[#020617] border border-white/5 outline-none font-bold text-white focus:border-indigo-500/50 shadow-inner" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Interactive URL (PhET/External)</label>
          <input required type="url" className="w-full px-8 py-6 rounded-[2.25rem] bg-[#020617] border border-white/5 outline-none font-bold text-white focus:border-indigo-500/50 shadow-inner" value={formData.contentUrl} onChange={(e) => setFormData({ ...formData, contentUrl: e.target.value })} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Category</label>
            <select className="w-full px-8 py-6 rounded-[2rem] bg-[#020617] border border-white/5 outline-none font-bold text-slate-400 focus:border-indigo-500/50 shadow-inner" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
              {CATEGORIES.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Author</label>
            <input required type="text" className="w-full px-8 py-6 rounded-[2rem] bg-[#020617] border border-white/5 outline-none font-bold text-white shadow-inner" value={formData.author} onChange={(e) => setFormData({ ...formData, author: e.target.value })} />
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Abstract</label>
          <textarea required rows={4} className="w-full px-8 py-8 rounded-[2.5rem] bg-[#020617] border border-white/5 outline-none font-bold text-white resize-none shadow-inner" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Instructions (Optional)</label>
          <textarea rows={2} className="w-full px-8 py-6 rounded-[2.25rem] bg-[#020617] border border-white/5 outline-none font-bold text-white resize-none shadow-inner" value={formData.userGuide} onChange={(e) => setFormData({ ...formData, userGuide: e.target.value })} />
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Simulation Visual (Gemini AI)</label>
          <div className="flex flex-col items-center justify-center p-12 bg-white/5 border-2 border-dashed border-white/10 rounded-[3rem] text-center">
            {formData.thumbnailUrl ? (
              <div className="space-y-6">
                <img src={formData.thumbnailUrl} alt="AI Visual" className="w-48 h-48 mx-auto rounded-[2.5rem] shadow-2xl ring-4 ring-indigo-500/20" />
                <button type="button" onClick={handleGenerateAIThumbnail} disabled={generatingAI} className="text-indigo-400 text-xs font-black uppercase tracking-widest hover:text-white transition-colors">
                  {generatingAI ? 'Regenerating...' : 'Regenerate Visual'}
                </button>
              </div>
            ) : (
              <button type="button" onClick={handleGenerateAIThumbnail} disabled={generatingAI} className="bg-indigo-600 text-white px-10 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-indigo-500/40 hover:scale-105 transition-all flex items-center gap-3">
                {generatingAI ? 'Visualizing Topic...' : 'Generate AI Visual'}
              </button>
            )}
          </div>
        </div>

        <div className="pt-12 border-t border-white/5 flex justify-end gap-6">
          <button type="submit" disabled={loading || generatingAI} className="px-20 py-7 bg-indigo-600 text-white rounded-[2.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-indigo-500 transition-all active:scale-95">
            {loading ? 'Publishing...' : 'Sync to Global Lab'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadForm;
