
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PhysicsResource, ResourceType } from '../types';
import { CATEGORIES } from '../constants';

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

  // High-reliability ArrayBuffer upload for Edge
  const uploadToCloud = async (file: File) => {
    setUploading(`Processing ${file.name}...`);
    
    // Read the file as an ArrayBuffer locally first
    // This is much more stable than sending the File object directly in some environments
    const buffer = await file.arrayBuffer();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 180000); // 3-minute window for large PDFs

    try {
      setUploading(`Mirroring to Global CDN...`);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: buffer, // Send the pre-loaded buffer
        headers: {
          'x-filename': encodeURIComponent(file.name),
          'x-content-type': file.type
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'The cloud handshake failed.');
      }

      return result.url;
    } catch (e: any) {
      console.error("Cloud Handshake Error:", e);
      let errorMsg = "Cloud Sync Issue";
      if (e.name === 'AbortError') {
        errorMsg = "Sync timed out. Please check your network stability.";
      } else {
        errorMsg = e.message || "Failed to reach the global storage server.";
      }
      alert(errorMsg);
      throw e;
    } finally {
      setUploading(null);
      clearTimeout(timeoutId);
    }
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'thumbnailUrl' | 'contentUrl') => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const url = await uploadToCloud(file);
        setFormData(prev => ({ ...prev, [field]: url }));
      } catch (err) {
        e.target.value = ''; // Reset on error
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.contentUrl) {
      alert("Please upload the required PDF/Image or provide a Simulation Link.");
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
        // Add a slight delay to allow KV propagation before navigating
        setTimeout(() => navigate('/'), 500);
      } else {
        const errJson = await response.json();
        throw new Error(errJson.error || "Global DB refused the update.");
      }
    } catch (err: any) {
      alert(err.message || "Synchronization check failed. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const isSimulation = formData.type === ResourceType.SIMULATION;

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-in fade-in duration-700">
      <div className="flex items-center gap-8 mb-14">
        <button type="button" onClick={() => navigate(-1)} className="w-14 h-14 flex items-center justify-center bg-[#0F172A] border border-white/10 rounded-2xl text-slate-400 hover:text-white transition-all shadow-lg active:scale-90">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7 7-7m8 14l-7-7 7-7"></path></svg>
        </button>
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight leading-none mb-1">{editData ? 'Modify Lab' : 'Global Distribution'}</h1>
          <p className="text-indigo-500 text-[10px] font-black uppercase tracking-[0.3em] bg-indigo-500/10 px-3 py-1 rounded-full inline-block">Cloud Sync Engine Active</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-12 bg-[#0F172A] p-12 rounded-[4rem] border border-white/10 shadow-2xl relative overflow-hidden">
        {uploading && (
          <div className="absolute inset-0 bg-[#020617]/95 backdrop-blur-2xl z-50 flex flex-col items-center justify-center p-12 text-center">
             <div className="relative mb-10 scale-125">
                <div className="w-24 h-24 border-4 border-indigo-500/10 rounded-full"></div>
                <div className="absolute inset-0 w-24 h-24 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="w-2 h-2 bg-indigo-500 rounded-full animate-ping"></div>
                </div>
             </div>
             <p className="font-black text-white uppercase tracking-[0.4em] text-sm mb-4">{uploading}</p>
             <p className="text-slate-500 text-[11px] max-w-xs leading-relaxed font-bold uppercase tracking-widest opacity-60">Synchronizing across global edge nodes...</p>
          </div>
        )}

        <div className="space-y-5">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Resource Blueprint</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {Object.values(ResourceType).map(type => (
              <button key={type} type="button" onClick={() => setFormData({ ...formData, type })} className={`py-6 rounded-[2rem] border-2 font-black text-[11px] uppercase tracking-widest transition-all ${formData.type === type ? 'border-indigo-600 bg-indigo-600/10 text-indigo-400 shadow-2xl shadow-indigo-500/20' : 'border-white/5 bg-white/5 text-slate-500 hover:bg-white/10'}`}>{type}</button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-4 md:col-span-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Resource Identity (Title)</label>
            <input required type="text" placeholder="e.g. Newton's Third Law in Space" className="w-full px-8 py-6 rounded-[2.25rem] bg-[#020617] border border-white/5 outline-none font-bold text-white focus:border-indigo-500/50 transition-all shadow-inner" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
          </div>

          <div className="space-y-4 md:col-span-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">{isSimulation ? 'Interactive Simulation URL' : 'Study Document (Cloud PDF/Image)'}</label>
            {isSimulation ? (
              <input required type="url" placeholder="https://..." className="w-full px-8 py-6 rounded-[2.25rem] bg-[#020617] border border-white/5 outline-none font-bold text-white focus:border-indigo-500/50 transition-all shadow-inner" value={formData.contentUrl} onChange={(e) => setFormData({ ...formData, contentUrl: e.target.value })} />
            ) : (
              <div className="flex flex-col sm:flex-row gap-5">
                <div className="flex-1 px-8 py-6 rounded-[2.25rem] bg-[#020617] border border-white/5 text-emerald-400 font-black text-[11px] uppercase tracking-widest truncate flex items-center shadow-inner">
                  {formData.contentUrl ? '✅ Document Ready' : 'Document Pending Upload'}
                </div>
                <label className="shrink-0 bg-emerald-600 text-white px-10 py-6 rounded-[2rem] font-black text-xs uppercase tracking-widest cursor-pointer hover:bg-emerald-500 transition-all shadow-2xl shadow-emerald-500/20 flex items-center justify-center gap-3 active:scale-95">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                  Upload File
                  <input type="file" className="hidden" accept="application/pdf,image/*" onChange={(e) => handleMediaUpload(e, 'contentUrl')} />
                </label>
              </div>
            )}
          </div>

          <div className="space-y-4 md:col-span-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Thumbnail Identity</label>
            <div className="flex flex-col sm:flex-row gap-5">
              <div className="flex-1 px-8 py-6 rounded-[2.25rem] bg-[#020617] border border-white/5 text-indigo-400 font-black text-[11px] uppercase tracking-widest truncate flex items-center shadow-inner">
                {formData.thumbnailUrl ? '✅ Visual Sync Active' : 'Automatic Branding Active'}
              </div>
              <label className="shrink-0 bg-indigo-600 text-white px-10 py-6 rounded-[2.25rem] font-black text-xs uppercase tracking-widest cursor-pointer hover:bg-indigo-500 transition-all shadow-2xl shadow-indigo-500/20 flex items-center justify-center gap-3 active:scale-95">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                Sync Image
                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleMediaUpload(e, 'thumbnailUrl')} />
              </label>
            </div>
            {formData.thumbnailUrl && (
              <div className="mt-4 flex items-center gap-8 p-8 bg-white/5 rounded-[3rem] border border-white/5 relative group/preview">
                <div className="relative">
                   <img src={formData.thumbnailUrl} alt="Sync Preview" className="w-32 h-32 object-cover rounded-[2rem] ring-4 ring-indigo-500/20 group-hover/preview:scale-105 transition-transform shadow-2xl" />
                   <div className="absolute -top-3 -right-3 bg-emerald-500 p-1.5 rounded-full shadow-lg">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                   </div>
                </div>
                <div>
                   <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-3 bg-indigo-500/10 px-4 py-1.5 rounded-full inline-block border border-indigo-500/20">Sync Successful</p>
                   <p className="text-slate-500 text-xs mb-4 font-medium italic">"This visual will identify your module in the global discovery engine."</p>
                   <button type="button" onClick={() => setFormData(prev => ({ ...prev, thumbnailUrl: '' }))} className="text-red-400 text-[10px] font-black hover:text-red-300 uppercase tracking-widest flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      De-Sync Identity
                   </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Curriculum Abstract</label>
          <textarea required rows={4} placeholder="Summarize the core concepts covered in this module for the global library..." className="w-full px-8 py-8 rounded-[2.5rem] bg-[#020617] border border-white/5 outline-none font-bold text-white resize-none focus:border-indigo-500/50 transition-all shadow-inner" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col sm:flex-row justify-end gap-6">
          <button type="button" onClick={() => navigate(-1)} className="px-12 py-6 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-600 hover:text-slate-400 transition-colors">Abort Mission</button>
          <button type="submit" disabled={loading || !!uploading} className="px-20 py-7 bg-indigo-600 text-white rounded-[2.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-indigo-500/50 hover:bg-indigo-500 transition-all disabled:opacity-20 active:scale-95 flex items-center justify-center gap-3">
            {loading ? 'Finalizing Sync...' : (editData ? 'Sync Changes' : 'Publish to Global Phrontier')}
            {!loading && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadForm;
