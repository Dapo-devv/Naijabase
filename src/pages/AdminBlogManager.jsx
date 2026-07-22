import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNaijaBase } from '../context/NaijaBaseContext';
import { Pencil, Trash2, Plus, X } from 'lucide-react';

export default function AdminBlogManager() {
  const { currentUser } = useNaijaBase();
  const [posts, setPosts] = useState([]);
  const [editingPost, setEditingPost] = useState(null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [tag, setTag] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const { data } = await supabase.from('blog_posts').select('*').order('published_at', { ascending: false });
    if (data) setPosts(data);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const postData = { title, slug, excerpt, content, tag };
    if (editingPost) {
      await supabase.from('blog_posts').update(postData).eq('id', editingPost.id);
    } else {
      await supabase.from('blog_posts').insert(postData);
    }
    fetchPosts();
    resetForm();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this blog post?')) return;
    await supabase.from('blog_posts').delete().eq('id', id);
    fetchPosts();
  };

  const resetForm = () => {
    setEditingPost(null);
    setTitle(''); setSlug(''); setExcerpt(''); setContent(''); setTag('');
  };

  if (!currentUser || currentUser.email !== 'dapodevv@gmail.com') {
    return <div className="p-10 text-center text-red-500">Access Denied.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-extrabold text-neutral-text">Manage Blog Posts</h1>
      
      <form onSubmit={handleSave} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required className="w-full px-4 py-3 border rounded-xl" />
        <input type="text" placeholder="Slug (e.g. generator-savings)" value={slug} onChange={e => setSlug(e.target.value)} required className="w-full px-4 py-3 border rounded-xl" />
        <input type="text" placeholder="Excerpt (Short description)" value={excerpt} onChange={e => setExcerpt(e.target.value)} className="w-full px-4 py-3 border rounded-xl" />
        <input type="text" placeholder="Tag (e.g. Market, Savings)" value={tag} onChange={e => setTag(e.target.value)} className="w-full px-4 py-3 border rounded-xl" />
        <textarea rows="15" placeholder="Write your blog post here... (Supports Markdown)" value={content} onChange={e => setContent(e.target.value)} required className="w-full px-4 py-3 border rounded-xl" />
        <button type="submit" className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-600">{editingPost ? 'Update Post' : 'Publish Post'}</button>
        {editingPost && <button type="button" onClick={resetForm} className="ml-2 text-gray-500 hover:underline">Cancel Edit</button>}
      </form>

      <div className="space-y-3">
        {posts.map(post => (
          <div key={post.id} className="bg-white p-4 border border-gray-100 rounded-xl flex justify-between items-center shadow-sm">
            <div>
              <h3 className="font-bold">{post.title}</h3>
              <p className="text-xs text-gray-500">{post.slug} · {post.tag}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setEditingPost(post); setTitle(post.title); setSlug(post.slug); setExcerpt(post.excerpt); setContent(post.content); setTag(post.tag); }} className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg"><Pencil className="w-4 h-4" /></button>
              <button onClick={() => handleDelete(post.id)} className="text-red-600 hover:bg-red-50 p-2 rounded-lg"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}