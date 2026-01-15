
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PhysicsResource, ResourceType } from '../types';
import { CATEGORIES } from '../constants';
import { generateLearningOutcomes } from '../services/geminiService';

interface UploadFormProps {
  onAdd: (resource: PhysicsResource) => void;
}

const UploadForm: React.FC<UploadFormProps> = ({ onAdd }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      id: Date.now().toString(),
      ...formData,
      learningOutcomes: formData.learningOutcomes.split('\n').filter(o => o.trim() !== ''),
      createdAt: new Date().toISOString()
    });
    navigate('/');
  };

  const handleSuggestOutcomes = async () => {
    if (!formData.title || !formData.description) {
      alert("Please provide a title and description first.");
      return;
    }
    setLoading(true);
    const outcomes = await generateLearningOutcomes(formData.title, formData.category, formData.description);
    setFormData(prev => ({ ...prev, learningOutcomes: outcomes.join('\n') }));
    setLoading(false);
  };

  const checkUrlSafety = (url: string) => {
    if (url.includes('github.com') && url.includes('/blob/')) {
        const fixed = url.replace('github.com', 'raw.githack.com').replace('/blob/', '/');
        if (confirm("I noticed this is a standard GitHub link. It won't work directly. Would you like me to convert it to an embed-friendly URL?")) {
            setFormData(p => ({ ...p, contentUrl: fixed }));
        }
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-in fade-in zoom-in-95 duration-700">
      <div className="flex items-center gap-6 mb-12">
        <button onClick={() => navigate(-1)} className="w-12 h-12 flex items-center justify-center bg-white border border-slate-200 rounded-2xl text-slate-600 hover:bg-slate-50 transition-all hover:scale-110 shadow-sm">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7 7-7m8 14l-7-7 7-7"></path></svg>
        </button>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Add New Lab Module</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10 bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-50/50 rounded-bl-[10rem] -z-0"></div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Resource Title</label>
            <input 
              required
              type="text"
              className="w-full px-6 py-4 rounded-[1.25rem] bg-slate-50 border border-slate-100 focus:ring-4 focus:ring-indigo-400/10 focus:bg-white focus:border-indigo-400 outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300"
              placeholder="e.g. Newton's Lab"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Creator</label>
            <input 
              required
              type="text"
              className="w-full px-6 py-4 rounded-[1.25rem] bg-slate-50 border border-slate-100 focus:ring-4 focus:ring-indigo-400/10 focus:bg-white focus:border-indigo-400 outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300"
              placeholder="Full Name"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
            />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Main Category</label>
            <select 
              className="w-full px-6 py-4 rounded-[1.25rem] bg-slate-50 border border-slate-100 focus:ring-4 focus:ring-indigo-400/10 focus:bg-white focus:border-indigo-400 outline-none transition-all font-bold text-slate-800"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              {CATEGORIES.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Sub-topic</label>
            <input 
              required
              type="text"
              className="w-full px-6 py-4 rounded-[1.25rem] bg-slate-50 border border-slate-100 focus:ring-4 focus:ring-indigo-400/10 focus:bg-white focus:border-indigo-400 outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300"
              placeholder="e.g. Gravity"
              value={formData.subCategory}
              onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
            />
          </div>

          <div className="space-y-3 md:col-span-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Resource Format</label>
            <div className="flex flex-wrap gap-4">
              {Object.values(ResourceType).map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({ ...formData, type })}
                  className={`flex-1 min-w-[120px] py-4 rounded-[1.25rem] border-2 font-black text-xs uppercase tracking-widest transition-all ${formData.type === type ? 'border-indigo-600 bg-indigo-50 text-indigo-600 shadow-lg shadow-indigo-100' : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200'}`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 md:col-span-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Content URL</label>
            <input 
              required
              type="url"
              className="w-full px-6 py-4 rounded-[1.25rem] bg-slate-50 border border-slate-100 focus:ring-4 focus:ring-indigo-400/10 focus:bg-white focus:border-indigo-400 outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300"
              placeholder="https://simulation-source.com/..."
              value={formData.contentUrl}
              onBlur={() => checkUrlSafety(formData.contentUrl)}
              onChange={(e) => setFormData({ ...formData, contentUrl: e.target.value })}
            />
          </div>

          <div className="space-y-3 md:col-span-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Thumbnail URL (Optional)</label>
            <input 
              type="url"
              className="w-full px-6 py-4 rounded-[1.25rem] bg-slate-50 border border-slate-100 focus:ring-4 focus:ring-indigo-400/10 focus:bg-white focus:border-indigo-400 outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300"
              placeholder="Leave blank for auto-image"
              value={formData.thumbnailUrl}
              onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-3 relative z-10">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Brief Narrative</label>
          <textarea 
            required
            rows={2}
            className="w-full px-6 py-4 rounded-[1.25rem] bg-slate-50 border border-slate-100 focus:ring-4 focus:ring-indigo-400/10 focus:bg-white focus:border-indigo-400 outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300 resize-none"
            placeholder="Tell the student what they'll discover..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="space-y-3 relative z-10">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Step-by-Step Instructions</label>
          <textarea 
            required
            rows={2}
            className="w-full px-6 py-4 rounded-[1.25rem] bg-slate-50 border border-slate-100 focus:ring-4 focus:ring-indigo-400/10 focus:bg-white focus:border-indigo-400 outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300 resize-none"
            placeholder="1. Slide the dial... 2. Observe the wave..."
            value={formData.userGuide}
            onChange={(e) => setFormData({ ...formData, userGuide: e.target.value })}
          />
        </div>

        <div className="space-y-4 relative z-10">
          <div className="flex items-center justify-between px-1">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Expected Outcomes</label>
            <button 
              type="button"
              onClick={handleSuggestOutcomes}
              disabled={loading}
              className="text-indigo-600 text-[10px] font-black uppercase tracking-[0.15em] hover:text-indigo-800 transition-colors flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-lg"
            >
              {loading ? (
                  <span className="flex items-center gap-2"><div className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div> Brainstorming...</span>
              ) : '✨ AI Suggest'}
            </button>
          </div>
          <textarea 
            required
            rows={4}
            className="w-full px-6 py-4 rounded-[1.25rem] bg-slate-50 border border-slate-100 focus:ring-4 focus:ring-indigo-400/10 focus:bg-white focus:border-indigo-400 outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300"
            placeholder="One key outcome per line..."
            value={formData.learningOutcomes}
            onChange={(e) => setFormData({ ...formData, learningOutcomes: e.target.value })}
          />
        </div>

        <div className="pt-10 border-t border-slate-100 flex flex-col sm:flex-row justify-end gap-4 relative z-10">
          <button 
            type="button"
            onClick={() => navigate(-1)}
            className="px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all"
          >
            Cancel
          </button>
          <button 
            type="submit"
            className="px-12 py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-[0_20px_40px_-15px_rgba(79,70,229,0.3)] hover:bg-indigo-700 hover:-translate-y-1 active:translate-y-0 transition-all"
          >
            Publish To Phrontier
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadForm;
