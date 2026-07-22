import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function BlogIndex() {
  const [posts, setPosts] = useState([]);
  useEffect(() => {
    supabase.from('blog_posts').select('*').order('published_at', { ascending: false }).then(({ data }) => {
      if (data) setPosts(data);
    });
  }, []);
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-neutral-text flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-primary" /> NaijaBase Blog
        </h1>
        <p className="text-sm text-gray-500">Guides for market prices, generators, trips, and savings.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {posts.map(p => (
          <article key={p.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow flex flex-col">
            <span className="inline-block text-xs font-semibold text-primary bg-primary-50 px-2.5 py-1 rounded-full w-fit mb-3">{p.tag}</span>
            <h2 className="text-lg font-bold text-neutral-text leading-snug mb-2">{p.title}</h2>
            <p className="text-sm text-gray-500 mb-4 flex-1">{p.excerpt}</p>
            <Link to={`/blog/${p.slug}`} className="flex items-center gap-1 text-sm font-semibold text-primary hover:gap-2 transition-all w-fit">
              Read More <ArrowRight className="w-4 h-4" />
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}