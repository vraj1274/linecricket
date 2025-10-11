import { Smartphone } from "lucide-react";
import image1 from "../assets/WhatsApp Image 2025-09-12 at 18.59.08_b53a7aeb.jpg";
import image2 from "../assets/WhatsApp Image 2025-09-12 at 19.02.19_b9b73655.jpg";
import { LandingContentSection } from "./LandingContentSection";
import { LandingHeader } from "./LandingHeader";

interface NewLandingPageProps {
  onNavigateToLogin: () => void;
  onNavigateToSignup: () => void;
}

export function NewLandingPage({ onNavigateToLogin, onNavigateToSignup }: NewLandingPageProps) {
  return (
    <div className="min-h-screen bg-white/90 backdrop-blur-sm">
      {/* Header */}
      <LandingHeader 
        onNavigateToLogin={onNavigateToLogin}
        onNavigateToSignup={onNavigateToSignup}
      />

      {/* Main Content */}
      <main className="pt-6">
        {/* First Section - Image on Left, Text on Right */}
        <LandingContentSection
          imageUrl={image1}
          imageAlt="Cricket Academy Training Ground"
          style={{ marginRight: "600px" }}
          title="Train Like a Champion"
          description="Connect with top cricket academies and training facilities worldwide. Share your training journey, learn from experienced coaches, and build your skills alongside fellow cricket enthusiasts."
          imageOnLeft={true}
        />

        {/* Second Section - Image on Right, Text on Left (Zig-zag pattern) */}
        <LandingContentSection
          imageUrl={image2}
          imageAlt="Cricket Stadium Field"
          style={{ marginLeft: "600px" }}
          title="Experience the Atmosphere"
          description="From local grounds to iconic stadiums, share your cricket experiences with a passionate community. Follow live matches, connect with fans worldwide, and celebrate the sport that brings us all together."
          imageOnLeft={false}
        />
        

        {/* App Download Section - Integrated Footer Content */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center space-y-8">
              {/* App Download Section */}
              <div className="space-y-4">
                <div className="flex justify-center items-center space-x-2">
                  <Smartphone className="h-6 w-6 text-primary" />
                  <h3 className="text-xl font-semibold text-gray-900">
                    Download TheLineCricket App
                  </h3>
                </div>
                <p className="text-gray-600 max-w-md mx-auto">
                  Join the cricket community and stay connected with players, fans, and cricket enthusiasts worldwide.
                </p>
              </div>

              {/* App Store Links */}
              <div className="flex justify-center space-x-4">
                <a
                  href="https://play.google.com/store/apps/details?id=com.thelinecricket.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200"
                >
                  <div className="flex items-center space-x-2">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.61 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.92 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                    </svg>
                    <div className="text-left">
                      <div className="text-xs">Get it on</div>
                      <div className="text-sm font-semibold">Google Play</div>
                    </div>
                  </div>
                </a>

                <a
                  href="https://apps.apple.com/app/thelinecricket/id1234567890"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200"
                >
                  <div className="flex items-center space-x-2">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.09,16.67C20.06,16.74 19.67,18.11 18.71,19.5M13,3.5C13.73,2.67 14.94,2.04 15.94,2C16.07,3.17 15.6,4.35 14.9,5.19C14.21,6.04 13.07,6.7 11.95,6.61C11.8,5.46 12.36,4.26 13,3.5Z"/>
                    </svg>
                    <div className="text-left">
                      <div className="text-xs">Download on the</div>
                      <div className="text-sm font-semibold">App Store</div>
                    </div>
                  </div>
                </a>
              </div>

              {/* Copyright */}
              <div className="pt-8 border-t border-gray-200">
                <p className="text-gray-500 text-sm">
                  © 2025 TheLineCricket. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}