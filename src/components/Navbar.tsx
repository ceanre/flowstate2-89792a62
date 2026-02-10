import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, Menu, X, LogOut, Shield, User, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import VerifiedBadge from "@/components/VerifiedBadge";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { user, profile, signInWithGoogle, logout, isAdmin } = useAuth();
  const location = useLocation();

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/tag/music", label: "Music" },
    { to: "/tag/drops", label: "Drops" },
    { to: "/tag/news", label: "News" },
    { to: "/tag/opinion", label: "Opinion" },
    { to: "/tag/culture", label: "Culture" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="font-display text-3xl text-primary tracking-tight">FLOW</span>
          <span className="font-display text-3xl text-foreground tracking-tight">STATE</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-3 py-2 text-sm font-semibold uppercase tracking-wider transition-colors ${
                location.pathname === link.to
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Search className="w-5 h-5" />
          </button>

          {user ? (
            <div className="flex items-center gap-1">
              {/* Notifications */}
              <button className="p-2 text-muted-foreground hover:text-foreground transition-colors relative">
                <Bell className="w-5 h-5" />
              </button>

              {/* Admin Link */}
              {isAdmin && (
                <Link
                  to="/admin"
                  className="p-2 text-muted-foreground hover:text-primary transition-colors hidden md:block"
                >
                  <Shield className="w-5 h-5" />
                </Link>
              )}

              {/* Profile */}
              <Link
                to={profile ? `/profile/${profile.username}` : "#"}
                className="flex items-center gap-2 ml-1"
              >
                <div className="w-8 h-8 rounded-full bg-muted overflow-hidden border border-border">
                  {(profile?.photoURL || user.photoURL) && (
                    <img
                      src={profile?.photoURL || user.photoURL || ""}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                {profile && (
                  <span className="hidden md:flex items-center gap-1 text-sm font-body font-medium text-foreground">
                    @{profile.username}
                    {profile.verified && <VerifiedBadge />}
                  </span>
                )}
              </Link>

              <button
                onClick={logout}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors hidden md:block"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Button variant="accent" size="sm" onClick={signInWithGoogle}>
              Sign In
            </Button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 text-foreground"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-border overflow-hidden"
          >
            <div className="container mx-auto px-4 py-3">
              <input
                type="text"
                placeholder="Search articles..."
                autoFocus
                className="w-full bg-secondary text-foreground px-4 py-3 text-sm font-body focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-b border-border overflow-hidden bg-background"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                  className={`px-3 py-3 text-sm font-bold uppercase tracking-wider transition-colors ${
                    location.pathname === link.to
                      ? "text-primary bg-secondary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMenuOpen(false)}
                  className="px-3 py-3 text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2"
                >
                  <Shield className="w-4 h-4" /> Admin
                </Link>
              )}
              {user && profile && (
                <Link
                  to={`/profile/${profile.username}`}
                  onClick={() => setMenuOpen(false)}
                  className="px-3 py-3 text-sm font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground flex items-center gap-2"
                >
                  <User className="w-4 h-4" /> Profile
                </Link>
              )}
              {user && (
                <button
                  onClick={() => {
                    logout();
                    setMenuOpen(false);
                  }}
                  className="px-3 py-3 text-sm font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground text-left flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
