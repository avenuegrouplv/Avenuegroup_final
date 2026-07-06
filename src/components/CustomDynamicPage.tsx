import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Image as ImageIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useLanguage } from '../LanguageContext';
import { customPages } from '../data/pages';

export const CustomDynamicPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { language } = useLanguage();
  const navigate = useNavigate();

  // Find the custom page matching the slug
  const page = customPages.find((p) => p.slug === slug);

  if (!page) {
    return (
      <div className="bg-[#ebebeb] min-h-screen pb-24 text-zinc-800 flex flex-col items-center justify-center p-6">
        <div className="text-center max-w-md bg-white border border-zinc-200 p-8 shadow-sm rounded-none">
          <FileText size={48} className="text-yellow-600 mx-auto mb-4" />
          <h1 className="text-xl font-black italic text-zinc-950 uppercase mb-2">
            {language === 'lv' ? 'Lapa nav atrasta' : 'Page Not Found'}
          </h1>
          <p className="text-zinc-500 text-sm mb-6">
            {language === 'lv' 
              ? 'Pieprasītā sadaļa neeksistē vai ir izdzēsta.' 
              : 'The requested section does not exist or has been deleted.'}
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-zinc-950 text-white hover:bg-yellow-500 hover:text-zinc-950 px-8 py-3 font-black text-xs uppercase tracking-widest transition-all w-full cursor-pointer"
          >
            {language === 'lv' ? 'Atpakaļ uz sākumu' : 'Back to Home'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#ebebeb] min-h-screen pb-24 text-zinc-800 relative overflow-hidden">
      <div className="container mx-auto px-6 max-w-4xl relative z-10">
        
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="group flex items-center gap-3 bg-white border border-zinc-200/80 px-6 py-2.5 font-bold text-xs uppercase tracking-widest hover:bg-zinc-950 hover:text-white transition-all duration-300 mb-12 shadow-sm rounded-none cursor-pointer"
        >
          <ArrowLeft size={16} className="transform group-hover:-translate-x-1 transition-transform" />
          <span>{language === 'lv' ? 'Atpakaļ' : 'Back'}</span>
        </button>

        {/* Page Title & Intro */}
        <div className="mb-12">
          <div className="flex items-center space-x-3 text-yellow-600 mb-4 h-12">
            <FileText size={36} />
            <h1 className="text-2xl md:text-4xl font-black italic tracking-tighter text-zinc-950 uppercase leading-none">
              {page.title}
            </h1>
          </div>
          <div className="h-1 w-20 bg-yellow-600"></div>
        </div>

        {/* Page Content Card */}
        <div className="space-y-8 bg-white p-6 md:p-10 border border-zinc-200 shadow-sm mb-12">
          
          {/* Rich Content Renderer */}
          <div className="prose max-w-none text-zinc-800 leading-relaxed text-sm md:text-base space-y-4">
            <ReactMarkdown>{page.content}</ReactMarkdown>
          </div>

          {/* Image Gallery Block */}
          {page.images && page.images.length > 0 && (
            <div className="pt-8 border-t border-zinc-150">
              <div className="flex items-center gap-2 text-zinc-950 mb-6">
                <ImageIcon size={20} className="text-yellow-600" />
                <h3 className="font-black italic text-sm md:text-base uppercase tracking-wider">
                  {language === 'lv' ? 'Attēlu galerija' : 'Image Gallery'}
                </h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {page.images.map((imgObj, idx) => {
                  if (!imgObj.image) return null;
                  return (
                    <div 
                      key={idx} 
                      className="group overflow-hidden border border-zinc-200 bg-zinc-50 p-2 shadow-xs transition-all duration-300 hover:shadow-md"
                    >
                      <div className="overflow-hidden aspect-video relative bg-zinc-900">
                        <img 
                          src={imgObj.image} 
                          alt={imgObj.caption || page.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      {imgObj.caption && (
                        <p className="mt-2.5 text-xs text-zinc-500 italic text-center font-medium px-2">
                          {imgObj.caption}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Back to Home Button at bottom */}
        <div className="pt-8 border-t border-zinc-200 flex justify-center">
          <button
            onClick={() => navigate('/')}
            className="bg-zinc-950 text-white hover:bg-yellow-500 hover:text-zinc-950 px-8 py-3.5 font-black text-xs uppercase tracking-widest transition-all shadow-sm cursor-pointer"
          >
            {language === 'lv' ? 'Aizvērt lapu' : 'Close Page'}
          </button>
        </div>

      </div>
    </div>
  );
};
