import React from "react";
import Navbar from "@/components/Navbar";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">{children}</main>
      <footer className="border-t border-border mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="font-display text-2xl text-primary">FLOW</span>
                <span className="font-display text-2xl text-foreground">STATE</span>
              </div>
              <p className="text-sm text-muted-foreground max-w-xs font-body">
                UK rap news, culture, and opinion. The sound of the streets, amplified.
              </p>
            </div>
            <div className="flex gap-12">
              <div>
                <h4 className="font-display text-sm text-foreground mb-3">Sections</h4>
                <div className="flex flex-col gap-2 text-sm text-muted-foreground font-body">
                  <span>Music</span>
                  <span>Drops</span>
                  <span>News</span>
                  <span>Opinion</span>
                </div>
              </div>
              <div>
                <h4 className="font-display text-sm text-foreground mb-3">Company</h4>
                <div className="flex flex-col gap-2 text-sm text-muted-foreground font-body">
                  <span>About</span>
                  <span>Contact</span>
                  <span>Advertise</span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-border text-xs text-muted-foreground font-body">
            © 2025 FlowState. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
