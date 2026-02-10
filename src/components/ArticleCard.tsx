import { Link } from "react-router-dom";
import { Article } from "@/types";
import { Badge } from "@/components/ui/badge";
import { getTagColor } from "@/lib/mock-data";
import { Heart, MessageCircle, Eye } from "lucide-react";
import { motion } from "framer-motion";

interface ArticleCardProps {
  article: Article;
  variant?: "default" | "compact";
}

const ArticleCard = ({ article, variant = "default" }: ArticleCardProps) => {
  const isCompact = variant === "compact";

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="group"
    >
      <Link to={`/articles/${article.slug}`} className="block">
        {/* Image */}
        <div
          className={`relative overflow-hidden bg-secondary mb-3 ${
            isCompact ? "aspect-[16/9]" : "aspect-[4/3]"
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-muted/40 group-hover:scale-105 transition-transform duration-500" />

          {/* Tags */}
          <div className="absolute top-3 left-3 z-20 flex gap-1.5">
            {article.tags.map((tag) => (
              <Badge key={tag} variant="tag" className={getTagColor(tag)}>
                {tag}
              </Badge>
            ))}
          </div>

          {/* Title on image */}
          <div className="absolute bottom-3 left-3 right-3 z-20">
            <h3
              className={`font-display text-foreground leading-none ${
                isCompact ? "text-lg" : "text-2xl"
              }`}
            >
              {article.title}
            </h3>
          </div>
        </div>

        {/* Meta */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-muted" />
            <span className="text-xs text-muted-foreground font-body font-medium">
              {article.author.name}
            </span>
            {article.author.verified && (
              <span className="text-primary text-xs">✓</span>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground font-body">
            <span className="flex items-center gap-1">
              <Heart className="w-3 h-3" /> {article.likes.toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="w-3 h-3" /> {article.commentCount}
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
};

export default ArticleCard;
