
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PhysicsResource, ResourceType } from '../types';
import { CATEGORIES } from '../constants';
import { generateLearningOutcomes } from '../services/geminiService';
import { Scale, Activity, Beaker, Sparkles, ArrowLeft, Send } from 'lucide-react';

interface UploadFormProps {
  onAdd: (resource: PhysicsResource) => void;
  onUpdate: (resource: PhysicsResource) => void;
  editData: PhysicsResource | null;
  adminName: string;
}

const UploadForm: React.FC<UploadFormProps> = ({ onAdd, onUpdate, editData, adminName }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    category: CATEGORIES[0].name,
    subCategory: CATEGORIES[0].subCategories[0],
    type: ResourceType.SIMULATION,
    author: adminName || '',
    description: '',
    userGuide: '',
    contentUrl: '',
    learningOutcomes: [] as string[],
    thumbnailUrl: '',
    keywords: ''
  });

  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (editData) {
      setFormData({ 
        ...editData, 
        keywords: editData.keywords?.join(', ') || '' 
      } as any);
    }
  }, [editData]);

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5MB");
      return;
    }

    setUploading(true);
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'x-filename': encodeURIComponent(file.name),
          'x-content-type': file.type
        },
        body: await file.arrayBuffer()
      });

      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({ ...prev, thumbnailUrl: data.url }));
      } else {
        throw new Error("Upload failed");
      }
    } catch (err) {
      alert("Upload Error: " + (err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const getPreviewIcon = () => {
    if (formData.thumbnailUrl) {
      return <img src={formData.thumbnailUrl} alt="Thumbnail" className="w-full h-full object-cover rounded-[2.5rem]" referrerPolicy="no-referrer" />;
    }
    const title = formData.title.toLowerCase();
    if (title.includes('gravit')) return <Scale className="w-16 h-16 text-emerald-400" />;
    if (title.includes('wave') || title.includes('oscillat')) return <Activity className="w-16 h-16 text-sky-400" />;
    return <Beaker className="w-16 h-16 text-indigo-400" />;
  };

  const handleMagicFill = async () => {
    if (!formData.title) return alert("Enter a title first.");
    setGeneratingAI(true);
    try {
      const outcomes = await generateLearningOutcomes(formData.title, formData.category, formData.description);
      setFormData(prev => ({ ...prev, learningOutcomes: outcomes }));
    } catch (err) {
      setFormData(prev => ({ ...prev, learningOutcomes: ["Master physics concepts", "Apply logic", "Solve problems"] }));
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = { 
        ...formData, 
        keywords: formData.keywords.split(',').map(k => k.trim()).filter(k => k),
        learningOutcomes: formData.learningOutcomes.length > 0 ? formData.learningOutcomes : ["Interactive Exploration"],
        id: editData ? editData.id : Date.now().toString(),
        createdAt: editData ? editData.createdAt : new Date().toISOString()
      };

      const response = await fetch('/api/resources', {
        method: editData ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        editData ? onUpdate(payload as any) : onAdd(payload as any);
        navigate('/');
      } else {
        const error = await response.json();
        throw new Error(error.error || "Sync rejected.");
      }
    } catch (err: any) {
      alert("Submission Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const activeCategoryObj = CATEGORIES.find(c => c.name === formData.category);

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-12">
        <button type="button" onClick={() => navigate(-1)} className="p-4 bg-[#0F172A] border border-white/10 rounded-2xl text-slate-400 hover:text-white transition-all">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-3xl font-black text-white tracking-tight">
          {editData ? 'Modify Module' : 'Quick Register'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#0F172A] p-8 sm:p-12 rounded-[3.5rem] border border-white/5 shadow-2xl space-y-10">
        <div className="flex flex-col md:flex-row gap-12 items-start">
          <div className="w-full md:w-1/3 flex flex-col items-center">
             <div className="w-40 h-40 bg-white/5 rounded-[2.5rem] border border-white/10 flex items-center justify-center mb-6 shadow-inner overflow-hidden relative group">
                {getPreviewIcon()}
                <label className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">
                    {uploading ? 'Uploading...' : 'Upload Thumbnail'}
                  </span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleThumbnailUpload} disabled={uploading} />
                </label>
             </div>
             <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Thumbnail (Max 5MB)</p>
          </div>

          <div className="flex-1 space-y-8 w-full">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Title</label>
              <input required type="text" className="w-full px-6 py-5 rounded-2xl bg-[#020617] border border-white/10 text-white font-bold outline-none focus:border-indigo-500 transition-all" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Category</label>
                <select className="w-full px-6 py-5 rounded-2xl bg-[#020617] border border-white/10 text-slate-300 font-bold outline-none" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value, subCategory: CATEGORIES.find(c => c.name === e.target.value)?.subCategories[0] || '' })}>
                  {CATEGORIES.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Sub-Category</label>
                <select className="w-full px-6 py-5 rounded-2xl bg-[#020617] border border-white/10 text-slate-300 font-bold outline-none" value={formData.subCategory} onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}>
                  {activeCategoryObj?.subCategories.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Resource Type</label>
                <select className="w-full px-6 py-5 rounded-2xl bg-[#020617] border border-white/10 text-slate-300 font-bold outline-none" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value as ResourceType })}>
                  {Object.values(ResourceType).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Source URL (GitHub/PDF/Sim)</label>
                <input required type="url" placeholder="https://..." className="w-full px-6 py-5 rounded-2xl bg-[#020617] border border-white/10 text-white font-bold outline-none" value={formData.contentUrl} onChange={(e) => setFormData({ ...formData, contentUrl: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Curator</label>
                <input required type="text" className="w-full px-6 py-5 rounded-2xl bg-[#020617] border border-white/10 text-white font-bold outline-none" value={formData.author} onChange={(e) => setFormData({ ...formData, author: e.target.value })} />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Keywords (comma separated)</label>
                <input type="text" placeholder="physics, lab, motion..." className="w-full px-6 py-5 rounded-2xl bg-[#020617] border border-white/10 text-white font-bold outline-none" value={formData.keywords} onChange={(e) => setFormData({ ...formData, keywords: e.target.value })} />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Abstract / Description</label>
              <textarea required rows={3} className="w-full px-6 py-5 rounded-2xl bg-[#020617] border border-white/10 text-white font-bold resize-none" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">User Guide / Briefing</label>
              <textarea rows={2} placeholder="How to use this resource..." className="w-full px-6 py-5 rounded-2xl bg-[#020617] border border-white/10 text-white font-bold resize-none" value={formData.userGuide} onChange={(e) => setFormData({ ...formData, userGuide: e.target.value })} />
            </div>

            <div className="pt-8 border-t border-white/5 space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-white uppercase tracking-widest">Outcomes</h4>
                <button type="button" onClick={handleMagicFill} disabled={generatingAI} className="flex items-center gap-2 text-[10px] font-black text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-widest">
                  {generatingAI ? 'Processing...' : <><Sparkles size={14} /> AI Predict</>}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.learningOutcomes.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No outcomes yet. Click AI Predict to generate.</p>
                ) : (
                  formData.learningOutcomes.map((o, i) => (
                    <div key={i} className="px-4 py-2 bg-white/5 rounded-xl text-[11px] text-slate-400 font-medium border border-white/5">• {o}</div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-10 flex justify-end gap-4">
              <button type="button" onClick={() => navigate(-1)} className="px-8 py-4 text-slate-500 font-bold uppercase text-[10px] tracking-widest">Discard</button>
              <button type="submit" disabled={loading} className="px-12 py-5 bg-indigo-600 text-white rounded-full font-black text-xs uppercase tracking-[0.2em] shadow-2xl flex items-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50">
                {loading ? 'Publishing...' : <>{editData ? 'Update Lab' : 'Publish Lab'} <Send size={14} /></>}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default UploadForm;
