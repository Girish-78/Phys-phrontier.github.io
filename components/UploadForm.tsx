
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

const UploadForm: React.FC<UploadFormProps> = ({ onAdd, onUpdate, editData }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  
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

  // Robust Binary Upload to Cloud
  const uploadToCloud = async (file: File) => {
    setUploading(`Syncing ${file.name}...`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90000); // 90s timeout for stability

    try {
      // Send raw binary to avoid multipart/form-data issues in serverless
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: file, // Send the file directly as the body
        headers: {
          'x-filename': encodeURIComponent(file.name),
          'x-content-type': file.type
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Cloud synchronization failed.');
      }

      const result = await response.json();
      return result.url;
    } catch (e: any) {
      console.error("Cloud Upload Error:", e);
      let errorMsg = "Upload failed.";
      if (e.name === 'AbortError') {
        errorMsg = "Connection timed out. Please check your internet and try a smaller file.";
      } else {
        errorMsg = e.message || "Failed to reach the cloud storage server.";
      }
      alert(errorMsg);
      throw e;
    } finally {
      setUploading(null);
      clearTimeout(timeoutId);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image must be smaller than 5MB.");
        return;
      }
      try {
        const url = await uploadToCloud(file);
        setFormData(prev => ({ ...prev, thumbnailUrl: url }));
      } catch (err) {}
    }
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert("PDF must be smaller than 10MB.");
        return;
      }
      try {
        const url = await uploadToCloud(file);
        setFormData(prev => ({ ...prev, contentUrl: url }));
      } catch (err) {}
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.contentUrl) {
      alert("Please upload a PDF or provide a Simulation URL.");
      return;
    }

    setLoading(true);
    
    const payload: PhysicsResource = {
      ...formData,
      id: editData ? editData.id : Date.now().toString(),
      learningOutcomes: formData.type === ResourceType.SIMULATION 
        ? (formData.learningOutcomes || '').split('\n').filter(o => o.trim() !== '')
        : [],
      userGuide: formData.type === ResourceType.SIMULATION ? (formData.userGuide || '') : '',
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
        throw new Error("Failed to save resource metadata to KV storage.");
      }
    } catch (err: any) {
      alert(err.message || "Network Error: Could not synchronize with the global database.");
    } finally {
      setLoading(false);
    }
  };

  const isSimulation = formData.type === ResourceType.SIMULATION;

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-in fade-in duration-700">
      <div className="flex items-center gap-8 mb-14">
        <button type="button" onClick={() => navigate(-1)} className="w-14 h-14 flex items-center justify-center bg-[#0F172A] border border-white/10 rounded-2xl text-slate-400 hover:text-white transition-all">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7 7-7m8 14l-7-7 7-7"></path></svg>
        </button>
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight leading-none mb-1">{editData ? 'Edit Phrontier Lab' : 'Publish New Content'}</h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em]">Global Library Synchronization</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-12 bg-[#0F172A] p-12 rounded-[4rem] border border-white/10 shadow-2xl relative">
        {uploading && (
          <div className="absolute inset-0 bg-[#020617]/90 backdrop-blur-md z-50 flex flex-col items-center justify-center rounded-[4rem] p-12 text-center">
             <div className="w-14 h-14 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-6"></div>
             <p className="font-black text-white uppercase tracking-[0.3em] text-sm animate-pulse mb-3">{uploading}</p>
             <p className="text-slate-500 text-xs max-w-xs leading-relaxed">Securing your material in the cloud vault. This resource will be available globally once finished.</p>
          </div>
        )}

        <div className="space-y-4 md:col-span-2">
          <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Resource Classification</label>
          <div className="flex flex-wrap gap-5">
            {Object.values(ResourceType).map(type => (
              <button key={type} type="button" onClick={() => setFormData({ ...formData, type })} className={`flex-1 min-w-[140px] py-5 rounded-[2rem] border-2 font-black text-xs uppercase tracking-widest transition-all ${formData.type === type ? 'border-indigo-600 bg-indigo-600/10 text-indigo-400 shadow-xl shadow-indigo-500/10' : 'border-white/5 bg-white/5 text-slate-500 hover:border-white/10'}`}>{type}</button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-4 md:col-span-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Module Title</label>
            <input required type="text" placeholder="e.g. Quantum Entanglement Basics" className="w-full px-8 py-6 rounded-[2rem] bg-[#020617] border border-white/5 outline-none font-bold text-white focus:border-indigo-500/50 transition-all shadow-inner" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
          </div>

          <div className="space-y-4 md:col-span-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">{isSimulation ? 'External Simulation Link' : 'Study Material (PDF)'}</label>
            {isSimulation ? (
              <input required type="url" placeholder="https://..." className="w-full px-8 py-6 rounded-[2rem] bg-[#020617] border border-white/5 outline-none font-bold text-white focus:border-indigo-500/50 transition-all shadow-inner" value={formData.contentUrl} onChange={(e) => setFormData({ ...formData, contentUrl: e.target.value })} />
            ) : (
              <div className="flex flex-col sm:flex-row gap-5 items-stretch">
                <input type="text" readOnly placeholder="No PDF Synchronized" className="flex-1 px-8 py-6 rounded-[2rem] bg-[#020617] border border-white/5 text-slate-500 font-bold overflow-hidden text-ellipsis" value={formData.contentUrl ? '✅ PDF Ready in Cloud' : ''} />
                <label className="shrink-0 bg-emerald-600 text-white px-10 py-6 rounded-[2rem] font-black text-xs uppercase tracking-widest cursor-pointer hover:bg-emerald-500 transition-all shadow-2xl shadow-emerald-500/20 text-center flex items-center justify-center">
                  Select PDF
                  <input type="file" className="hidden" accept="application/pdf" onChange={handlePdfUpload} />
                </label>
              </div>
            )}
          </div>

          <div className="space-y-4 md:col-span-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Thumbnail Identity</label>
            <div className="flex flex-col sm:flex-row gap-5 items-stretch">
              <input type="text" readOnly placeholder="Using category default" className="flex-1 px-8 py-6 rounded-[2rem] bg-[#020617] border border-white/5 text-slate-500 font-bold overflow-hidden text-ellipsis" value={formData.thumbnailUrl ? '✅ Image Synchronized' : ''} />
              <label className="shrink-0 bg-indigo-600 text-white px-10 py-6 rounded-[2rem] font-black text-xs uppercase tracking-widest cursor-pointer hover:bg-indigo-500 transition-all shadow-2xl shadow-indigo-500/20 text-center flex items-center justify-center">
                Select Image
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </label>
            </div>
            {formData.thumbnailUrl && (
              <div className="mt-4 flex items-center gap-6 p-4 bg-white/5 rounded-[2rem] border border-white/5">
                <img src={formData.thumbnailUrl} alt="Preview" className="w-24 h-24 object-cover rounded-2xl ring-4 ring-indigo-500/10" />
                <div>
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Preview Loaded</p>
                  <button type="button" onClick={() => setFormData(prev => ({ ...prev, thumbnailUrl: '' }))} className="text-red-400 text-xs font-bold hover:underline">Remove Image</button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Curriculum Abstract</label>
          <textarea required rows={3} placeholder="Provide a brief description of the topic covered..." className="w-full px-8 py-7 rounded-[2rem] bg-[#020617] border border-white/5 outline-none font-bold text-white resize-none focus:border-indigo-500/50 transition-all" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col sm:flex-row justify-end gap-6">
          <button type="button" onClick={() => navigate(-1)} className="px-12 py-6 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-600 hover:text-slate-400 transition-colors">Discard</button>
          <button type="submit" disabled={loading || !!uploading} className="px-14 py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-indigo-500/30 hover:bg-indigo-500 transition-all disabled:opacity-50 active:scale-95">
            {loading ? 'Committing to KV...' : (editData ? 'Sync Changes' : 'Publish to Global Lab')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadForm;
