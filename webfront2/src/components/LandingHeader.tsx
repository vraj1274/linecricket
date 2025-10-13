import React from "react";
import { Button } from "./ui/button";
import newIcon from "../assets/newiconfinal.svg";
import logo from "../assets/logo.svg";

interface LandingHeaderProps {
  onNavigateToLogin: () => void;
  onNavigateToSignup: () => void;
}

export function LandingHeader({ onNavigateToLogin, onNavigateToSignup }: LandingHeaderProps) {
  return (
    <header className="w-full bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Branding */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center space-x-3">
              <img src={newIcon} alt="TheLineCricket" className="h-8 w-8" />
              <h1 className="text-2xl font-bold text-primary">TheLineCricket</h1>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" className="text-primary hover:text-primary/80">
              Home
            </Button>
            <Button 
              variant="ghost" 
              className="text-primary hover:text-primary/80"
              onClick={onNavigateToLogin}
            >
              Sign In
            </Button>
            <Button 
              variant="default" 
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={onNavigateToSignup}
            >
              Sign Up
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

