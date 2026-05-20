import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/authStore";
import { toast } from "react-hot-toast";

import {
  articleCardClass,
  articleTitle,
  articleExcerpt,
  articleMeta,
  primaryBtn,
  secondaryBtn,
  loadingClass,
  errorClass,
  emptyStateClass,
  tagClass,
} from "../styles/common";

function AuthorArticles() {
  const navigate = useNavigate();
  const user = useAuth((state) => state.currentUser);

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;

    const getAuthorArticles = async () => {
      setLoading(true);

      try {
       const res = await axios.get("http://localhost:4000/author-api/articles", { withCredentials: true });

        setArticles(res.data?.payload || []);
      } catch (err) {
        console.log(err);
        setError(err.response?.data?.error || "Failed to fetch articles");
      } finally {
        setLoading(false);
      }
    };

    getAuthorArticles();
  }, [user]);

  const togglePremiumStatus = async (article) => {
    try {
      const updatedData = {
        ...article,
        isPremium: !article.isPremium
      };
      
      await axios.put(`http://localhost:4000/author-api/articles/${article._id}`, updatedData, { withCredentials: true });
      
      // Update local state
      setArticles(articles.map(art => 
        art._id === article._id ? { ...art, isPremium: !article.isPremium } : art
      ));
      
      toast.success(!article.isPremium ? "Article is now Premium!" : "Article is now Free!");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Premium status update failed");
    }
  };

  const toggleArticleStatus = async (articleId, currentStatus) => {
    // If we are about to delete (set to inactive), ask for confirmation
    if (currentStatus) {
      if (!window.confirm("Are you sure you want to delete this article? It will be hidden from readers.")) {
        return;
      }
    }

    try {
      await axios.patch(`http://localhost:4000/author-api/articles/${articleId}/status`, {
        isArticleActive: !currentStatus
      }, { withCredentials: true });
      
      // Update local state
      setArticles(articles.map(art => 
        art._id === articleId ? { ...art, isArticleActive: !currentStatus } : art
      ));
      
      toast.success(!currentStatus ? "Article restored!" : "Article deleted!");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Status update failed");
    }
  };

  const openArticle = (article) => {
    navigate(`/article/${article._id}`, {
      state: article,
    });
  };

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "medium",
    });
  };

  if (loading) return <p className={loadingClass}>Loading articles...</p>;
  if (error) return <p className={errorClass}>{error}</p>;

  if (articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center bg-white dark:bg-slate-800/20 rounded-[3rem] border border-slate-100 dark:border-white/5 transition-all duration-300">
        <div className="text-5xl mb-6">✍️</div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No articles yet</h3>
        <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
          Start your journey by writing your first masterpiece today!
        </p>
      </div>
    );
  }

  return (
    <div className="pb-20 transition-all duration-300">
      <div className="mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-2 transition-colors duration-300">Dashboard</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium transition-colors duration-300 leading-relaxed max-w-lg">Manage your published articles and monitor the reach of your stories.</p>
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {articles.map((article) => (
          <div 
            key={article._id} 
            className={`group article-card-premium flex flex-col bg-white dark:bg-slate-800/40 backdrop-blur-xl rounded-[2.5rem] border transition-all duration-500 overflow-hidden relative cursor-pointer ${!article.isArticleActive ? 'opacity-70 grayscale-[0.3]' : ''} ${article.isPremium ? 'border-amber-500/40 shadow-[0_10px_40px_-10px_rgba(245,158,11,0.1)] hover:shadow-[0_20px_60px_-10px_rgba(245,158,11,0.4)] hover:-translate-y-2' : 'border-slate-100 dark:border-white/5 shadow-xl hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2'}`}
            onClick={() => openArticle(article)}
          >
            {article.isPremium && (
              <div className="absolute top-6 right-8">
                <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white p-2 rounded-xl shadow-lg shadow-orange-900/20 border border-white/20 crown-glow">
                  <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5M19 19C19 19.6 18.6 20 18 20H6C5.4 20 5 19.6 5 19V18H19V19Z" />
                  </svg>
                </div>
              </div>
            )}
            
            <div className="p-8 flex flex-col h-full">
              <div className="flex justify-between items-start mb-6">
                <span className={`${tagClass} px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg border border-blue-500/20`}>
                  {article.category}
                </span>
                {!article.isPremium && (
                  <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest ${article.isArticleActive ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'}`}>
                    {article.isArticleActive ? 'Active' : 'Inactive'}
                  </span>
                )}
              </div>

              <h3 className={`${articleTitle} text-xl group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-4 line-clamp-2 font-semibold`}>
                {article.title}
              </h3>
              
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3 mb-6 flex-grow transition-colors duration-300">
                {article.content}
              </p>

              <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-white/5 mt-auto">
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  {formatDate(article.createdAt)}
                </span>
                
                <div className="flex gap-2">
                  <button 
                    className={`p-2.5 rounded-2xl border transition-all duration-300 active:scale-90 ${article.isPremium ? 'border-amber-500/20 text-amber-500 bg-amber-500/10 hover:bg-amber-500 hover:text-white' : 'border-slate-200 dark:border-white/10 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10'}`}
                    onClick={(e) => { e.stopPropagation(); togglePremiumStatus(article); }}
                    title={article.isPremium ? 'Make it FREE' : 'Make it PREMIUM'}
                  >
                    {article.isPremium ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    )}
                  </button>

                  <button 
                    className={`p-2.5 rounded-2xl border transition-all duration-300 active:scale-90 ${article.isArticleActive ? 'border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white' : 'border-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-white'}`}
                    onClick={(e) => { e.stopPropagation(); toggleArticleStatus(article._id, article.isArticleActive); }}
                    title={article.isArticleActive ? 'Delete Article' : 'Restore Article'}
                  >
                    {article.isArticleActive ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    )}
                  </button>
                  
                  <button 
                    className="p-2.5 rounded-2xl border border-blue-500/20 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white transition-all duration-300 active:scale-90"
                    onClick={(e) => { e.stopPropagation(); openArticle(article); }}
                    title="View Article"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AuthorArticles;