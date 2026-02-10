import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getTagColor, allTags, mockArticles } from "@/lib/mock-data";
import {
  createArticle,
  updateArticle,
  deleteArticle,
  getUserByEmail,
  getUserByUsername,
  setUserVerified,
  setUserAdmin,
  setFollowerCount,
} from "@/lib/firestore";
import { Article, UserProfile } from "@/types";
import {
  Plus,
  Trash2,
  Star,
  Edit,
  Search,
  Shield,
  CheckCircle2,
  Users,
  Eye,
  Heart,
  MessageCircle,
  X,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";

const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [articles, setArticles] = useState<Article[]>(mockArticles);
  const [editing, setEditing] = useState<Article | null>(null);
  const [creating, setCreating] = useState(false);

  // Article form state
  const [formTitle, setFormTitle] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formExcerpt, setFormExcerpt] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formImage, setFormImage] = useState("");
  const [formTags, setFormTags] = useState<string[]>([]);
  const [formFeatured, setFormFeatured] = useState(false);
  const [formSchedule, setFormSchedule] = useState("");

  // Poll form state
  const [pollEnabled, setPollEnabled] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [pollExpiration, setPollExpiration] = useState("");
  const [pollLocked, setPollLocked] = useState(false);

  // User management
  const [userSearch, setUserSearch] = useState("");
  const [foundUser, setFoundUser] = useState<UserProfile | null>(null);
  const [searchError, setSearchError] = useState("");
  const [followerInput, setFollowerInput] = useState("");

  if (!isAdmin) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="font-display text-5xl text-foreground mb-4">Access Denied</h1>
          <p className="text-muted-foreground font-body">You don't have permission to view this page.</p>
        </div>
      </Layout>
    );
  }

  const generateSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const resetForm = () => {
    setFormTitle("");
    setFormSlug("");
    setFormExcerpt("");
    setFormContent("");
    setFormImage("");
    setFormTags([]);
    setFormFeatured(false);
    setFormSchedule("");
    setPollEnabled(false);
    setPollQuestion("");
    setPollOptions(["", ""]);
    setPollExpiration("");
    setPollLocked(false);
    setEditing(null);
    setCreating(false);
  };

  const loadForEdit = (article: Article) => {
    setEditing(article);
    setCreating(true);
    setFormTitle(article.title);
    setFormSlug(article.slug);
    setFormExcerpt(article.excerpt);
    setFormContent(article.content);
    setFormImage(article.headerImage);
    setFormTags(article.tags);
    setFormFeatured(article.featured);
    setFormSchedule(article.scheduledDate || "");
    if (article.poll) {
      setPollEnabled(article.poll.enabled);
      setPollQuestion(article.poll.question);
      setPollOptions(article.poll.options);
      setPollExpiration(article.poll.expiration || "");
      setPollLocked(article.poll.locked);
    }
  };

  const handleSaveArticle = async () => {
    if (!formTitle || !formContent || !user) return;

    const slug = formSlug || generateSlug(formTitle);
    const articleData: Omit<Article, "id"> = {
      slug,
      title: formTitle,
      excerpt: formExcerpt,
      content: formContent,
      headerImage: formImage,
      authorId: user.uid,
      author: {
        id: user.uid,
        name: user.displayName || "Admin",
        username: "admin",
        avatar: user.photoURL || "",
        verified: true,
        followers: 0,
      },
      publishDate: formSchedule || new Date().toISOString(),
      scheduledDate: formSchedule || undefined,
      tags: formTags,
      featured: formFeatured,
      likes: 0,
      commentCount: 0,
      views: 0,
      poll:
        formTags.includes("OPINION") && pollEnabled
          ? {
              enabled: true,
              question: pollQuestion,
              options: pollOptions.filter((o) => o.trim()),
              expiration: pollExpiration || null,
              locked: pollLocked,
              votes: {},
              totalVotes: 0,
            }
          : undefined,
    };

    if (editing) {
      await updateArticle(editing.id, articleData);
      setArticles((prev) =>
        prev.map((a) => (a.id === editing.id ? { ...articleData, id: editing.id } : a))
      );
    } else {
      const id = await createArticle(articleData);
      if (id) {
        setArticles((prev) => [{ ...articleData, id }, ...prev]);
      } else {
        // Fallback for when Firestore isn't available
        setArticles((prev) => [{ ...articleData, id: Date.now().toString() }, ...prev]);
      }
    }
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this article?")) return;
    await deleteArticle(id);
    setArticles((prev) => prev.filter((a) => a.id !== id));
  };

  const toggleTag = (tag: string) => {
    setFormTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSearchUser = async () => {
    setSearchError("");
    setFoundUser(null);
    if (!userSearch.trim()) return;

    const query = userSearch.trim();
    let found = query.includes("@") && query.includes(".")
      ? await getUserByEmail(query)
      : await getUserByUsername(query.replace("@", "").toLowerCase());

    if (found) {
      setFoundUser(found);
      setFollowerInput(String(found.followers));
    } else {
      setSearchError("User not found");
    }
  };

  const handleVerify = async (verified: boolean) => {
    if (!foundUser) return;
    await setUserVerified(foundUser.uid, verified);
    setFoundUser({ ...foundUser, verified });
  };

  const handlePromoteAdmin = async () => {
    if (!foundUser || !confirm(`Make @${foundUser.username} an admin?`)) return;
    await setUserAdmin(foundUser.uid, true);
    setFoundUser({ ...foundUser, isAdmin: true });
  };

  const handleSetFollowers = async () => {
    if (!foundUser) return;
    const count = parseInt(followerInput);
    if (isNaN(count) || count < 0) return;
    await setFollowerCount(foundUser.uid, count);
    setFoundUser({ ...foundUser, followers: count });
  };

  const addPollOption = () => {
    if (pollOptions.length < 5) setPollOptions([...pollOptions, ""]);
  };

  const removePollOption = (i: number) => {
    if (pollOptions.length > 2) setPollOptions(pollOptions.filter((_, idx) => idx !== i));
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-4xl md:text-5xl text-foreground">Admin Panel</h1>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground font-body">{user?.email}</span>
          </div>
        </div>

        <Tabs defaultValue="articles">
          <TabsList className="bg-secondary mb-8">
            <TabsTrigger value="articles" className="font-body font-semibold">Articles</TabsTrigger>
            <TabsTrigger value="users" className="font-body font-semibold">Users</TabsTrigger>
            <TabsTrigger value="analytics" className="font-body font-semibold">Analytics</TabsTrigger>
          </TabsList>

          {/* ─── Articles Tab ─── */}
          <TabsContent value="articles">
            {!creating ? (
              <>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-sm text-muted-foreground font-body">
                    {articles.length} articles
                  </span>
                  <Button variant="accent" onClick={() => setCreating(true)}>
                    <Plus className="w-4 h-4 mr-2" /> New Article
                  </Button>
                </div>

                <div className="space-y-2">
                  {articles.map((article) => (
                    <div
                      key={article.id}
                      className="flex items-center justify-between bg-card p-4 border border-border hover:border-primary/30 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {article.featured && <Star className="w-3.5 h-3.5 text-tag-drops fill-tag-drops" />}
                          <h4 className="text-sm font-semibold text-foreground font-body truncate">
                            {article.title}
                          </h4>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground font-body">
                          <span>{new Date(article.publishDate).toLocaleDateString("en-GB")}</span>
                          <div className="flex gap-1">
                            {article.tags.map((t) => (
                              <span key={t} className={`${getTagColor(t)} px-1.5 py-0.5 text-[10px] font-bold text-foreground`}>
                                {t}
                              </span>
                            ))}
                          </div>
                          <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{article.views}</span>
                          <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{article.likes}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 ml-4">
                        <button onClick={() => loadForEdit(article)} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(article.id)} className="p-2 text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              /* ─── Article Editor ─── */
              <div className="max-w-3xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-display text-2xl text-foreground">
                    {editing ? "Edit Article" : "New Article"}
                  </h3>
                  <button onClick={resetForm} className="text-muted-foreground hover:text-foreground">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-body mb-1 block">Title</label>
                    <input
                      value={formTitle}
                      onChange={(e) => {
                        setFormTitle(e.target.value);
                        if (!editing) setFormSlug(generateSlug(e.target.value));
                      }}
                      className="w-full bg-secondary text-foreground px-4 py-3 font-display text-2xl focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
                      placeholder="Article title..."
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-body mb-1 block">Slug</label>
                    <input
                      value={formSlug}
                      onChange={(e) => setFormSlug(e.target.value)}
                      className="w-full bg-secondary text-foreground px-4 py-2 text-sm font-body focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
                      placeholder="article-slug"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-body mb-1 block">Excerpt</label>
                    <textarea
                      value={formExcerpt}
                      onChange={(e) => setFormExcerpt(e.target.value)}
                      rows={2}
                      className="w-full bg-secondary text-foreground px-4 py-3 text-sm font-body focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground resize-none"
                      placeholder="Brief excerpt..."
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-body mb-1 block">Content</label>
                    <textarea
                      value={formContent}
                      onChange={(e) => setFormContent(e.target.value)}
                      rows={12}
                      className="w-full bg-secondary text-foreground px-4 py-3 text-sm font-body focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground resize-y"
                      placeholder="Article content... (separate paragraphs with blank lines)"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-body mb-1 block">Header Image URL</label>
                    <input
                      value={formImage}
                      onChange={(e) => setFormImage(e.target.value)}
                      className="w-full bg-secondary text-foreground px-4 py-2 text-sm font-body focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
                      placeholder="https://..."
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-body mb-1 block">Tags</label>
                    <div className="flex flex-wrap gap-2">
                      {allTags.filter((t) => t !== "ALL").map((tag) => (
                        <button
                          key={tag}
                          onClick={() => toggleTag(tag)}
                          className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider font-body transition-all ${
                            formTags.includes(tag)
                              ? `${getTagColor(tag)} text-foreground`
                              : "bg-secondary text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formFeatured}
                        onChange={(e) => setFormFeatured(e.target.checked)}
                        className="accent-primary"
                      />
                      <span className="text-sm font-body text-foreground">Featured</span>
                    </label>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-body mb-1 block">
                      <Calendar className="w-3 h-3 inline mr-1" /> Schedule (optional)
                    </label>
                    <input
                      type="datetime-local"
                      value={formSchedule}
                      onChange={(e) => setFormSchedule(e.target.value)}
                      className="bg-secondary text-foreground px-4 py-2 text-sm font-body focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  {/* Poll Config (only for OPINION) */}
                  {formTags.includes("OPINION") && (
                    <div className="border border-border p-4 bg-card">
                      <label className="flex items-center gap-2 cursor-pointer mb-4">
                        <input
                          type="checkbox"
                          checked={pollEnabled}
                          onChange={(e) => setPollEnabled(e.target.checked)}
                          className="accent-primary"
                        />
                        <span className="text-sm font-body font-semibold text-foreground">Enable Poll</span>
                      </label>

                      {pollEnabled && (
                        <div className="space-y-3">
                          <input
                            value={pollQuestion}
                            onChange={(e) => setPollQuestion(e.target.value)}
                            className="w-full bg-secondary text-foreground px-4 py-2 text-sm font-body focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
                            placeholder="Poll question..."
                          />

                          {pollOptions.map((opt, i) => (
                            <div key={i} className="flex gap-2">
                              <input
                                value={opt}
                                onChange={(e) => {
                                  const copy = [...pollOptions];
                                  copy[i] = e.target.value;
                                  setPollOptions(copy);
                                }}
                                className="flex-1 bg-secondary text-foreground px-4 py-2 text-sm font-body focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
                                placeholder={`Option ${i + 1}`}
                              />
                              {pollOptions.length > 2 && (
                                <button onClick={() => removePollOption(i)} className="p-2 text-muted-foreground hover:text-destructive">
                                  <X className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ))}

                          {pollOptions.length < 5 && (
                            <button
                              onClick={addPollOption}
                              className="text-sm text-primary font-body font-medium hover:underline flex items-center gap-1"
                            >
                              <Plus className="w-3.5 h-3.5" /> Add Option
                            </button>
                          )}

                          <div className="flex gap-4 items-center">
                            <div>
                              <label className="text-xs text-muted-foreground font-body block mb-1">Expiration (optional)</label>
                              <input
                                type="datetime-local"
                                value={pollExpiration}
                                onChange={(e) => setPollExpiration(e.target.value)}
                                className="bg-secondary text-foreground px-3 py-1.5 text-sm font-body focus:outline-none focus:ring-1 focus:ring-primary"
                              />
                            </div>
                            <label className="flex items-center gap-2 cursor-pointer mt-4">
                              <input
                                type="checkbox"
                                checked={pollLocked}
                                onChange={(e) => setPollLocked(e.target.checked)}
                                className="accent-primary"
                              />
                              <span className="text-sm font-body text-foreground">Lock after voting</span>
                            </label>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <Button variant="accent" size="lg" onClick={handleSaveArticle}>
                      {editing ? "Update Article" : "Publish Article"}
                    </Button>
                    <Button variant="secondary" size="lg" onClick={resetForm}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* ─── Users Tab ─── */}
          <TabsContent value="users">
            <div className="max-w-xl">
              <h3 className="font-display text-2xl text-foreground mb-4">Manage Users</h3>
              <p className="text-sm text-muted-foreground font-body mb-6">
                Search by email or @username to verify users or grant admin access.
              </p>

              <div className="flex gap-2 mb-6">
                <input
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Email or @username..."
                  className="flex-1 bg-secondary text-foreground px-4 py-3 text-sm font-body focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
                  onKeyDown={(e) => e.key === "Enter" && handleSearchUser()}
                />
                <Button variant="accent" onClick={handleSearchUser}>
                  <Search className="w-4 h-4" />
                </Button>
              </div>

              {searchError && (
                <p className="text-sm text-destructive font-body mb-4">{searchError}</p>
              )}

              {foundUser && (
                <div className="bg-card border border-border p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-muted overflow-hidden">
                      {foundUser.photoURL && (
                        <img src={foundUser.photoURL} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground font-body">{foundUser.displayName}</span>
                        {foundUser.verified && <CheckCircle2 className="w-4 h-4 text-[hsl(210,100%,56%)]" />}
                        {foundUser.isAdmin && <Shield className="w-4 h-4 text-primary" />}
                      </div>
                      <span className="text-sm text-muted-foreground font-body">
                        @{foundUser.username} · {foundUser.email}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="text-xs text-muted-foreground font-body">
                      <Users className="w-3 h-3 inline" /> {foundUser.followers} followers
                    </span>
                    <span className="text-xs text-muted-foreground font-body">
                      Joined {new Date(foundUser.createdAt).toLocaleDateString("en-GB")}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <Button
                      variant={foundUser.verified ? "secondary" : "accent"}
                      size="sm"
                      onClick={() => handleVerify(!foundUser.verified)}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      {foundUser.verified ? "Remove Verification" : "Verify User"}
                    </Button>
                    {!foundUser.isAdmin && (
                      <Button variant="outline" size="sm" onClick={handlePromoteAdmin}>
                        <Shield className="w-3.5 h-3.5 mr-1" /> Promote to Admin
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-xs text-muted-foreground font-body">Followers:</label>
                    <input
                      type="number"
                      value={followerInput}
                      onChange={(e) => setFollowerInput(e.target.value)}
                      className="w-24 bg-secondary text-foreground px-3 py-1.5 text-sm font-body focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <Button variant="secondary" size="sm" onClick={handleSetFollowers}>
                      Set
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* ─── Analytics Tab ─── */}
          <TabsContent value="analytics">
            <h3 className="font-display text-2xl text-foreground mb-6">Analytics</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Total Views", value: articles.reduce((a, b) => a + b.views, 0).toLocaleString(), icon: Eye },
                { label: "Total Likes", value: articles.reduce((a, b) => a + b.likes, 0).toLocaleString(), icon: Heart },
                { label: "Total Comments", value: articles.reduce((a, b) => a + b.commentCount, 0).toLocaleString(), icon: MessageCircle },
                { label: "Articles", value: articles.length.toString(), icon: Edit },
              ].map((stat) => (
                <div key={stat.label} className="bg-card border border-border p-6">
                  <stat.icon className="w-5 h-5 text-primary mb-2" />
                  <p className="font-display text-3xl text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground font-body mt-1">{stat.label}</p>
                </div>
              ))}
            </div>

            <h4 className="font-display text-xl text-foreground mb-4">Top Articles</h4>
            <div className="space-y-2">
              {[...articles]
                .sort((a, b) => b.views - a.views)
                .slice(0, 5)
                .map((article, i) => (
                  <div key={article.id} className="flex items-center gap-4 bg-card border border-border p-3">
                    <span className="font-display text-lg text-primary w-8">{String(i + 1).padStart(2, "0")}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground font-body truncate">{article.title}</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground font-body">
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{article.views.toLocaleString()}</span>
                      <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{article.likes.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
