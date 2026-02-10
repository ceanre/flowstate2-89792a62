import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { checkUsernameAvailable, createUserProfile } from "@/lib/firestore";
import { UserProfile } from "@/types";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const UsernameModal = () => {
  const { user, setProfile, setNeedsUsername } = useAuth();
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);

  if (!user) return null;

  const handleSubmit = async () => {
    const clean = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
    if (clean.length < 3) {
      setError("Username must be at least 3 characters");
      return;
    }
    if (clean.length > 20) {
      setError("Username must be 20 characters or less");
      return;
    }

    setChecking(true);
    setError("");

    const available = await checkUsernameAvailable(clean);
    if (!available) {
      setError("Username is already taken");
      setChecking(false);
      return;
    }

    const newProfile: UserProfile = {
      uid: user.uid,
      email: user.email || "",
      displayName: user.displayName || "",
      username: clean,
      photoURL: user.photoURL || "",
      verified: false,
      followers: 0,
      following: 0,
      isAdmin: user.email === "prod.ceanre@gmail.com",
      createdAt: new Date().toISOString(),
      lastUsernameChange: new Date().toISOString(),
    };

    await createUserProfile(newProfile);
    setProfile(newProfile);
    setNeedsUsername(false);
    setChecking(false);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md"
      >
        <h2 className="font-display text-5xl text-foreground mb-2">Choose Your Name</h2>
        <p className="text-muted-foreground font-body text-sm mb-8">
          Pick a unique username. You can change it once every 14 days.
        </p>

        <div className="relative mb-4">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-body font-bold">
            @
          </span>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value.replace(/\s/g, ""))}
            placeholder="username"
            maxLength={20}
            className="w-full bg-secondary text-foreground pl-9 pr-4 py-4 font-body font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground"
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
        </div>

        {error && <p className="text-primary font-body text-sm mb-4">{error}</p>}

        <Button
          variant="accent"
          size="lg"
          onClick={handleSubmit}
          disabled={checking || username.length < 3}
          className="w-full"
        >
          {checking ? "Checking..." : "Continue"}
        </Button>
      </motion.div>
    </div>
  );
};

export default UsernameModal;
