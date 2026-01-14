
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
    learningOutcomes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newResource: PhysicsResource = {
      id: Date.now().toString(),
      title: formData.title,
      category: formData.category,
      subCategory: formData.subCategory,
      type: formData.type,
      author: formData.author,
      description: formData.description,
      userGuide: formData.userGuide,
      contentUrl: formData.contentUrl,
      learningOutcomes: formData.learningOutcomes.split('\n').filter(o => o.trim() !== ''),
      createdAt: new Date().toISOString()
    };
    onAdd(newResource);
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

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7 7-7m8 14l-7-7 7-7"></path></svg>
        </button>
        <h1 className="text-3xl font-extrabold text-slate-900">Add New Resource</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Resource Title</label>
            <input 
              required
              type="text"
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-400 outline-none"
              placeholder="e.g. Newton's Second Law Simulation"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Author / Creator</label>
            <input 
              required
              type="text"
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-400 outline-none"
              placeholder="Your name or organization"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Category</label>
            <select 
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-400 outline-none"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              {CATEGORIES.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Sub-category</label>
            <input 
              required
              type="text"
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-400 outline-none"
              placeholder="e.g. Dynamics"
              value={formData.subCategory}
              onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Resource Type</label>
            <div className="flex gap-4">
              {Object.values(ResourceType).map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({ ...formData, type })}
                  className={`flex-1 py-3 rounded-xl border-2 font-bold text-sm transition-all ${formData.type === type ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-bold text-slate-700">Content URL (Simulation or File Link)</label>
            <input 
              required
              type="url"
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-400 outline-none"
              placeholder="https://..."
              value={formData.contentUrl}
              onChange={(e) => setFormData({ ...formData, contentUrl: e.target.value })}
            />
            <div className="bg-blue-50 p-4 rounded-xl text-xs text-blue-700 mt-2 border border-blue-100">
              <p className="font-bold mb-1 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Admin Pro-tip for GitHub Users:
              </p>
              <p>Standard GitHub links (e.g., <code>github.com/user/repo/blob/index.html</code>) <strong>will not work</strong> in the player because GitHub blocks embedding. Use <strong>GitHub Pages</strong>, Vercel, or a tool like <code>raw.githack.com</code> to get an embeddable URL.</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Short Description</label>
          <textarea 
            required
            rows={2}
            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-400 outline-none"
            placeholder="A brief overview of what this resource covers..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">User Guide / Instructions</label>
          <textarea 
            required
            rows={2}
            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-400 outline-none"
            placeholder="Step-by-step instructions for the student..."
            value={formData.userGuide}
            onChange={(e) => setFormData({ ...formData, userGuide: e.target.value })}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-slate-700">Learning Outcomes (one per line)</label>
            <button 
              type="button"
              onClick={handleSuggestOutcomes}
              disabled={loading}
              className="text-blue-600 text-xs font-black uppercase hover:underline flex items-center gap-1 disabled:opacity-50"
            >
              {loading ? 'AI Thinking...' : '✨ Suggest with Gemini AI'}
            </button>
          </div>
          <textarea 
            required
            rows={4}
            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-400 outline-none"
            placeholder="1. Understand friction forces&#10;2. Calculate coefficients of static friction..."
            value={formData.learningOutcomes}
            onChange={(e) => setFormData({ ...formData, learningOutcomes: e.target.value })}
          />
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end gap-4">
          <button 
            type="button"
            onClick={() => navigate(-1)}
            className="px-8 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            className="px-10 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all hover:-translate-y-0.5"
          >
            Publish Resource
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadForm;
