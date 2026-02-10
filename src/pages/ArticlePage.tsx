import { useParams, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import ArticleCard from "@/components/ArticleCard";
import CommentSection from "@/components/CommentSection";
import PollComponent from "@/components/PollComponent";
import { Badge } from "@/components/ui/badge";
import VerifiedBadge from "@/components/VerifiedBadge";
import { mockArticles, getTagColor } from "@/lib/mock-data";
import {
  Heart,
  Eye,
  Share2,
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
  Copy,
  CheckCircle2,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

const ArticlePage = () => {
  const { slug } = useParams();
  const [liked, setLiked] = useState(false);
  const [copied, setCopied] = useState(false);

  const article = mockArticles.find((a) => a.slug === slug);

  if (!article) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="font-display text-5xl text-foreground mb-4">Article Not Found</h1>
          <Link to="/" className="text-primary font-body text-sm hover:underline">
            ← Back to Home
          </Link>
        </div>
      </Layout>
    );
  }

  const relatedArticles = mockArticles
    .filter((a) => a.id !== article.id && a.tags.some((t) => article.tags.includes(t)))
    .slice(0, 3);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isOpinion = article.tags.includes("OPINION");

  return (
    <Layout>
      {/* Hero */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative w-full min-h-[50vh] md:min-h-[60vh] flex items-end overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />

        <div className="relative z-10 container mx-auto px-4 pb-10 md:pb-16">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm font-body mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>

          <div className="flex gap-2 mb-4">
            {article.tags.map((tag) => (
              <Badge key={tag} variant="tag" className={getTagColor(tag)}>
                {tag}
              </Badge>
            ))}
          </div>

          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="font-display text-4xl sm:text-5xl md:text-7xl lg:text-8xl text-foreground max-w-4xl mb-6"
          >
            {article.title}
          </motion.h1>

          <div className="flex flex-wrap items-center gap-4 md:gap-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-muted" />
              <div>
                <span className="text-sm font-semibold text-foreground font-body inline-flex items-center gap-1">
                  {article.author.name}
                  {article.author.verified && <VerifiedBadge />}
                </span>
                <p className="text-xs text-muted-foreground font-body">
                  @{article.author.username}
                </p>
              </div>
            </div>
            <span className="text-xs text-muted-foreground font-body">
              {new Date(article.publishDate).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
            <div className="flex items-center gap-3 text-xs text-muted-foreground font-body">
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" /> {article.views.toLocaleString()}
              </span>
              <span className="flex items-center gap-1">
                <Heart className="w-3.5 h-3.5" /> {article.likes.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Article Body */}
      <section className="container mx-auto px-4 py-10">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {article.content.split("\n\n").map((paragraph, i) => (
              <p
                key={i}
                className="text-foreground/90 font-body text-base md:text-lg leading-relaxed mb-6"
              >
                {paragraph}
              </p>
            ))}
          </motion.div>

          {/* Poll for Opinion Articles */}
          {isOpinion && article.poll?.enabled && (
            <PollComponent articleId={article.id} poll={article.poll} />
          )}

          {/* Engagement Bar */}
          <div className="flex items-center justify-between border-y border-border py-4 my-10">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setLiked(!liked)}
                className={`flex items-center gap-2 text-sm font-body font-medium transition-colors ${
                  liked ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Heart className={`w-5 h-5 ${liked ? "fill-primary" : ""}`} />
                {(article.likes + (liked ? 1 : 0)).toLocaleString()}
              </button>
              <button className="flex items-center gap-2 text-sm font-body font-medium text-muted-foreground hover:text-foreground transition-colors">
                <ThumbsUp className="w-4 h-4" />
              </button>
              <button className="flex items-center gap-2 text-sm font-body font-medium text-muted-foreground hover:text-foreground transition-colors">
                <ThumbsDown className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-2 text-sm font-body text-muted-foreground hover:text-foreground transition-colors"
              >
                {copied ? (
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                {copied ? "Copied!" : "Copy Link"}
              </button>
              <button className="flex items-center gap-2 text-sm font-body text-muted-foreground hover:text-foreground transition-colors">
                <Share2 className="w-4 h-4" /> Share
              </button>
            </div>
          </div>

          {/* Comments */}
          <div className="mb-16">
            <CommentSection articleId={article.id} />
          </div>
        </div>
      </section>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <section className="border-t border-border">
          <div className="container mx-auto px-4 py-12">
            <h3 className="font-display text-3xl md:text-4xl text-foreground mb-8">
              Related Articles
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedArticles.map((a) => (
                <ArticleCard key={a.id} article={a} variant="compact" />
              ))}
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
};

export default ArticlePage;
