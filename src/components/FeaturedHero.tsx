import { Link } from "react-router-dom";
import { Article } from "@/types";
import { Badge } from "@/components/ui/badge";
import { getTagColor } from "@/lib/mock-data";
import { Heart, MessageCircle, Eye, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface FeaturedHeroProps {
  article: Article;
}

const FeaturedHero = ({ article }: FeaturedHeroProps) => {
  return (
    <Link to={`/articles/${article.slug}`}>
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative w-full min-h-[70vh] md:min-h-[80vh] flex items-end overflow-hidden group"
      >
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-background to-background" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

        {/* Decorative Elements */}
        <div className="absolute top-20 right-10 md:right-20 w-40 h-40 md:w-72 md:h-72 border border-primary/20 rotate-12 group-hover:rotate-6 transition-transform duration-700" />
        <div className="absolute top-32 right-16 md:right-32 w-32 h-32 md:w-56 md:h-56 border border-primary/10 -rotate-6 group-hover:rotate-0 transition-transform duration-700" />

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 pb-12 md:pb-20">
          <div className="max-w-4xl">
            {/* Featured Label */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-3 mb-4"
            >
              <div className="w-8 h-[2px] bg-primary" />
              <span className="text-primary text-xs font-bold uppercase tracking-[0.2em] font-body">
                Featured
              </span>
            </motion.div>

            {/* Tags */}
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex gap-2 mb-4"
            >
              {article.tags.map((tag) => (
                <Badge key={tag} variant="tag" className={getTagColor(tag)}>
                  {tag}
                </Badge>
              ))}
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="font-display text-5xl sm:text-6xl md:text-8xl lg:text-9xl text-foreground mb-6 max-w-3xl"
            >
              {article.title}
            </motion.h1>

            {/* Excerpt */}
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-muted-foreground font-body text-sm md:text-base max-w-xl mb-8 leading-relaxed"
            >
              {article.excerpt}
            </motion.p>

            {/* Meta Row */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex items-center gap-6"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-muted" />
                <div>
                  <span className="text-sm font-semibold text-foreground font-body">
                    {article.author.name}
                  </span>
                  {article.author.verified && (
                    <span className="text-primary ml-1 text-xs">✓</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-muted-foreground font-body">
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" /> {article.views.toLocaleString()}
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5" /> {article.likes.toLocaleString()}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="w-3.5 h-3.5" /> {article.commentCount}
                </span>
              </div>

              <div className="hidden md:flex items-center gap-2 text-primary text-sm font-semibold font-body group-hover:gap-3 transition-all">
                Read Article <ArrowRight className="w-4 h-4" />
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>
    </Link>
  );
};

export default FeaturedHero;
