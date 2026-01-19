
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

  // Handle actual Cloud Upload via API with timeout and error handling
  const uploadToCloud = async (file: File) => {
    setUploading(`Uploading ${file.name}...`);
    
    // Create an AbortController to handle timeouts
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

    try {
      const data = new FormData();
      data.append('file', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: data,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();
      return result.url;
    } catch (e: any) {
      console.error("Cloud Upload Error:", e);
      let errorMsg = "Upload failed.";
      if (e.name === 'AbortError') {
        errorMsg = "Request timed out. The file might be too large or the server is busy.";
      } else {
        errorMsg = e.message || "Failed to upload to Vercel Blob.";
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
      // Basic size check before attempting upload
      if (file.size > 4.5 * 1024 * 1024) {
        alert("Image is too large. Please keep it under 4.5MB.");
        return;
      }
      try {
        const url = await uploadToCloud(file);
        setFormData(prev => ({ ...prev, thumbnailUrl: url }));
      } catch (err) {
        // Error already handled in uploadToCloud
      }
    }
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4.5 * 1024 * 1024) {
        alert("PDF is too large. Please keep it under 4.5MB.");
        return;
      }
      try {
        const url = await uploadToCloud(file);
        setFormData(prev => ({ ...prev, contentUrl: url }));
      } catch (err) {
        // Error already handled
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.contentUrl) {
      alert("Please provide a simulation URL or upload a PDF.");
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
        throw new Error("Failed to save to cloud database.");
      }
    } catch (err: any) {
      alert(err.message || "Error saving to Cloud Database.");
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestOutcomes = async () => {
    if (!formData.title || !formData.description) return;
    setLoading(true);
    const outcomes = await generateLearningOutcomes(formData.title, formData.category, formData.description);
    setFormData(prev => ({ ...prev, learningOutcomes: outcomes.join('\n') }));
    setLoading(false);
  };

  const isSimulation = formData.type === ResourceType.SIMULATION;

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-in fade-in duration-700">
      <div className="flex items-center gap-8 mb-14">
        <button type="button" onClick={() => navigate(-1)} className="w-14 h-14 flex items-center justify-center bg-[#0F172A] border border-white/10 rounded-2xl text-slate-400 hover:text-white transition-all">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7 7-7m8 14l-7-7 7-7"></path></svg>
        </button>
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight leading-none mb-1">{editData ? 'Modify Resource' : 'Publish Content'}</h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em]">Cloud Sync Module</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-12 bg-[#0F172A] p-12 rounded-[4rem] border border-white/10 shadow-2xl relative">
        {uploading && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center rounded-[4rem] p-10 text-center">
             <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
             <p className="font-black text-white uppercase tracking-widest text-xs animate-pulse mb-2">{uploading}</p>
             <p className="text-slate-400 text-[10px] max-w-xs">This might take a minute depending on your connection.</p>
          </div>
        )}

        <div className="space-y-4 md:col-span-2">
          <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Resource Classification</label>
          <div className="flex flex-wrap gap-5">
            {Object.values(ResourceType).map(type => (
              <button key={type} type="button" onClick={() => setFormData({ ...formData, type })} className={`flex-1 min-w-[140px] py-5 rounded-[2rem] border-2 font-black text-xs uppercase tracking-widest transition-all ${formData.type === type ? 'border-indigo-600 bg-indigo-600/10 text-indigo-400' : 'border-white/5 bg-white/5 text-slate-500 hover:border-white/10'}`}>{type}</button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-4">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Resource Title</label>
            <input required type="text" className="w-full px-7 py-5 rounded-[1.75rem] bg-[#020617] border border-white/5 outline-none font-bold text-white" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
          </div>

          <div className="space-y-4 md:col-span-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">{isSimulation ? 'Simulation URL' : 'Worksheet Content (Cloud PDF)'}</label>
            {isSimulation ? (
              <input required type="url" className="w-full px-7 py-5 rounded-[1.75rem] bg-[#020617] border border-white/5 outline-none font-bold text-white" value={formData.contentUrl} onChange={(e) => setFormData({ ...formData, contentUrl: e.target.value })} />
            ) : (
              <div className="flex flex-col sm:flex-row gap-5 items-start">
                <input type="text" readOnly className="flex-1 w-full px-7 py-5 rounded-[1.75rem] bg-[#020617] border border-white/5 text-slate-500 font-bold" value={formData.contentUrl ? 'PDF Stored in Vercel Blob' : 'No file chosen'} />
                <label className="w-full sm:w-auto shrink-0 bg-emerald-600 text-white px-10 py-5 rounded-[1.75rem] font-black text-xs uppercase tracking-widest cursor-pointer hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-500/20 text-center">
                  Select PDF
                  <input type="file" className="hidden" accept="application/pdf" onChange={handlePdfUpload} />
                </label>
              </div>
            )}
          </div>

          <div className="space-y-4 md:col-span-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Module Branding (Cloud Image)</label>
            <div className="flex flex-col sm:flex-row gap-5 items-start">
              <input type="text" readOnly className="flex-1 w-full px-7 py-5 rounded-[1.75rem] bg-[#020617] border border-white/5 text-slate-500 font-bold" value={formData.thumbnailUrl ? 'Thumbnail Hosted in Blob' : 'Using Category Default'} />
              <label className="w-full sm:w-auto shrink-0 bg-indigo-600 text-white px-10 py-5 rounded-[1.75rem] font-black text-xs uppercase tracking-widest cursor-pointer hover:bg-indigo-500 transition-all shadow-xl text-center">
                Select Image
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </label>
            </div>
            {formData.thumbnailUrl && (
              <div className="mt-4 flex items-center gap-4">
                <img src={formData.thumbnailUrl} alt="Preview" className="w-20 h-20 object-cover rounded-2xl border border-white/10" />
                <button type="button" onClick={() => setFormData(prev => ({ ...prev, thumbnailUrl: '' }))} className="text-red-400 text-[10px] font-black uppercase tracking-widest hover:underline">Remove</button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Brief Abstract</label>
          <textarea required rows={2} className="w-full px-7 py-5 rounded-[1.75rem] bg-[#020617] border border-white/5 outline-none font-bold text-white resize-none" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col sm:flex-row justify-end gap-5">
          <button type="button" onClick={() => navigate(-1)} className="px-12 py-6 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-600 hover:text-slate-400">Discard</button>
          <button type="submit" disabled={loading || !!uploading} className="px-14 py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-indigo-500 transition-all disabled:opacity-50">
            {loading ? 'Saving to Cloud...' : (editData ? 'Sync Changes' : 'Push to Cloud Library')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadForm;
