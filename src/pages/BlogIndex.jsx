import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, ArrowRight } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function BlogIndex() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    supabase
      .from("blog_posts")
      .select("*")
      .order("published_at", { ascending: false })
      .then(({ data }) => {
        if (data) setPosts(data);
      });
  }, []);

  return (
    <div className="min-h-screen bg-neutral-bg dark:bg-gray-900 py-6 px-4 transition-colors duration-300">
      <div className="max-w-4xl mx-auto animate-fade-in">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-neutral-text dark:text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" /> NaijaBase Blog
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Guides for market prices, generators, trips, and savings.
          </p>
        </div>

        {/* Blog Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {posts.map((p) => (
            <article
              key={p.id}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-black/30 transition-all duration-300 flex flex-col"
            >
              {/* Tag Pills */}
              <span className="inline-block text-xs font-semibold text-primary bg-primary-50 dark:bg-primary-900/30 dark:text-primary-400 px-2.5 py-1 rounded-full w-fit mb-3">
                {p.tag}
              </span>

              <h2 className="text-lg font-bold text-neutral-text dark:text-white leading-snug mb-2">
                {p.title}
              </h2>

              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 flex-1">
                {p.excerpt}
              </p>

              <Link
                to={`/blog/${p.slug}`}
                className="flex items-center gap-1 text-sm font-semibold text-primary hover:gap-2 transition-all w-fit"
              >
                Read More <ArrowRight className="w-4 h-4" />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
