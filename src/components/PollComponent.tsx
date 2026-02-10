import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { votePoll, getUserPollVote, getPollResults } from "@/lib/firestore";
import { Poll } from "@/types";
import { motion } from "framer-motion";
import { BarChart3, Lock, Clock } from "lucide-react";

interface PollComponentProps {
  articleId: string;
  poll: Poll;
}

const PollComponent = ({ articleId, poll }: PollComponentProps) => {
  const { user } = useAuth();
  const [voted, setVoted] = useState<number | null>(null);
  const [results, setResults] = useState<Record<number, number>>(poll.votes || {});
  const [totalVotes, setTotalVotes] = useState(poll.totalVotes || 0);
  const [loading, setLoading] = useState(false);

  const isExpired = poll.expiration ? new Date(poll.expiration) < new Date() : false;

  useEffect(() => {
    if (user) {
      getUserPollVote(articleId, user.uid).then((v) => {
        if (v) setVoted(v.optionIndex);
      });
    }
    getPollResults(articleId).then((r) => {
      if (Object.keys(r).length > 0) {
        setResults(r);
        setTotalVotes(Object.values(r).reduce((a, b) => a + b, 0));
      }
    });
  }, [articleId, user]);

  const handleVote = async (index: number) => {
    if (!user || voted !== null && poll.locked || isExpired || loading) return;
    setLoading(true);
    await votePoll(articleId, user.uid, index);
    setVoted(index);

    const newResults = { ...results };
    if (voted !== null) {
      newResults[voted] = Math.max(0, (newResults[voted] || 0) - 1);
    }
    newResults[index] = (newResults[index] || 0) + 1;
    setResults(newResults);
    setTotalVotes(Object.values(newResults).reduce((a, b) => a + b, 0));
    setLoading(false);
  };

  const getPercentage = (index: number) => {
    if (totalVotes === 0) return 0;
    return Math.round(((results[index] || 0) / totalVotes) * 100);
  };

  const showResults = voted !== null || isExpired || !user;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-secondary border border-border p-6 my-8"
    >
      <div className="flex items-center gap-2 mb-1">
        <BarChart3 className="w-4 h-4 text-primary" />
        <span className="text-xs font-bold uppercase tracking-wider text-primary font-body">
          Community Poll
        </span>
      </div>

      <h4 className="font-display text-xl text-foreground mb-5">{poll.question}</h4>

      <div className="space-y-3">
        {poll.options.map((option, i) => {
          const pct = getPercentage(i);
          const isSelected = voted === i;

          return (
            <button
              key={i}
              onClick={() => handleVote(i)}
              disabled={showResults && (poll.locked || isExpired) || loading}
              className={`relative w-full text-left p-3 overflow-hidden transition-all font-body text-sm ${
                showResults
                  ? "cursor-default"
                  : "cursor-pointer hover:bg-accent"
              } ${isSelected ? "border border-primary" : "border border-border"}`}
            >
              {/* Progress Bar */}
              {showResults && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className={`absolute inset-y-0 left-0 ${
                    isSelected ? "bg-primary/20" : "bg-muted"
                  }`}
                />
              )}

              <div className="relative flex justify-between items-center">
                <span className={`font-medium ${isSelected ? "text-foreground" : "text-foreground/80"}`}>
                  {option}
                </span>
                {showResults && (
                  <span className={`font-bold text-sm ${isSelected ? "text-primary" : "text-muted-foreground"}`}>
                    {pct}%
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground font-body">
        <span>{totalVotes.toLocaleString()} votes</span>
        <div className="flex items-center gap-3">
          {poll.locked && (
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3" /> Locked after voting
            </span>
          )}
          {poll.expiration && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {isExpired ? "Poll ended" : `Ends ${new Date(poll.expiration).toLocaleDateString()}`}
            </span>
          )}
        </div>
      </div>

      {!user && (
        <p className="text-xs text-muted-foreground font-body mt-3">Sign in to vote</p>
      )}
    </motion.div>
  );
};

export default PollComponent;
