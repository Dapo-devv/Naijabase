import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import AdSlot from '../components/AdSlot';
import { supabase } from '../lib/supabase';

export default function BlogDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    supabase.from('blog_posts').select('*').eq('slug', slug).single().then(({ data }) => {
      setPost(data);
      setLoading(false);
    });
  }, [slug]);
  if (loading) return <div className="max-w-2xl mx-auto px-4 py-20 text-center text-gray-400"><Loader2 className="w-8 h-8 animate-spin mb-3" />Loading article…</div>;
  if (!post) return <div className="max-w-2xl mx-auto px-4 py-20 text-center"><p className="text-red-500">Post not found</p><Link to="/blog" className="text-primary font-semibold">Back to Blog</Link></div>;
  const blocks = post.content.split(/\n\n+/);
  const before = blocks.slice(0, 4).join('\n\n');
  const after = blocks.slice(4).join('\n\n');
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 animate-fade-in">
      <Link to="/blog" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary mb-4"><ArrowLeft className="w-4 h-4" /> Back to Blog</Link>
      <h1 className="text-3xl font-extrabold text-neutral-text leading-tight mb-6">{post.title}</h1>
      <article className="prose-naija"><ReactMarkdown>{before}</ReactMarkdown></article>
      <div className="my-6"><AdSlot width={300} height={250} label="In-Article Ad" /></div>
      {after && <article className="prose-naija"><ReactMarkdown>{after}</ReactMarkdown></article>}
    </div>
  );
}