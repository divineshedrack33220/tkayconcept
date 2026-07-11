"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Clock, ArrowLeft, User } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import api from "@/lib/api";

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage: string;
  author: { firstName: string; lastName: string; avatar: string };
  category: string;
  tags: string[];
  readTime: number;
  views: number;
  publishedAt: string;
}

export default function BlogPostPage() {
  const params = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await api.get(`/blog/${params.slug}`);
        setPost(res.data.data);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [params.slug]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="section-padding container-custom text-center">
        <h1 className="heading-secondary mb-4">Article Not Found</h1>
        <Link href="/blog" className="text-accent hover:underline">
          Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <div className="section-padding container-custom">
      {/* Breadcrumbs */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500">
        <Link href="/" className="hover:text-accent">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/blog" className="hover:text-accent">Blog</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-gray-900 line-clamp-1">{post.title}</span>
      </nav>

      <article className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <p className="mb-3 text-sm font-medium text-accent capitalize">
            {post.category}
          </p>
          <h1 className="mb-4 text-3xl font-bold text-primary md:text-4xl">
            {post.title}
          </h1>

          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">
                {post.author?.firstName?.charAt(0) || <User className="h-4 w-4" />}
              </div>
              <span>
                {post.author?.firstName} {post.author?.lastName}
              </span>
            </div>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {post.readTime} min read
            </span>
            <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Featured Image */}
        {post.featuredImage && (
          <div className="mb-8 overflow-hidden rounded-xl">
            <img
              src={post.featuredImage}
              alt={post.title}
              className="w-full object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div
          className="prose prose-lg max-w-none prose-headings:text-primary prose-a:text-accent prose-strong:text-primary"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Back */}
        <div className="mt-10 border-t pt-6">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:text-accent-dark"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Link>
        </div>
      </article>
    </div>
  );
}
