
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PhysicsResource, ResourceType } from '../types';
import { CATEGORIES } from '../constants';
import { generateLearningOutcomes } from '../services/geminiService';

interface UploadFormProps {
  onAdd: (resource: PhysicsResource) => void;
  onUpdate: (resource: PhysicsResource) => void;
  editData: PhysicsResource | null;
}

const MAX_FILE_SIZE = 2.5 * 1024 * 1024; // 2.5MB limit for Base64 safety in LocalStorage

const UploadForm: React.FC<UploadFormProps> = ({ onAdd, onUpdate, editData }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Safety check: ensure required strings aren't null
    const payload: PhysicsResource = {
      ...formData,
      id: editData ? editData.id : Date.now().toString(),
      learningOutcomes: formData.type === ResourceType.SIMULATION 
        ? (formData.learningOutcomes || '').split('\n').filter(o => o.trim() !== '')
        : [],
      userGuide: formData.type === ResourceType.SIMULATION ? (formData.userGuide || '') : '',
      createdAt: editData ? editData.createdAt : new Date().toISOString()
    } as PhysicsResource;

    if (editData) {
      onUpdate(payload);
    } else {
      onAdd(payload);
    }
    navigate('/');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        alert("Image is too large! Please choose an image under 2MB to ensure it can be saved in the browser.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, thumbnailUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert("Please upload a valid PDF file.");
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        alert("PDF is too large! Please choose a file under 2MB for browser memory safety.");
        return;
      }
      setUploadProgress("Reading PDF...");
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, contentUrl: reader.result as string }));
        setUploadProgress("PDF Ready!");
        setTimeout(() => setUploadProgress(null), 2000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSuggestOutcomes = async () => {
    if (!formData.title || !formData.description) {
      alert("Required: Provide a title and description for AI analysis.");
      return;
    }
    setLoading(true);
    const outcomes = await generateLearningOutcomes(formData.title, formData.category, formData.description);
    setFormData(prev => ({ ...prev, learningOutcomes: outcomes.join('\n') }));
    setLoading(false);
  };

  const isSimulation = formData.type === ResourceType.SIMULATION;

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-in fade-in zoom-in-95 duration-700">
      <div className="flex items-center gap-8 mb-14">
        <button type="button" onClick={() => navigate(-1)} className="w-14 h-14 flex items-center justify-center bg-[#0F172A] border border-white/10 rounded-2xl text-slate-400 hover:text-white transition-all shadow-xl">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7 7-7m8 14l-7-7 7-7"></path></svg>
        </button>
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight leading-none mb-1">
            {editData ? 'Modify Resource' : 'Publish Content'}
          </h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em]">Module Configuration Terminal</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-12 bg-[#0F172A] p-12 rounded-[4rem] border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-bl-[15rem] -z-0"></div>
        
        <div className="space-y-4 md:col-span-2 relative z-10">
          <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Resource Classification</label>
          <div className="flex flex-wrap gap-5">
            {Object.values(ResourceType).map(type => (
              <button
                key={type}
                type="button"
                onClick={() => setFormData({ ...formData, type })}
                className={`flex-1 min-w-[140px] py-5 rounded-[2rem] border-2 font-black text-xs uppercase tracking-widest transition-all ${formData.type === type ? 'border-indigo-600 bg-indigo-600/10 text-indigo-400 shadow-2xl shadow-indigo-500/10' : 'border-white/5 bg-white/5 text-slate-500 hover:border-white/10'}`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
          <div className="space-y-4">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Resource Title</label>
            <input 
              required
              type="text"
              className="w-full px-7 py-5 rounded-[1.75rem] bg-[#020617] border border-white/5 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/40 outline-none transition-all font-bold text-white placeholder:text-slate-700"
              placeholder="e.g. Circular Motion Lab"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="space-y-4">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Author / Institution</label>
            <input 
              required
              type="text"
              className="w-full px-7 py-5 rounded-[1.75rem] bg-[#020617] border border-white/5 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/40 outline-none transition-all font-bold text-white placeholder:text-slate-700"
              placeholder="Primary Creator"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
            />
          </div>

          <div className="space-y-4">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Category</label>
            <select 
              className="w-full px-7 py-5 rounded-[1.75rem] bg-[#020617] border border-white/5 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/40 outline-none transition-all font-bold text-white"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              {CATEGORIES.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>

          <div className="space-y-4">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Focus Sub-topic</label>
            <input 
              required
              type="text"
              className="w-full px-7 py-5 rounded-[1.75rem] bg-[#020617] border border-white/5 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/40 outline-none transition-all font-bold text-white placeholder:text-slate-700"
              placeholder="e.g. Centripetal Force"
              value={formData.subCategory}
              onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
            />
          </div>

          <div className="space-y-4 md:col-span-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">
              {isSimulation ? 'Simulation URL (Link)' : 'Worksheet Content (PDF)'}
            </label>
            
            {isSimulation ? (
              <input 
                required
                type="url"
                className="w-full px-7 py-5 rounded-[1.75rem] bg-[#020617] border border-white/5 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/40 outline-none transition-all font-bold text-white placeholder:text-slate-700"
                placeholder="https://..."
                value={formData.contentUrl}
                onChange={(e) => setFormData({ ...formData, contentUrl: e.target.value })}
              />
            ) : (
              <div className="flex flex-col sm:flex-row gap-5 items-start">
                <input 
                  type="text"
                  className="w-full px-7 py-5 rounded-[1.75rem] bg-[#020617] border border-white/5 focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-white placeholder:text-slate-700"
                  placeholder="Paste PDF link or upload local PDF ->"
                  value={formData.contentUrl.startsWith('data:') ? 'Local PDF Uploaded' : formData.contentUrl}
                  onChange={(e) => setFormData({ ...formData, contentUrl: e.target.value })}
                />
                <label className="w-full sm:w-auto shrink-0 bg-emerald-600 text-white px-10 py-5 rounded-[1.75rem] font-black text-xs uppercase tracking-widest cursor-pointer hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-500/20 text-center">
                  Upload PDF
                  <input type="file" className="hidden" accept="application/pdf" onChange={handlePdfUpload} />
                </label>
              </div>
            )}
            {uploadProgress && <p className="text-emerald-400 text-[10px] font-black uppercase mt-2 px-2">{uploadProgress}</p>}
          </div>

          <div className="space-y-4 md:col-span-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Module Branding (Thumbnail)</label>
            <div className="flex flex-col sm:flex-row gap-5 items-start">
              <div className="relative group flex-1 w-full">
                <input 
                  type="text"
                  className="w-full px-7 py-5 rounded-[1.75rem] bg-[#020617] border border-white/5 focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-white placeholder:text-slate-700"
                  placeholder="Paste Image URL or use local file ->"
                  value={formData.thumbnailUrl.startsWith('data:') ? 'Local Image Uploaded' : formData.thumbnailUrl}
                  onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                />
              </div>
              <label className="w-full sm:w-auto shrink-0 bg-indigo-600 text-white px-10 py-5 rounded-[1.75rem] font-black text-xs uppercase tracking-widest cursor-pointer hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-500/20 text-center">
                Upload Image
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </label>
            </div>
            {formData.thumbnailUrl && (
              <div className="mt-4 h-24 w-40 rounded-2xl overflow-hidden border border-white/10">
                <img src={formData.thumbnailUrl} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </div>

        {isSimulation && (
          <>
            <div className="space-y-4 relative z-10">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Quick Guide (Instructions)</label>
              <textarea 
                required
                rows={3}
                className="w-full px-7 py-5 rounded-[1.75rem] bg-[#020617] border border-white/5 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold text-white placeholder:text-slate-700 resize-none"
                placeholder="Step-by-step instructions for the student..."
                value={formData.userGuide}
                onChange={(e) => setFormData({ ...formData, userGuide: e.target.value })}
              />
            </div>

            <div className="space-y-6 relative z-10">
              <div className="flex items-center justify-between px-1">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Target Outcomes</label>
                <button 
                  type="button"
                  onClick={handleSuggestOutcomes}
                  disabled={loading}
                  className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] hover:text-indigo-300 transition-colors flex items-center gap-2 bg-indigo-500/10 px-4 py-2.5 rounded-xl border border-indigo-500/20 shadow-xl shadow-indigo-500/5"
                >
                  {loading ? (
                      <span className="flex items-center gap-2 animate-pulse">✨ Analyzing...</span>
                  ) : '✨ Generate with Gemini AI'}
                </button>
              </div>
              <textarea 
                required
                rows={4}
                className="w-full px-7 py-5 rounded-[1.75rem] bg-[#020617] border border-white/5 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold text-white placeholder:text-slate-700"
                placeholder="1. Outcome One&#10;2. Outcome Two..."
                value={formData.learningOutcomes}
                onChange={(e) => setFormData({ ...formData, learningOutcomes: e.target.value })}
              />
            </div>
          </>
        )}

        <div className="space-y-4 relative z-10">
          <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Brief Abstract (Description)</label>
          <textarea 
            required
            rows={2}
            className="w-full px-7 py-5 rounded-[1.75rem] bg-[#020617] border border-white/5 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold text-white placeholder:text-slate-700 resize-none"
            placeholder="Summarize the learning goals..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col sm:flex-row justify-end gap-5 relative z-10">
          <button 
            type="button"
            onClick={() => navigate(-1)}
            className="px-12 py-6 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-600 hover:text-slate-400 transition-all"
          >
            Discard
          </button>
          <button 
            type="submit"
            className="px-14 py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-indigo-500/30 hover:bg-indigo-500 hover:-translate-y-1 active:translate-y-0 transition-all"
          >
            {editData ? 'Sync Changes' : 'Publish to Phrontier'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadForm;
