import { useState, useMemo, useEffect } from "react";
import { useParams } from "react-router-dom";
import Layout from "@/components/Layout";
import FeaturedHero from "@/components/FeaturedHero";
import ArticleCard from "@/components/ArticleCard";
import TagFilter from "@/components/TagFilter";
import { mockArticles } from "@/lib/mock-data";
import { TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const Index = () => {
  const { tag } = useParams();
  const [activeTag, setActiveTag] = useState(tag?.toUpperCase() || "ALL");

  useEffect(() => {
    if (tag) setActiveTag(tag.toUpperCase());
    else setActiveTag("ALL");
  }, [tag]);

  const featuredArticle = mockArticles.find((a) => a.featured);
  const regularArticles = mockArticles.filter((a) => !a.featured);

  const filteredArticles = useMemo(() => {
    if (activeTag === "ALL") return regularArticles;
    return regularArticles.filter((a) => a.tags.includes(activeTag));
  }, [activeTag, regularArticles]);

  const trendingArticles = [...mockArticles]
    .sort((a, b) => b.views - a.views)
    .slice(0, 4);

  return (
    <Layout>
      {/* Featured Hero */}
      {featuredArticle && <FeaturedHero article={featuredArticle} />}

      {/* Trending Bar */}
      <section className="border-y border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 py-3 overflow-x-auto">
            <div className="flex items-center gap-2 text-primary shrink-0">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider font-body">
                Trending
              </span>
            </div>
            <div className="w-px h-4 bg-border shrink-0" />
            {trendingArticles.map((article, i) => (
              <a
                key={article.id}
                href={`/articles/${article.slug}`}
                className="text-xs text-muted-foreground hover:text-foreground font-body font-medium whitespace-nowrap transition-colors flex items-center gap-2"
              >
                <span className="text-primary font-display text-sm">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="truncate max-w-[200px]">{article.title}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-10">
        <div className="flex items-end justify-between mb-8">
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display text-4xl md:text-5xl text-foreground"
            >
              Latest
            </motion.h2>
          </div>
        </div>

        {/* Tag Filter */}
        <div className="mb-8">
          <TagFilter activeTag={activeTag} onTagChange={setActiveTag} />
        </div>

        {/* Article Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>

        {filteredArticles.length === 0 && (
          <div className="text-center py-20 text-muted-foreground font-body">
            No articles found for this tag.
          </div>
        )}
      </section>
    </Layout>
  );
};

export default Index;
