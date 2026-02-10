import { useParams, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import ArticleCard from "@/components/ArticleCard";
import VerifiedBadge from "@/components/VerifiedBadge";
import { useAuth } from "@/contexts/AuthContext";
import { mockArticles } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Users, Calendar, Settings } from "lucide-react";
import { useState, useEffect } from "react";
import { getUserByUsername, isFollowing, followUser, unfollowUser } from "@/lib/firestore";
import { UserProfile } from "@/types";
import { motion } from "framer-motion";

const Profile = () => {
  const { username } = useParams();
  const { user, profile: myProfile } = useAuth();
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  // If viewing own profile or another user's
  const isOwnProfile = myProfile?.username === username;

  useEffect(() => {
    const load = async () => {
      if (isOwnProfile && myProfile) {
        setProfileData(myProfile);
      } else if (username) {
        const found = await getUserByUsername(username);
        setProfileData(found);
      }

      if (user && !isOwnProfile && username) {
        const result = await getUserByUsername(username);
        if (result) {
          const isF = await isFollowing(user.uid, result.uid);
          setFollowing(isF);
        }
      }
      setLoading(false);
    };
    load();
  }, [username, myProfile, user]);

  const handleFollow = async () => {
    if (!user || !profileData) return;
    if (following) {
      await unfollowUser(user.uid, profileData.uid);
      setFollowing(false);
      setProfileData((p) => p ? { ...p, followers: Math.max(0, p.followers - 1) } : p);
    } else {
      await followUser(user.uid, profileData.uid);
      setFollowing(true);
      setProfileData((p) => p ? { ...p, followers: p.followers + 1 } : p);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="text-muted-foreground font-body">Loading...</div>
        </div>
      </Layout>
    );
  }

  if (!profileData) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="font-display text-5xl text-foreground mb-4">User Not Found</h1>
          <Link to="/" className="text-primary font-body text-sm hover:underline">
            ← Back to Home
          </Link>
        </div>
      </Layout>
    );
  }

  // Mock: filter articles by author username
  const userArticles = mockArticles.filter(
    (a) => a.author.username === profileData.username
  );

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container mx-auto px-4 py-10"
      >
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-start gap-6 mb-12">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-muted overflow-hidden shrink-0">
            {profileData.photoURL && (
              <img src={profileData.photoURL} alt="" className="w-full h-full object-cover" />
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="font-display text-4xl md:text-5xl text-foreground">
                {profileData.displayName}
              </h1>
              {profileData.verified && <VerifiedBadge className="w-5 h-5" />}
            </div>
            <p className="text-muted-foreground font-body text-sm mb-4">
              @{profileData.username}
            </p>

            <div className="flex items-center gap-6 text-sm text-muted-foreground font-body mb-4">
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <strong className="text-foreground">{profileData.followers.toLocaleString()}</strong> followers
              </span>
              <span className="flex items-center gap-1">
                <strong className="text-foreground">{profileData.following}</strong> following
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Joined {new Date(profileData.createdAt).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}
              </span>
            </div>

            <div className="flex gap-2">
              {isOwnProfile ? (
                <Button variant="secondary" size="sm">
                  <Settings className="w-4 h-4 mr-1" /> Edit Profile
                </Button>
              ) : user ? (
                <Button
                  variant={following ? "secondary" : "accent"}
                  size="sm"
                  onClick={handleFollow}
                >
                  {following ? "Following" : "Follow"}
                </Button>
              ) : null}
            </div>
          </div>
        </div>

        {/* User's Articles */}
        <h2 className="font-display text-3xl text-foreground mb-6">Posts</h2>
        {userArticles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {userArticles.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        ) : (
          <div className="text-muted-foreground font-body text-sm py-10 text-center">
            No posts yet.
          </div>
        )}
      </motion.div>
    </Layout>
  );
};

export default Profile;
