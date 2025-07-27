import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';
import { 
  FaChartLine, FaUsers, FaSmile, FaBuilding, FaQuoteLeft, FaRocket, 
  FaShieldAlt, FaCog, FaLightbulb, FaCheckCircle, FaStar, FaGlobe,
  FaTwitter, FaLinkedin, FaGithub, FaEnvelope, FaPhone, FaMapMarkerAlt,
  FaArrowRight, FaPlay, FaDownload, FaHeadset, FaClock, FaAward
} from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area, RadialBarChart, RadialBar, PolarAngleAxis, RadarChart, PolarGrid, Radar } from 'recharts';
import { motion } from 'framer-motion';

const statsData = [
  { name: 'Reviews', value: 1200000 },
  { name: 'Accuracy', value: 98 },
  { name: 'Clients', value: 350 },
];

const pieData = [
  { name: 'Positive', value: 72, color: '#22c55e' },
  { name: 'Neutral', value: 18, color: '#facc15' },
  { name: 'Negative', value: 10, color: '#ef4444' },
];

// Radar chart data
const radarData = [
  { category: 'Positive', value: 72 },
  { category: 'Neutral', value: 18 },
  { category: 'Negative', value: 10 },
];

const lineData = [
  { month: 'Jan', sentiment: 70, volume: 1200 },
  { month: 'Feb', sentiment: 72, volume: 1350 },
  { month: 'Mar', sentiment: 74, volume: 1500 },
  { month: 'Apr', sentiment: 73, volume: 1400 },
  { month: 'May', sentiment: 75, volume: 1600 },
  { month: 'Jun', sentiment: 78, volume: 1800 },
];

// Gauge chart data
const accuracyData = [{ name: 'Accuracy', value: 98, fill: '#22c55e' }];

const features = [
  {
    icon: <FaRocket />,
    title: "Real-time Analytics",
    description: "Monitor customer sentiment as it happens with our lightning-fast processing engine."
  },
  {
    icon: <FaShieldAlt />,
    title: "Enterprise Security",
    description: "Bank-level encryption and compliance with GDPR, SOC 2, and HIPAA standards."
  },
  {
    icon: <FaCog />,
    title: "Advanced AI Models",
    description: "State-of-the-art machine learning models trained on millions of data points."
  },
  {
    icon: <FaLightbulb />,
    title: "Actionable Insights",
    description: "Get specific recommendations to improve customer satisfaction and retention."
  },
  {
    icon: <FaGlobe />,
    title: "Multi-language Support",
    description: "Analyze sentiment across 50+ languages with native accuracy."
  },
  {
    icon: <FaHeadset />,
    title: "24/7 Support",
    description: "Dedicated customer success team with average response time under 2 hours."
  }
];

const pricingPlans = [
  {
    name: "Starter",
    price: "$99",
    period: "/month",
    description: "Perfect for small teams getting started",
    features: ["Up to 10,000 reviews/month", "Basic sentiment analysis", "Email support", "Standard integrations"],
    popular: false
  },
  {
    name: "Professional",
    price: "$299",
    period: "/month",
    description: "Ideal for growing businesses",
    features: ["Up to 100,000 reviews/month", "Advanced analytics", "Priority support", "Custom integrations", "Team collaboration"],
    popular: true
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large organizations with complex needs",
    features: ["Unlimited reviews", "Custom AI models", "Dedicated support", "White-label options", "Advanced security", "Custom reporting"],
    popular: false
  }
];

const integrations = [
  { name: "Shopify", icon: "🛒" },
  { name: "Salesforce", icon: "☁️" },
  { name: "Zendesk", icon: "🎫" },
  { name: "Intercom", icon: "💬" },
  { name: "HubSpot", icon: "🎯" },
  { name: "Slack", icon: "💻" },
  { name: "Microsoft Teams", icon: "📱" },
  { name: "Google Analytics", icon: "📊" }
];

const caseStudies = [
  {
    company: "TechCorp Inc.",
    industry: "SaaS",
    challenge: "Struggling with customer churn and negative reviews",
    solution: "Implemented SentientAI to monitor sentiment across all touchpoints",
    results: ["40% reduction in churn", "25% increase in NPS", "15% boost in customer lifetime value"],
    logo: "🏢"
  },
  {
    company: "RetailMax",
    industry: "E-commerce",
    challenge: "Unable to understand customer pain points at scale",
    solution: "Deployed real-time sentiment analysis across 50+ product categories",
    results: ["60% faster issue resolution", "30% improvement in customer satisfaction", "20% increase in repeat purchases"],
    logo: "🛍️"
  },
  {
    company: "HealthTech Solutions",
    industry: "Healthcare",
    challenge: "Compliance requirements for patient feedback analysis",
    solution: "HIPAA-compliant sentiment analysis with secure data handling",
    results: ["100% compliance achievement", "50% faster feedback processing", "Improved patient care quality"],
    logo: "🏥"
  }
];

const testimonials = [
  {
    quote: 'SentientAI helped us boost customer satisfaction by 30% in just six months. The insights are game-changing.',
    author: 'Jane Doe, VP Customer Experience at Acme Corp',
    role: 'VP Customer Experience',
    company: 'Acme Corp',
    rating: 5
  },
  {
    quote: 'The insights are unbelievably accurate and easy to act on. A must-have tool for any data-driven company.',
    author: 'Carlos Nguyen, Head of Data at Globex',
    role: 'Head of Data',
    company: 'Globex',
    rating: 5
  },
  {
    quote: 'A premium product with stellar support. It\'s now core to our BI stack and decision-making process.',
    author: 'Priya Patel, CIO at Innotech Solutions',
    role: 'CIO',
    company: 'Innotech Solutions',
    rating: 5
  },
  {
    quote: 'Our NPS soared after using SentientAI\'s actionable analytics. ROI was immediate and substantial.',
    author: 'Alex Kim, Director of Marketing at BetaTech',
    role: 'Director of Marketing',
    company: 'BetaTech',
    rating: 5
  },
  {
    quote: 'The multi-language support is incredible. We can now understand our global customer base like never before.',
    author: 'Maria Rodriguez, Global Customer Success at WorldTech',
    role: 'Global Customer Success',
    company: 'WorldTech',
    rating: 5
  },
  {
    quote: 'Enterprise-grade security with startup-level ease of use. Exactly what we needed for our compliance requirements.',
    author: 'David Chen, CTO at SecureFlow',
    role: 'CTO',
    company: 'SecureFlow',
    rating: 5
  },
  {
    quote: 'SentientAI’s dashboard is intuitive and powerful. Our team uses it daily to track sentiment trends.',
    author: 'Linda Park, Product Manager at RetailMax',
    role: 'Product Manager',
    company: 'RetailMax',
    rating: 5
  },
  {
    quote: 'The integration process was seamless. We were up and running in less than a day.',
    author: 'Omar El-Sayed, Head of IT at ShopEase',
    role: 'Head of IT',
    company: 'ShopEase',
    rating: 5
  }
];

const team = [
  {
    name: "Dr. Sarah Johnson",
    role: "CEO & Co-founder",
    bio: "Former AI Research Lead at Google, PhD in Machine Learning from Stanford",
    image: "👩‍💼"
  },
  {
    name: "Michael Chen",
    role: "CTO & Co-founder",
    bio: "Ex-Engineering Director at Twitter, 15+ years in distributed systems",
    image: "👨‍💻"
  },
  {
    name: "Dr. Emily Rodriguez",
    role: "Head of AI Research",
    bio: "PhD in Natural Language Processing, published 50+ papers in sentiment analysis",
    image: "👩‍🔬"
  },
  {
    name: "James Wilson",
    role: "VP of Product",
    bio: "Former Product Manager at Salesforce, expert in customer experience platforms",
    image: "👨‍💼"
  }
];

function Landing(): React.ReactElement {
  // Section refs for smooth scrolling
  const howItWorksRef = useRef<HTMLDivElement | null>(null);
  const pricingRef = useRef<HTMLDivElement | null>(null);
  const featuresRef = useRef<HTMLDivElement | null>(null);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="landing-wrapper">
      {/* Sticky Navigation */}
      <header className="navbar">
        <div className="logo"><FaChartLine style={{marginRight: 8}}/>SentientAI</div>
        <nav>
          <a className="nav-link" onClick={() => scrollToSection(howItWorksRef)} style={{cursor: 'pointer'}}>About</a>
          <a className="nav-link" onClick={() => scrollToSection(pricingRef)} style={{cursor: 'pointer'}}>Pricing</a>
          <a className="nav-link" onClick={() => scrollToSection(featuresRef)} style={{cursor: 'pointer'}}>Features</a>
          <Link to="/login" className="nav-link">Login</Link>
          <Link to="/signup" className="nav-link primary">Sign Up</Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-icon"><FaSmile size={48} color="#2563eb"/></div>
          <h1 className="hero-title">Transform Customer Feedback into Strategic Insights</h1>
          <p className="hero-subtitle">The world's most advanced sentiment analytics platform. Trusted by Fortune 500 companies to understand customer emotions, predict churn, and drive growth through AI-powered insights.</p>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="stat-number">1.2M+</span>
              <span className="stat-label">Reviews Analyzed</span>
            </div>
            <div className="hero-stat">
              <span className="stat-number">98%</span>
              <span className="stat-label">Accuracy Rate</span>
            </div>
            <div className="hero-stat">
              <span className="stat-number">350+</span>
              <span className="stat-label">Enterprise Clients</span>
            </div>
          </div>
          <div className="hero-cta">
            <Link to="/signup" className="cta-btn primary">Start Free Trial <FaArrowRight style={{marginLeft: 8}}/></Link>
            <a href="https://drive.google.com/file/d/1jMhOr-MFE0CfSvO6rZZU2uRJMS1IeTTx/view?usp=sharing" target="_blank" rel="noopener noreferrer" className="cta-btn secondary"><FaPlay style={{marginRight: 8}}/>Watch Demo</a>
          </div>
          <p className="trust-text">No credit card required • 14-day free trial • Cancel anytime</p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features" ref={featuresRef}>
        <div className="section-header">
          <h2>Why Leading Companies Choose SentientAI</h2>
          <p>Built for scale, designed for results. Our platform delivers enterprise-grade sentiment analysis that drives real business outcomes.</p>
        </div>
        <div className="features-grid">
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              className="feature-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works" ref={howItWorksRef}>
        <div className="section-header">
          <h2>How SentientAI Works</h2>
          <p>Get actionable insights in three simple steps</p>
        </div>
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Connect Your Data</h3>
            <p>Integrate with your existing platforms - CRM, help desk, social media, or upload files directly.</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>AI Analysis</h3>
            <p>Our advanced AI models analyze sentiment, emotions, and intent across all your customer touchpoints.</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Get Insights</h3>
            <p>Receive actionable recommendations, alerts, and detailed reports to improve customer experience.</p>
          </div>
        </div>
      </section>

      {/* Stats & Charts Section */}
      <section className="stats-charts">
        <div className="section-header">
          <h2>Real-time Analytics Dashboard</h2>
          <p>Monitor your customer sentiment with live, interactive charts and insights</p>
        </div>
        <div className="stats-charts-row">
          <div className="chart-card">
            <h3><FaUsers style={{marginRight: 8}}/>Customer Reviews</h3>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={statsData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" hide/>
                <YAxis hide/>
                <Tooltip />
                <Bar dataKey="value" fill="#2563eb" radius={[8,8,0,0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="stat-label">1.2M+ Reviews</div>
          </div>
          <div className="chart-card">
            <h3><FaBuilding style={{marginRight: 8}}/>Sentiment Distribution</h3>
            <ResponsiveContainer width="100%" height={120}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={40}>
                  {pieData.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="stat-label">72% Positive</div>
          </div>
          <div className="chart-card">
            <h3><FaSmile style={{marginRight: 8}}/>Sentiment Trends</h3>
            <ResponsiveContainer width="100%" height={120}>
              <AreaChart data={lineData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <XAxis dataKey="month" hide/>
                <YAxis hide domain={[60, 80]}/>
                <Tooltip />
                <Area type="monotone" dataKey="sentiment" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
            <div className="stat-label">98% Accuracy</div>
          </div>
          {/* Volume Trends Line Chart */}
          <div className="chart-card">
            <h3><FaChartLine style={{marginRight: 8}}/>Volume Trends</h3>
            <ResponsiveContainer width="100%" height={120}>
              <LineChart data={lineData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <XAxis dataKey="month" hide/>
                <YAxis hide/>
                <Tooltip />
                <Line type="monotone" dataKey="volume" stroke="#1d4ed8" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
            <div className="stat-label">Volume Over Time</div>
          </div>
          {/* Accuracy Gauge Chart */}
          <div className="chart-card">
            <h3><FaGlobe style={{marginRight: 8}}/>Sentiment Radar</h3>
            <ResponsiveContainer width="100%" height={120}>
              <RadarChart data={radarData} outerRadius={50}>
                <PolarGrid />
                <PolarAngleAxis dataKey="category" tick={false} />
                <Radar dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
            <div className="stat-label">Sentiment Mix</div>
          </div>
          {/* Accuracy Gauge Chart */}
          <div className="chart-card">
            <h3><FaAward style={{marginRight: 8}}/>Accuracy Gauge</h3>
            <ResponsiveContainer width={140} height={120}>
              <RadialBarChart innerRadius="80%" outerRadius="100%" data={accuracyData} startAngle={180} endAngle={0}>
                <PolarAngleAxis type="number" domain={[0,100]} angleAxisId={0} tick={false} />
                <RadialBar dataKey="value" cornerRadius={10} fill="#22c55e" />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="stat-label">98% Accuracy</div>
          </div>
        </div>
      </section>

      {/* Case Studies */}
      <section className="case-studies">
        <div className="section-header">
          <h2>Success Stories</h2>
          <p>See how leading companies are transforming their business with SentientAI</p>
        </div>
        <div className="case-studies-grid">
          {caseStudies.map((study, index) => (
            <motion.div 
              key={index}
              className="case-study-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
            >
              <div className="case-study-header">
                <div className="company-logo">{study.logo}</div>
                <div>
                  <h3>{study.company}</h3>
                  <span className="industry">{study.industry}</span>
                </div>
              </div>
              <div className="case-study-content">
                <h4>Challenge</h4>
                <p>{study.challenge}</p>
                <h4>Solution</h4>
                <p>{study.solution}</p>
                <h4>Results</h4>
                <ul>
                  {study.results.map((result, idx) => (
                    <li key={idx}><FaCheckCircle style={{marginRight: 8, color: '#22c55e'}}/>{result}</li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="pricing" ref={pricingRef}>
        <div className="section-header">
          <h2>Choose Your Plan</h2>
          <p>Start free, scale as you grow. All plans include our core sentiment analysis features.</p>
        </div>
        <div className="pricing-grid">
          {pricingPlans.map((plan, index) => (
            <motion.div 
              key={index}
              className={`pricing-card ${plan.popular ? 'popular' : ''}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              {plan.popular && <div className="popular-badge">Most Popular</div>}
              <h3>{plan.name}</h3>
              <div className="price">
                <span className="amount">{plan.price}</span>
                <span className="period">{plan.period}</span>
              </div>
              <p className="description">{plan.description}</p>
              <ul className="features-list">
                {plan.features.map((feature, idx) => (
                  <li key={idx}><FaCheckCircle style={{marginRight: 8, color: '#22c55e'}}/>{feature}</li>
                ))}
              </ul>
              <Link to="/signup" className="pricing-cta">Get Started</Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Integrations */}
      <section className="integrations">
        <div className="section-header">
          <h2>Seamless Integrations</h2>
          <p>Connect with your favorite tools and platforms</p>
        </div>
        <div className="integrations-grid">
          {integrations.map((integration, index) => (
            <div key={index} className="integration-item">
              <span className="integration-icon">{integration.icon}</span>
              <span className="integration-name">{integration.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Animated Testimonials Carousel */}
      <section className="testimonials">
        <div className="section-header">
          <h2><FaQuoteLeft style={{marginRight: 8}}/>Trusted by Industry Leaders</h2>
          <p>Join thousands of companies that trust SentientAI for their sentiment analysis needs</p>
        </div>
        <div className="testimonial-carousel">
          <motion.div
            className="testimonial-track"
            initial={{ x: 0 }}
            animate={{ x: ["0%", "-50%"] }}
            transition={{ 
              repeat: Infinity,
              duration: 25,
              ease: "linear",
              repeatType: "loop"
            }}
          >
            {testimonials.concat(testimonials).map((t, idx) => (
              <div className="testimonial-card" key={idx}>
                <div className="testimonial-rating">
                  {[...Array(t.rating)].map((_, i) => (
                    <FaStar key={i} color="#fbbf24" />
                  ))}
                </div>
                <p>"{t.quote}"</p>
                <div className="testimonial-author">
                  <div className="author-info">
                    <div className="author-name">{t.author.split(',')[0]}</div>
                    <div className="author-role">{t.role} at {t.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Team Section */}
      <section id="about" className="team">
        <div className="section-header">
          <h2>Meet Our Leadership</h2>
          <p>The minds behind the world's most advanced sentiment analysis platform</p>
        </div>
        <div className="team-grid">
          {team.map((member, index) => (
            <motion.div 
              key={index}
              className="team-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="team-avatar">{member.image}</div>
              <h3>{member.name}</h3>
              <div className="team-role">{member.role}</div>
              <p>{member.bio}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Transform Your Customer Insights?</h2>
          <p>Join thousands of companies already using SentientAI to understand their customers better</p>
          <div className="cta-buttons">
            <Link to="/signup" className="cta-btn primary large">Start Free Trial <FaArrowRight style={{marginLeft: 8}}/></Link>
            <button className="cta-btn secondary large"><FaHeadset style={{marginRight: 8}}/>Schedule Demo</button>
          </div>
          <div className="cta-features">
            <div className="cta-feature"><FaClock style={{marginRight: 8}}/>Setup in 5 minutes</div>
            <div className="cta-feature"><FaShieldAlt style={{marginRight: 8}}/>Enterprise security</div>
            <div className="cta-feature"><FaAward style={{marginRight: 8}}/>99.9% uptime</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-logo">
              <FaChartLine style={{marginRight: 8}}/>SentientAI
            </div>
            <p>Transforming customer feedback into actionable insights with advanced AI.</p>
            <div className="social-links">
              <a href="#"><FaTwitter /></a>
              <a href="#"><FaLinkedin /></a>
              <a href="#"><FaGithub /></a>
            </div>
          </div>
          <div className="footer-section">
            <h4>Product</h4>
            <Link to="#features">Features</Link>
            <Link to="#pricing">Pricing</Link>
            <Link to="#">API</Link>
            <Link to="#">Integrations</Link>
          </div>
          <div className="footer-section">
            <h4>Company</h4>
            <Link to="#about">About</Link>
            <Link to="#">Careers</Link>
            <Link to="#">Blog</Link>
            <Link to="#">Press</Link>
          </div>
          <div className="footer-section">
            <h4>Support</h4>
            <Link to="#">Help Center</Link>
            <Link to="#">Documentation</Link>
            <Link to="#">Contact</Link>
            <Link to="#">Status</Link>
          </div>
          <div className="footer-section">
            <h4>Contact</h4>
            <div className="contact-info">
              <div><FaEnvelope style={{marginRight: 8}}/>hello@sentientai.com</div>
              <div><FaPhone style={{marginRight: 8}}/>+1 (555) 123-4567</div>
              <div><FaMapMarkerAlt style={{marginRight: 8}}/>San Francisco, CA</div>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} SentientAI Inc. All rights reserved.</p>
          <div className="footer-links">
            <Link to="#">Privacy Policy</Link>
            <Link to="#">Terms of Service</Link>
            <Link to="#">Cookie Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
