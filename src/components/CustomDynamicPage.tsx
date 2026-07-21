import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Image as ImageIcon, Sparkles, MessageSquare, Share2, HelpCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useLanguage } from '../LanguageContext';
import { customPages } from '../data/pages';
import { articles as allArticles } from '../data/articles';

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
            {language === 'lv' ? 'Atpakaļ uz sākums' : 'Back to Home'}
          </button>
        </div>
      </div>
    );
  }

  // --- RENDERING HANDLERS FOR THE NEW MODULAR BLOCKS ---

  const renderTextBlock = (block: any, key: number) => {
    return (
      <div key={key} className="space-y-4">
        {block.title && (
          <h2 className="text-xl md:text-2xl font-black italic uppercase tracking-tight text-zinc-950">
            {block.title}
          </h2>
        )}
        <div className="prose max-w-none text-zinc-800 leading-relaxed text-sm md:text-base space-y-4">
          <ReactMarkdown>{block.content}</ReactMarkdown>
        </div>
      </div>
    );
  };

  const renderGalleryBlock = (block: any, key: number) => {
    return (
      <div key={key} className="space-y-6 pt-4">
        {block.title && (
          <h3 className="font-black italic text-sm md:text-base uppercase tracking-wider text-zinc-950 flex items-center gap-2">
            <ImageIcon className="text-yellow-600 animate-pulse" size={18} />
            <span>{block.title}</span>
          </h3>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {block.images && block.images.map((imgObj: any, idx: number) => {
            if (!imgObj.image) return null;
            return (
              <div 
                key={idx} 
                className="group overflow-hidden border border-zinc-200 bg-zinc-50 p-2 shadow-xs transition-all duration-300 hover:shadow-md"
              >
                <div className="overflow-hidden aspect-video relative bg-zinc-900">
                  <img 
                     src={imgObj.image} 
                     alt={imgObj.caption || 'Galerija'} 
                     referrerPolicy="no-referrer"
                     className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                {imgObj.caption && (
                  <p className="mt-2 text-xs text-zinc-500 italic text-center font-medium px-2">
                    {imgObj.caption}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderTestimonialsBlock = (block: any, key: number) => {
    return (
      <div key={key} className="space-y-6 pt-4">
        {block.title && (
          <h3 className="font-black italic text-sm md:text-base uppercase tracking-wider text-zinc-950 flex items-center gap-2">
            <MessageSquare className="text-yellow-600" size={18} />
            <span>{block.title}</span>
          </h3>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {block.testimonials && block.testimonials.map((testi: any, idx: number) => (
            <div key={idx} className="bg-zinc-50 border border-zinc-200 p-6 flex flex-col justify-between relative shadow-xs">
              <span className="absolute top-2 right-4 text-zinc-200/60 text-6xl font-serif select-none pointer-events-none">“</span>
              <div className="space-y-3 relative z-10">
                <div className="flex text-yellow-500 space-x-1">
                  {Array.from({ length: testi.rating || 5 }).map((_, i) => (
                    <span key={i} className="text-sm">★</span>
                  ))}
                </div>
                <p className="text-zinc-700 text-sm md:text-base italic leading-relaxed">
                  "{testi.text}"
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-zinc-150">
                <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-900">{testi.author}</h4>
                {testi.company && <p className="text-zinc-500 text-[10px] uppercase tracking-widest mt-0.5">{testi.company}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSocialBlock = (block: any, key: number) => {
    return (
      <div key={key} className="space-y-6 pt-4">
        {block.title && (
          <h3 className="font-black italic text-sm md:text-base uppercase tracking-wider text-zinc-950 flex items-center gap-2">
            <Share2 className="text-yellow-600" size={18} />
            <span>{block.title}</span>
          </h3>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {block.posts && block.posts.map((post: any, idx: number) => (
            <div key={idx} className="bg-zinc-50 border border-zinc-200 p-6 flex flex-col justify-between hover:border-zinc-400 transition-colors">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 bg-zinc-950 text-white leading-none">
                    {post.platform}
                  </span>
                  {post.url && (
                    <a 
                      href={post.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-yellow-600 hover:text-yellow-700 text-xs font-bold underline inline-flex items-center gap-1"
                    >
                      Skatīt ierakstu ↗
                    </a>
                  )}
                </div>
                {post.embed_code ? (
                  <div className="text-zinc-700 text-xs whitespace-pre-wrap font-mono p-3 bg-zinc-100 border border-zinc-200 select-all overflow-x-auto max-h-36">
                    {post.embed_code}
                  </div>
                ) : (
                  <p className="text-zinc-600 text-xs italic break-all">
                    URL: {post.url}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderBlogPostsBlock = (block: any, key: number) => {
    const count = block.count || 3;
    const articles = (allArticles || []).slice(0, count);

    return (
      <div key={key} className="space-y-6 pt-4">
        {block.title && (
          <h3 className="font-black italic text-sm md:text-base uppercase tracking-wider text-zinc-950 flex items-center gap-2">
            <Sparkles className="text-yellow-600" size={18} />
            <span>{block.title}</span>
          </h3>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article: any, idx: number) => (
            <div 
              key={idx} 
              onClick={() => navigate(`/noderigi/${article.slug}`)}
              className="group bg-zinc-50 border border-zinc-200 p-4 hover:border-yellow-500 transition-colors cursor-pointer flex flex-col justify-between h-full shadow-xs"
            >
              <div>
                {article.image && (
                  <div className="overflow-hidden aspect-video bg-zinc-100 mb-4 border border-zinc-200 relative">
                    <img 
                      src={article.image} 
                      alt={article.title} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                    />
                  </div>
                )}
                <h4 className="font-black text-sm uppercase tracking-tight text-zinc-950 line-clamp-2 group-hover:text-yellow-600 transition-colors">
                  {article.title}
                </h4>
                {article.excerpt && (
                  <p className="text-zinc-500 text-xs line-clamp-3 mt-2 leading-relaxed">
                    {article.excerpt}
                  </p>
                )}
              </div>
              <span className="text-[10px] font-bold text-yellow-600 uppercase tracking-widest mt-4 inline-block">
                Lasīt rakstu →
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderContactFormBlock = (block: any, key: number) => {
    return (
      <div key={key} className="pt-6">
        <div className="border border-zinc-200 p-6 md:p-8 bg-zinc-50">
          {block.title && (
            <h3 className="font-black italic text-sm md:text-base uppercase tracking-wider text-zinc-950 mb-2">
              {block.title}
            </h3>
          )}
          {block.description && (
            <p className="text-zinc-500 text-xs md:text-sm mb-6 leading-relaxed">
              {block.description}
            </p>
          )}
          <button
            onClick={() => navigate('/kontakti')}
            className="bg-zinc-950 text-white hover:bg-yellow-500 hover:text-zinc-950 px-8 py-3.5 font-black text-xs uppercase tracking-widest transition-all w-full md:w-auto cursor-pointer"
          >
            Sazināties ar mums
          </button>
        </div>
      </div>
    );
  };

  const renderBlock = (block: any, key: number) => {
    switch (block.type) {
      case 'text_block':
        return renderTextBlock(block, key);
      case 'gallery_block':
        return renderGalleryBlock(block, key);
      case 'testimonials_block':
        return renderTestimonialsBlock(block, key);
      case 'social_block':
        return renderSocialBlock(block, key);
      case 'blog_posts_block':
        return renderBlogPostsBlock(block, key);
      case 'contact_form_block':
        return renderContactFormBlock(block, key);
      default:
        return null;
    }
  };

  // --- END BLOCK RENDERERS ---

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

        {/* Page Content Card / Page Builder */}
        <div className="space-y-12 bg-white p-6 md:p-10 border border-zinc-200 shadow-sm mb-12">
          
          {page.blocks && page.blocks.length > 0 ? (
            // Render modular sections in the saved order
            <div className="space-y-12">
              {page.blocks.map((block, idx) => renderBlock(block, idx))}
            </div>
          ) : (
            // Fallback for simple markdown content pages
            <div className="space-y-8">
              {page.content && (
                <div className="prose max-w-none text-zinc-800 leading-relaxed text-sm md:text-base space-y-4">
                  <ReactMarkdown>{page.content}</ReactMarkdown>
                </div>
              )}

              {/* Legacy Image Gallery Block */}
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

