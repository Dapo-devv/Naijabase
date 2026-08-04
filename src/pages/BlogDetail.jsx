import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import AdSlot from "../components/AdSlot";
import { supabase } from "../lib/supabase";

export default function BlogDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .single()
      .then(({ data }) => {
        setPost(data);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-bg dark:bg-gray-900 max-w-3xl mx-auto px-4 py-20 text-center text-gray-400 dark:text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin mb-3 mx-auto" />
        Loading article…
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-neutral-bg dark:bg-gray-900 max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-red-500 dark:text-red-400">Post not found</p>
        <Link to="/blog" className="text-primary font-semibold hover:underline">
          Back to Blog
        </Link>
      </div>
    );
  }

  // --- Smart Content Splitting for Ads ---
  const blocks = post.content.split(/\n\n+/);
  const totalBlocks = blocks.length;

  const afterIntro = Math.min(2, totalBlocks);
  const middle = Math.floor(totalBlocks / 2);
  const end = Math.max(totalBlocks - 2, afterIntro + 1);

  const part1 = blocks.slice(0, afterIntro).join("\n\n");
  const part2 = blocks.slice(afterIntro, middle).join("\n\n");
  const part3 = blocks.slice(middle, end).join("\n\n");
  const part4 = blocks.slice(end).join("\n\n");

  // 🔥 BULLETPROOF COMPONENT OVERRIDES
  const markdownComponents = {
    p: ({ node, ...props }) => (
      <p
        style={{
          color: document.documentElement.classList.contains("dark")
            ? "#f3f4f6"
            : "#374151",
          marginBottom: "1rem",
          lineHeight: "1.75",
        }}
        {...props}
      />
    ),
    h2: ({ node, ...props }) => (
      <h2
        style={{
          color: document.documentElement.classList.contains("dark")
            ? "#86efac"
            : "#065A30",
          fontSize: "1.5rem",
          fontWeight: "700",
          marginTop: "2rem",
          marginBottom: "1rem",
        }}
        {...props}
      />
    ),
    h3: ({ node, ...props }) => (
      <h3
        style={{
          color: document.documentElement.classList.contains("dark")
            ? "#86efac"
            : "#08733D",
          fontSize: "1.2rem",
          fontWeight: "600",
          marginTop: "1.5rem",
          marginBottom: "0.75rem",
        }}
        {...props}
      />
    ),
    li: ({ node, ...props }) => (
      <li
        style={{
          color: document.documentElement.classList.contains("dark")
            ? "#f3f4f6"
            : "#374151",
          marginBottom: "0.5rem",
        }}
        {...props}
      />
    ),
    strong: ({ node, ...props }) => (
      <strong
        style={{
          color: document.documentElement.classList.contains("dark")
            ? "#ffffff"
            : "#1A1A1A",
          fontWeight: "600",
        }}
        {...props}
      />
    ),
    blockquote: ({ node, ...props }) => (
      <blockquote
        style={{
          borderLeft: document.documentElement.classList.contains("dark")
            ? "4px solid #86efac"
            : "4px solid #0A8C4A",
          paddingLeft: "1rem",
          fontStyle: "italic",
          color: document.documentElement.classList.contains("dark")
            ? "#e5e7eb"
            : "#6B7280",
          margin: "1rem 0",
        }}
        {...props}
      />
    ),
    a: ({ node, ...props }) => (
      <a
        style={{
          color: document.documentElement.classList.contains("dark")
            ? "#86efac"
            : "#0A8C4A",
          textDecoration: "underline",
        }}
        {...props}
      />
    ),
  };

  return (
    <div className="min-h-screen bg-neutral-bg dark:bg-gray-900 py-6 px-4 transition-colors duration-300">
      <div className="max-w-3xl mx-auto animate-fade-in">
        {/* Back Button */}
        <Link
          to="/blog"
          className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary-400 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Blog
        </Link>

        {/* Title */}
        <h1 className="text-3xl font-extrabold text-neutral-text dark:text-white leading-tight mb-6">
          {post.title}
        </h1>

        {/* === Content Part 1 === */}
        {part1 && (
          <div className="max-w-none">
            <ReactMarkdown components={markdownComponents}>
              {part1}
            </ReactMarkdown>
          </div>
        )}

        <div className="my-8">
          <AdSlot width={300} height={250} label="Ad Space" />
        </div>

        {/* === Content Part 2 === */}
        {part2 && (
          <div className="max-w-none">
            <ReactMarkdown components={markdownComponents}>
              {part2}
            </ReactMarkdown>
          </div>
        )}

        <div className="my-8">
          <AdSlot width={300} height={250} label="Ad Space" />
        </div>

        {/* === Content Part 3 === */}
        {part3 && (
          <div className="max-w-none">
            <ReactMarkdown components={markdownComponents}>
              {part3}
            </ReactMarkdown>
          </div>
        )}

        <div className="my-8">
          <AdSlot width={300} height={250} label="Ad Space" />
        </div>

        {/* === Content Part 4 (Conclusion) === */}
        {part4 && (
          <div className="max-w-none">
            <ReactMarkdown components={markdownComponents}>
              {part4}
            </ReactMarkdown>
          </div>
        )}

        <div className="mt-12">
          <AdSlot width={728} height={90} label="Ad Space" />
        </div>
      </div>
    </div>
  );
}
