
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

  // The most stable binary upload method for modern browsers to Vercel Edge
  const uploadToCloud = async (file: File) => {
    setUploading(`Preparing ${file.name}...`);
    
    // Safety check for file size (Edge handles more but let's be reasonable)
    if (file.size > 25 * 1024 * 1024) {
      alert("File is too large. Max limit is 25MB for Edge uploads.");
      setUploading(null);
      throw new Error("File too large");
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minute timeout

    try {
      setUploading(`Transmitting ${file.name} to Cloud Vault...`);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: file, // Send binary directly
        headers: {
          'x-filename': encodeURIComponent(file.name),
          'x-content-type': file.type
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      const responseText = await response.text();
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        throw new Error(`Server returned invalid response: ${responseText.substring(0, 100)}`);
      }

      if (!response.ok) {
        throw new Error(result.error || 'Cloud synchronization failed.');
      }

      return result.url;
    } catch (e: any) {
      console.error("Cloud Upload Debug Log:", e);
      let errorMsg = "Cloud Sync Error";
      if (e.name === 'AbortError') {
        errorMsg = "Request timed out. Your connection might be slow.";
      } else {
        errorMsg = e.message || "Could not reach the cloud storage server.";
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
        // Error already alerted in uploadToCloud
        e.target.value = ''; // Reset input
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.contentUrl) {
      alert("Please provide the primary resource content (URL or File).");
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
        const errJson = await response.json();
        throw new Error(errJson.error || "Failed to commit resource to KV storage.");
      }
    } catch (err: any) {
      alert(err.message || "Network Error: Synchronization failed.");
    } finally {
      setLoading(false);
    }
  };

  const isSimulation = formData.type === ResourceType.SIMULATION;

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-in fade-in duration-700">
      <div className="flex items-center gap-8 mb-14">
        <button type="button" onClick={() => navigate(-1)} className="w-14 h-14 flex items-center justify-center bg-[#0F172A] border border-white/10 rounded-2xl text-slate-400 hover:text-white transition-all shadow-lg">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7 7-7m8 14l-7-7 7-7"></path></svg>
        </button>
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight leading-none mb-1">{editData ? 'Update Lab Module' : 'Publish to Phrontier'}</h1>
          <p className="text-indigo-500 text-[10px] font-black uppercase tracking-[0.3em]">Edge-Sync Multi-User Module</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-12 bg-[#0F172A] p-12 rounded-[4rem] border border-white/10 shadow-2xl relative overflow-hidden">
        {uploading && (
          <div className="absolute inset-0 bg-[#020617]/95 backdrop-blur-lg z-50 flex flex-col items-center justify-center p-12 text-center">
             <div className="relative mb-8">
                <div className="w-20 h-20 border-4 border-indigo-500/20 rounded-full"></div>
                <div className="absolute inset-0 w-20 h-20 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
             </div>
             <p className="font-black text-white uppercase tracking-[0.4em] text-sm animate-pulse mb-4">{uploading}</p>
             <p className="text-slate-500 text-[11px] max-w-xs leading-relaxed font-bold">Please do not refresh. Your file is being securely mirrored to our global CDN nodes.</p>
          </div>
        )}

        <div className="space-y-5">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Resource Type</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {Object.values(ResourceType).map(type => (
              <button key={type} type="button" onClick={() => setFormData({ ...formData, type })} className={`py-5 rounded-[2rem] border-2 font-black text-xs uppercase tracking-widest transition-all ${formData.type === type ? 'border-indigo-600 bg-indigo-600/10 text-indigo-400 shadow-2xl shadow-indigo-500/20 scale-[1.02]' : 'border-white/5 bg-white/5 text-slate-500 hover:bg-white/10'}`}>{type}</button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-4 md:col-span-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Resource Title</label>
            <input required type="text" placeholder="e.g. Wave-Particle Duality" className="w-full px-8 py-6 rounded-[2rem] bg-[#020617] border border-white/5 outline-none font-bold text-white focus:border-indigo-500/50 transition-all shadow-inner" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
          </div>

          <div className="space-y-4 md:col-span-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">{isSimulation ? 'Interactive Simulation URL' : 'Study Material Content'}</label>
            {isSimulation ? (
              <input required type="url" placeholder="https://phet.colorado.edu/..." className="w-full px-8 py-6 rounded-[2rem] bg-[#020617] border border-white/5 outline-none font-bold text-white focus:border-indigo-500/50 transition-all shadow-inner" value={formData.contentUrl} onChange={(e) => setFormData({ ...formData, contentUrl: e.target.value })} />
            ) : (
              <div className="flex flex-col sm:flex-row gap-5">
                <div className="flex-1 px-8 py-6 rounded-[2rem] bg-[#020617] border border-white/5 text-slate-400 font-bold text-sm truncate flex items-center">
                  {formData.contentUrl ? '✅ Content Mirrored to Cloud' : 'No document uploaded'}
                </div>
                <label className="shrink-0 bg-emerald-600 text-white px-10 py-6 rounded-[2rem] font-black text-xs uppercase tracking-widest cursor-pointer hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                  Select PDF/Image
                  <input type="file" className="hidden" accept="application/pdf,image/*" onChange={(e) => handleMediaUpload(e, 'contentUrl')} />
                </label>
              </div>
            )}
          </div>

          <div className="space-y-4 md:col-span-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Library Thumbnail (Visual ID)</label>
            <div className="flex flex-col sm:flex-row gap-5">
              <div className="flex-1 px-8 py-6 rounded-[2rem] bg-[#020617] border border-white/5 text-slate-400 font-bold text-sm truncate flex items-center">
                {formData.thumbnailUrl ? '✅ Identity mirrroring active' : 'Using automatic category branding'}
              </div>
              <label className="shrink-0 bg-indigo-600 text-white px-10 py-6 rounded-[2rem] font-black text-xs uppercase tracking-widest cursor-pointer hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-3">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                Sync Image
                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleMediaUpload(e, 'thumbnailUrl')} />
              </label>
            </div>
            {formData.thumbnailUrl && (
              <div className="mt-4 flex items-center gap-6 p-6 bg-white/5 rounded-[2.5rem] border border-white/5 group/preview">
                <img src={formData.thumbnailUrl} alt="Sync Preview" className="w-28 h-28 object-cover rounded-3xl ring-4 ring-indigo-500/20 group-hover/preview:scale-105 transition-transform" />
                <div>
                   <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-2">Sync Handshake Successful</p>
                   <button type="button" onClick={() => setFormData(prev => ({ ...prev, thumbnailUrl: '' }))} className="text-red-400 text-xs font-black hover:underline uppercase tracking-widest">De-Sync Image</button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Curriculum Abstract</label>
          <textarea required rows={3} placeholder="Describe the core learning objectives of this module..." className="w-full px-8 py-7 rounded-[2rem] bg-[#020617] border border-white/5 outline-none font-bold text-white resize-none focus:border-indigo-500/50 transition-all shadow-inner" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col sm:flex-row justify-end gap-6">
          <button type="button" onClick={() => navigate(-1)} className="px-12 py-6 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-600 hover:text-slate-400 transition-colors">Abort</button>
          <button type="submit" disabled={loading || !!uploading} className="px-16 py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-indigo-500/40 hover:bg-indigo-500 transition-all disabled:opacity-30 active:scale-95">
            {loading ? 'Finalizing Sync...' : (editData ? 'Sync Changes' : 'Push to Cloud Lab')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadForm;
