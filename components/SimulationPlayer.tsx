
import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { PhysicsResource, ResourceType } from '../types';

interface SimulationPlayerProps {
  resources: PhysicsResource[];
}

const SimulationPlayer: React.FC<SimulationPlayerProps> = ({ resources }) => {
  const { id } = useParams<{ id: string }>();
  const resource = resources.find(r => r.id === id);

  if (!resource) return <Navigate to="/" />;

  const isSimulation = resource.type === ResourceType.SIMULATION;

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link to="/" className="text-sm font-bold text-blue-600 flex items-center gap-1 mb-2 hover:underline">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
            Back to Library
          </Link>
          <h1 className="text-4xl font-extrabold text-slate-900">{resource.title}</h1>
          <div className="flex items-center gap-3 mt-2 text-slate-500">
            <span className="font-semibold text-blue-600">{resource.category}</span>
            <span>•</span>
            <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded text-xs font-bold uppercase">{resource.type}</span>
            <span>•</span>
            <span>By {resource.author}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <a 
            href={resource.contentUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-white border-2 border-blue-600 text-blue-600 px-4 py-2 rounded-xl hover:bg-blue-50 transition-colors shadow-sm font-bold flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
            Open in New Tab
          </a>
          <button className="bg-white border-2 border-slate-200 p-2.5 rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
             <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 100-2.684 3 3 0 000 2.684zm0 12.684a3 3 0 100-2.684 3 3 0 000 2.684z"></path></svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="group aspect-video bg-slate-900 rounded-3xl overflow-hidden shadow-2xl relative border-4 border-white">
            {isSimulation ? (
              <>
                <iframe 
                  src={resource.contentUrl} 
                  className="w-full h-full border-none"
                  title={resource.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
                {/* Visual hint for blocked content */}
                <div className="absolute inset-0 pointer-events-none border-2 border-transparent group-hover:border-blue-400 transition-colors"></div>
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-white p-12 text-center">
                 <svg className="w-20 h-20 mb-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                 <h2 className="text-2xl font-bold mb-4">Reading Material</h2>
                 <p className="text-slate-400 mb-8 max-w-md">This resource is a PDF or Document. Click below to view the full file in your browser.</p>
                 <a 
                   href={resource.contentUrl} 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all"
                 >
                   Open {resource.type}
                 </a>
              </div>
            )}
          </div>

          {isSimulation && (
            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
              <svg className="w-5 h-5 text-amber-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              <div className="text-sm text-amber-800">
                <p className="font-bold">Trouble viewing the simulation?</p>
                <p className="mt-0.5">Some sources (like GitHub or University sites) restrict embedding for security. If the area above is blank or shows an error, please <a href={resource.contentUrl} target="_blank" rel="noopener noreferrer" className="font-bold underline">click here to launch the simulation in a new window</a>.</p>
              </div>
            </div>
          )}
          
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              About this Resource
            </h3>
            <p className="text-slate-600 leading-relaxed text-lg">{resource.description}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-blue-600 text-white rounded-3xl p-8 shadow-lg shadow-blue-200">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
              Learning Outcomes
            </h3>
            <ul className="space-y-4">
              {resource.learningOutcomes.map((outcome, idx) => (
                <li key={idx} className="flex gap-3">
                  <span className="w-6 h-6 min-w-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">
                    {idx + 1}
                  </span>
                  <span className="font-medium text-blue-50 leading-snug">{outcome}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
              User Guide
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-100 italic">
              "{resource.userGuide}"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimulationPlayer;
