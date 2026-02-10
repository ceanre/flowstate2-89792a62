import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getComments, addComment, likeComment, pinComment } from "@/lib/firestore";
import { Comment } from "@/types";
import VerifiedBadge from "@/components/VerifiedBadge";
import { Heart, MessageCircle, Pin, Flag, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface CommentSectionProps {
  articleId: string;
}

const CommentSection = ({ articleId }: CommentSectionProps) => {
  const { user, profile, isAdmin } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadComments();
  }, [articleId]);

  const loadComments = async () => {
    const data = await getComments(articleId);
    setComments(data);
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!user || !profile || !newComment.trim()) return;
    await addComment({
      articleId,
      userId: user.uid,
      userName: profile.displayName,
      userUsername: profile.username,
      userAvatar: profile.photoURL,
      userVerified: profile.verified,
      content: newComment.trim(),
      parentId: null,
      likes: 0,
      likedBy: [],
      pinned: false,
      createdAt: new Date().toISOString(),
    });
    setNewComment("");
    loadComments();
  };

  const handleReply = async (parentId: string) => {
    if (!user || !profile || !replyText.trim()) return;
    await addComment({
      articleId,
      userId: user.uid,
      userName: profile.displayName,
      userUsername: profile.username,
      userAvatar: profile.photoURL,
      userVerified: profile.verified,
      content: replyText.trim(),
      parentId,
      likes: 0,
      likedBy: [],
      pinned: false,
      createdAt: new Date().toISOString(),
    });
    setReplyTo(null);
    setReplyText("");
    loadComments();
  };

  const handleLike = async (commentId: string, likedBy: string[]) => {
    if (!user) return;
    const isLiked = likedBy.includes(user.uid);
    await likeComment(commentId, user.uid, isLiked);
    loadComments();
  };

  const handlePin = async (commentId: string, pinned: boolean) => {
    await pinComment(commentId, !pinned);
    loadComments();
  };

  const topLevel = comments
    .filter((c) => !c.parentId)
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const getReplies = (parentId: string) =>
    comments.filter((c) => c.parentId === parentId).sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    return `${Math.floor(hrs / 24)}d`;
  };

  const CommentItem = ({ comment, depth = 0 }: { comment: Comment; depth?: number }) => {
    const replies = getReplies(comment.id);
    const isLiked = user ? comment.likedBy.includes(user.uid) : false;

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${depth > 0 ? "ml-8 border-l border-border pl-4" : ""}`}
      >
        <div className={`py-4 ${comment.pinned ? "bg-secondary/50 -mx-3 px-3 border-l-2 border-primary" : ""}`}>
          {comment.pinned && (
            <span className="text-[10px] text-primary font-bold uppercase tracking-wider font-body flex items-center gap-1 mb-2">
              <Pin className="w-3 h-3" /> Pinned
            </span>
          )}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-muted shrink-0 overflow-hidden">
              {comment.userAvatar && (
                <img src={comment.userAvatar} alt="" className="w-full h-full object-cover" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-foreground font-body">
                  {comment.userName}
                </span>
                {comment.userVerified && <VerifiedBadge />}
                <span className="text-xs text-muted-foreground font-body">
                  @{comment.userUsername} · {timeAgo(comment.createdAt)}
                </span>
              </div>
              <p className="text-sm text-foreground/90 font-body leading-relaxed">{comment.content}</p>
              <div className="flex items-center gap-4 mt-2">
                <button
                  onClick={() => handleLike(comment.id, comment.likedBy)}
                  className={`flex items-center gap-1 text-xs font-body transition-colors ${
                    isLiked ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${isLiked ? "fill-primary" : ""}`} />
                  {comment.likes > 0 && comment.likes}
                </button>
                <button
                  onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground font-body transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" /> Reply
                </button>
                {isAdmin && (
                  <button
                    onClick={() => handlePin(comment.id, comment.pinned)}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary font-body transition-colors"
                  >
                    <Pin className="w-3.5 h-3.5" /> {comment.pinned ? "Unpin" : "Pin"}
                  </button>
                )}
                <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive font-body transition-colors">
                  <Flag className="w-3.5 h-3.5" /> Report
                </button>
              </div>
            </div>
          </div>

          {/* Reply Input */}
          <AnimatePresence>
            {replyTo === comment.id && user && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-3 ml-11 overflow-hidden"
              >
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write a reply..."
                    className="flex-1 bg-secondary text-foreground px-3 py-2 text-sm font-body focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
                    onKeyDown={(e) => e.key === "Enter" && handleReply(comment.id)}
                    autoFocus
                  />
                  <Button variant="accent" size="sm" onClick={() => handleReply(comment.id)}>
                    <Send className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Replies */}
        {replies.map((r) => (
          <CommentItem key={r.id} comment={r} depth={depth + 1} />
        ))}
      </motion.div>
    );
  };

  return (
    <div>
      <h3 className="font-display text-2xl text-foreground mb-6">
        Comments {comments.length > 0 && `(${comments.length})`}
      </h3>

      {/* Add Comment */}
      {user && profile ? (
        <div className="flex gap-3 mb-8">
          <div className="w-8 h-8 rounded-full bg-muted shrink-0 overflow-hidden">
            {profile.photoURL && (
              <img src={profile.photoURL} alt="" className="w-full h-full object-cover" />
            )}
          </div>
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Join the conversation..."
              className="flex-1 bg-secondary text-foreground px-4 py-3 text-sm font-body focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
            <Button variant="accent" onClick={handleSubmit} disabled={!newComment.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-secondary p-6 text-center mb-8">
          <p className="text-muted-foreground font-body text-sm">Sign in to join the conversation</p>
        </div>
      )}

      {/* Comment List */}
      {loading ? (
        <div className="text-muted-foreground font-body text-sm py-8 text-center">Loading comments...</div>
      ) : topLevel.length === 0 ? (
        <div className="text-muted-foreground font-body text-sm py-8 text-center">
          No comments yet. Be the first!
        </div>
      ) : (
        <div className="divide-y divide-border">
          {topLevel.map((c) => (
            <CommentItem key={c.id} comment={c} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentSection;
