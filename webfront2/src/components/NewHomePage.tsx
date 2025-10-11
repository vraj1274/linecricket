import Logo from './Logo';

interface NewHomePageProps {
  onNavigateToLogin: () => void;
  onNavigateToSignup: () => void;
  onNavigateToCoachProfile: () => void;
}

function NewHomePage({ onNavigateToLogin, onNavigateToSignup, onNavigateToCoachProfile }: NewHomePageProps) {
  return (
    <div className="homepage">
      {/* Navigation Header */}
      <nav className="homepage-nav">
        <div className="nav-container">
          <Logo size="xlarge" variant="light" />
          <div className="nav-links">
            <button onClick={onNavigateToLogin} className="nav-link">Sign In</button>
            <button onClick={onNavigateToSignup} className="nav-cta">Get Started</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              <span className="highlight">Learn. Play. Connect.</span>
            </h1>
            <h2></h2>
            <p className="hero-subtitle">
              The ultimate hub for cricket lovers — from aspiring rookies to seasoned pros.
              Train, play matches, build your network, and grow your cricketing journey.
            </p>
            <div className="hero-ctas">
              <button onClick={onNavigateToSignup} className="cta-primary">
                🏏 Start Playing
              </button>
              <button onClick={onNavigateToCoachProfile} className="cta-secondary">
                🎓 Join as a Coach
              </button>
            </div>
          </div>
          <div className="hero-visual">
            <img
            src="/cricket-hero.jpg"
            alt="The Line Cricket"
            className="cover-image"
          />
          </div>
        </div>
      </section>

      {/* Learn Section */}
      <section className="feature-section learn-section">
        <div className="container">
          <div className="section-header">
            <h2>Learn — Unlock Your Potential</h2>
            <div className="section-badge">Learn from the Best</div>
          </div>
          <p className="section-description">
            Access training content, tips, drills, and insights from:
          </p>
          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon">🌟</div>
              <h3>National & State Players</h3>
              <p>Learn from the pros who've played at the highest levels</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🏆</div>
              <h3>Certified Coaches</h3>
              <p>Professional coaching techniques and methodologies</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>Influencers & Experts</h3>
              <p>Modern cricket insights and trending techniques</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🏫</div>
              <h3>Local Academies</h3>
              <p>Connect with cricket academies and clubs near you</p>
            </div>
          </div>
          <div className="section-cta">
            <button onClick={onNavigateToSignup} className="cta-primary">Start Learning</button>
          </div>
        </div>
      </section>

      {/* Play Section */}
      <section className="feature-section play-section">
        <div className="container">
          <div className="section-header">
            <h2>⚡ Play — Create Matches, Build Teams</h2>
            <div className="section-badge">Play Competitive & Practice Matches</div>
          </div>
          <p className="section-description">
            Organize your own practice or competitive matches. Invite players of all roles —
            batsmen, bowlers, keepers, fielders — and track team performance. Host club vs club,
            community vs community battles, or create your own leagues.
          </p>
          <div className="play-features">
            <div className="play-feature">
              <span className="play-emoji">🏏</span>
              <span>Practice Matches</span>
            </div>
            <div className="play-feature">
              <span className="play-emoji">🏆</span>
              <span>Competitive Leagues</span>
            </div>
            <div className="play-feature">
              <span className="play-emoji">👥</span>
              <span>Team Building</span>
            </div>
            <div className="play-feature">
              <span className="play-emoji">📊</span>
              <span>Performance Tracking</span>
            </div>
          </div>
          <div className="section-cta">
            <button onClick={onNavigateToSignup} className="cta-primary">Create a Match</button>
          </div>
        </div>
      </section>

      {/* Connect Section */}
      <section className="feature-section connect-section">
        <div className="container">
          <div className="section-header">
            <h2>Connect — Build Your Cricketing Circle</h2>
            <div className="section-badge">Connect with the Cricket Network</div>
          </div>
          <p className="section-description">
            Meet and collaborate with:
          </p>
          <div className="connect-grid">
            <div className="connect-card">
              <div className="connect-icon">🏟️</div>
              <h3>Pitch Providers</h3>
              <p>Find and book cricket grounds near you</p>
            </div>
            <div className="connect-card">
              <div className="connect-icon">🏫</div>
              <h3>Cricket Academies</h3>
              <p>Professional training institutions</p>
            </div>
            <div className="connect-card">
              <div className="connect-icon">👥</div>
              <h3>Local Clubs</h3>
              <p>Join communities of cricket enthusiasts</p>
            </div>
            <div className="connect-card">
              <div className="connect-icon">⭐</div>
              <h3>Rising Talent</h3>
              <p>Connect with upcoming players and influencers</p>
            </div>
          </div>
          <div className="section-cta">
            <button onClick={onNavigateToSignup} className="cta-primary">Find Players & Clubs</button>
          </div>
        </div>
      </section>

      {/* Why TheLine Section */}
      <section className="why-section">
        <div className="container">
          <h2>💪 Why TheLine?</h2>
          <div className="why-grid">
            <div className="why-item">
              <span className="why-icon">🎯</span>
              <span>One-stop platform: Learn + Play + Connect</span>
            </div>
            <div className="why-item">
              <span className="why-icon">👨‍🏫</span>
              <span>Designed for players, coaches, and clubs</span>
            </div>
            <div className="why-item">
              <span className="why-icon">📅</span>
              <span>Easy scheduling and match creation</span>
            </div>
            <div className="why-item">
              <span className="why-icon">🤝</span>
              <span>Skill development made social</span>
            </div>
            <div className="why-item">
              <span className="why-icon">📈</span>
              <span>Build your profile and track your growth</span>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="final-cta-section">
        <div className="container">
          <h2>📲 Ready to Join the Line?</h2>
          <p>Build your cricket journey — from street pitch to stadium.</p>
          <div className="final-ctas">
            <button onClick={onNavigateToSignup} className="cta-primary large">Sign Up Now</button>
            <button onClick={onNavigateToSignup} className="cta-secondary large">Join as a Club or Academy</button>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="social-proof-section">
        <div className="container">
          <div className="social-proof-content">
            <h3>⚡ Trusted by Cricket Community</h3>
            <p>Trusted by 500+ cricket players, clubs, and academies across India.
              Featured content from influencers and state-level players.</p>
            <div className="stats">
              <div className="stat">
                <span className="stat-number">500+</span>
                <span className="stat-label">Players</span>
              </div>
              <div className="stat">
                <span className="stat-number">50+</span>
                <span className="stat-label">Clubs</span>
              </div>
              <div className="stat">
                <span className="stat-number">25+</span>
                <span className="stat-label">Academies</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="newsletter-section">
        <div className="container">
          <h3>📩 Stay Ahead of the Game</h3>
          <p>Get cricket tips, tournament updates, and new features delivered to your inbox.</p>
          <div className="newsletter-form">
            <input type="email" placeholder="Enter your email" className="newsletter-input" />
            <button className="newsletter-btn">Subscribe</button>
          </div>
          <div className="app-download">
            <p>Download our app:</p>
            <div className="app-buttons">
              <button className="app-btn">📱 App Store</button>
              <button className="app-btn">🤖 Play Store</button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="homepage-footer">
        <div className="container">
          <div className="footer-content">
            <Logo size="small" variant="dark" />
            <p>© 2025 TheLine Cricket. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default NewHomePage;
