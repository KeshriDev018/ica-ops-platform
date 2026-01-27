import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import {
  FloatCard3D,
  RotateCard3D,
  ScaleCard3D,
  FlipCard3D,
  GlowPulseCard3D,
  BounceCard3D,
} from "../../components/3d/CardHoverEffects";
import WatermarkBackground from "../../components/common/WatermarkBackground";

const LandingPage = () => {
  const [openFaq, setOpenFaq] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-white relative">
      {/* 3D Watermark Background */}
      <WatermarkBackground />

      {/* Navigation Bar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 text-white py-2 px-6 lg:px-12 transition-all duration-300 ${
          isScrolled ? "bg-navy shadow-lg" : "bg-transparent"
        }`}
      >
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img
              src="/LOGO.png"
              alt="Indian Chess Academy Logo"
              className="h-16 w-auto"
            />
            <span className="text-lg font-secondary font-bold">
              Indian Chess Academy
            </span>
          </div>
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <a
              href="#about"
              className="hover:text-orange transition-colors text-sm"
            >
              About
            </a>
            <a
              href="#programs"
              className="hover:text-orange transition-colors text-sm"
            >
              Programs
            </a>
            <a
              href="#coaches"
              className="hover:text-orange transition-colors text-sm"
            >
              Coaches
            </a>
            <a
              href="#testimonials"
              className="hover:text-orange transition-colors text-sm"
            >
              Testimonials
            </a>
            <a
              href="#faq"
              className="hover:text-orange transition-colors text-sm"
            >
              FAQ
            </a>
            <Link to="/login">
              <Button variant="secondary" size="sm">
                Login
              </Button>
            </Link>
          </div>
          {/* Burger Icon for Mobile */}
          <button
            className="md:hidden flex flex-col justify-center items-center w-10 h-10 focus:outline-none"
            aria-label="Open menu"
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            <span
              className={`block w-6 h-0.5 bg-white mb-1 transition-all duration-300 ${mobileMenuOpen ? "rotate-45 translate-y-2" : ""}`}
            ></span>
            <span
              className={`block w-6 h-0.5 bg-white mb-1 transition-all duration-300 ${mobileMenuOpen ? "opacity-0" : ""}`}
            ></span>
            <span
              className={`block w-6 h-0.5 bg-white transition-all duration-300 ${mobileMenuOpen ? "-rotate-45 -translate-y-2" : ""}`}
            ></span>
          </button>
        </div>
        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/60 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          ></div>
        )}
        {/* Mobile Menu Drawer */}
        <div
          className={`fixed top-0 right-0 z-50 w-64 h-full bg-navy shadow-lg transform transition-transform duration-300 md:hidden ${mobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
            <span className="text-lg font-secondary font-bold">Menu</span>
            <button
              className="text-white text-2xl focus:outline-none"
              aria-label="Close menu"
              onClick={() => setMobileMenuOpen(false)}
            >
              ×
            </button>
          </div>
          <div className="flex flex-col space-y-6 px-6 py-8">
            <a
              href="#about"
              className="hover:text-orange transition-colors text-base"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </a>
            <a
              href="#programs"
              className="hover:text-orange transition-colors text-base"
              onClick={() => setMobileMenuOpen(false)}
            >
              Programs
            </a>
            <a
              href="#coaches"
              className="hover:text-orange transition-colors text-base"
              onClick={() => setMobileMenuOpen(false)}
            >
              Coaches
            </a>
            <a
              href="#testimonials"
              className="hover:text-orange transition-colors text-base"
              onClick={() => setMobileMenuOpen(false)}
            >
              Testimonials
            </a>
            <a
              href="#faq"
              className="hover:text-orange transition-colors text-base"
              onClick={() => setMobileMenuOpen(false)}
            >
              FAQ
            </a>
            <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="secondary" size="md" className="w-full">
                Login
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative h-screen overflow-hidden mb-0">
        {/* Background Video */}
        <div className="absolute inset-0 bg-navy">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
            poster="/Chess/1.jpg"
          >
            <source src="/Chess/video.mp4" type="video/mp4" />
            {/* Fallback image if video doesn't load */}
            <img
              src="/Chess/1.jpg"
              alt="Chess Academy"
              className="w-full h-full object-cover"
            />
          </video>
          {/* Enhanced Smokey Effect with Multiple Layers */}
          <div className="absolute inset-0 bg-gradient-to-br from-navy/60 via-navy/40 to-orange/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
          <div className="absolute inset-0 backdrop-blur-[1px]" />
          {/* Vignette Effect */}
          <div
            className="absolute inset-0 bg-radial-gradient"
            style={{
              background:
                "radial-gradient(circle, transparent 40%, rgba(0,0,0,0.4) 100%)",
            }}
          />
        </div>

        {/* Center Content */}
        <div className="relative z-10 h-full flex items-center justify-center px-6 lg:px-12">
          <div className="text-center max-w-4xl">
            {/* Chess piece decoration */}
            <div className="text-white/10 text-9xl mb-4 animate-pulse">♟</div>

            <h1 className="text-5xl lg:text-7xl font-secondary font-bold text-white mb-6 leading-tight">
              Think. Plan. Triumph.
            </h1>

            <p className="text-xl lg:text-2xl text-cream mb-8 leading-relaxed max-w-3xl mx-auto">
              Build smart minds and master the game of strategy through expert
              chess coaching rooted in Indian heritage. Unlock your full
              potential with our personalized programs.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link to="/book-demo">
                <Button variant="secondary" size="lg">
                  Book a Free Demo
                </Button>
              </Link>
              <a href="#programs" className="inline-block">
                <button className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-navy transition-all duration-300">
                  Explore Programs
                </button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section
        id="about"
        className="py-16 px-6 lg:px-12 bg-cream relative z-10"
      >
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-secondary font-bold text-navy text-center mb-12">
            About Indian Chess Academy
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FloatCard3D floatHeight={25}>
              <Card className="text-center h-full flex flex-col">
                <div className="w-16 h-16 bg-navy/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🧠</span>
                </div>
                <h3 className="text-lg font-secondary font-semibold text-navy mb-2">
                  Cognitive Development
                </h3>
                <p className="text-gray-700 text-sm flex-grow">
                  Enhance memory, concentration, and analytical thinking skills.
                </p>
              </Card>
            </FloatCard3D>
            <FloatCard3D floatHeight={25}>
              <Card className="text-center h-full flex flex-col">
                <div className="w-16 h-16 bg-navy/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">♚</span>
                </div>
                <h3 className="text-lg font-secondary font-semibold text-navy mb-2">
                  Expert Training
                </h3>
                <p className="text-gray-700 text-sm flex-grow">
                  Learn from FIDE-rated Grandmasters and certified coaches.
                </p>
              </Card>
            </FloatCard3D>
            <FloatCard3D floatHeight={25}>
              <Card className="text-center h-full flex flex-col">
                <div className="w-16 h-16 bg-navy/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🏆</span>
                </div>
                <h3 className="text-lg font-secondary font-semibold text-navy mb-2">
                  Competition Ready
                </h3>
                <p className="text-gray-700 text-sm flex-grow">
                  Prepare for tournaments with strategic training and practice.
                </p>
              </Card>
            </FloatCard3D>
            <FloatCard3D floatHeight={25}>
              <Card className="text-center h-full flex flex-col">
                <div className="w-16 h-16 bg-navy/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🇮🇳</span>
                </div>
                <h3 className="text-lg font-secondary font-semibold text-navy mb-2">
                  Indian Heritage
                </h3>
                <p className="text-gray-700 text-sm flex-grow">
                  Connect with the rich tradition of chess in India.
                </p>
              </Card>
            </FloatCard3D>
          </div>
        </div>
      </section>

      {/* Motivational Section */}
      <section className="relative h-screen overflow-hidden">
        {/* Full Screen Background Image */}
        <div className="absolute inset-0 bg-navy">
          <img
            src="/Chess/Motivation.jpg"
            alt="Motivational Chess Stories"
            className="w-full h-full object-cover"
          />
          {/* Enhanced Overlay Effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-navy/70 via-navy/50 to-orange/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
          <div className="absolute inset-0 backdrop-blur-[0.5px]" />
          {/* Vignette Effect */}
          <div
            className="absolute inset-0 bg-radial-gradient"
            style={{
              background:
                "radial-gradient(circle, transparent 30%, rgba(0,0,0,0.5) 100%)",
            }}
          />
        </div>

        {/* Chess Piece Decorations */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-10 text-white/10 text-6xl animate-pulse">
            ♟
          </div>
          <div className="absolute top-20 right-20 text-white/10 text-4xl animate-pulse delay-1000">
            ♚
          </div>
          <div className="absolute bottom-20 left-1/4 text-white/10 text-5xl animate-pulse delay-500">
            ♛
          </div>
          <div className="absolute bottom-10 right-10 text-white/10 text-3xl animate-pulse delay-1500">
            ♜
          </div>
        </div>

        {/* Center Content */}
        <div className="relative z-10 h-full flex items-center justify-center px-4 md:px-6 lg:px-12">
          <div className="text-center max-w-4xl">
            {/* Inspiration Badge */}
            <div className="inline-flex items-center space-x-2 bg-orange/20 backdrop-blur-sm px-4 md:px-6 py-2 md:py-3 rounded-full mb-6 md:mb-8 border border-white/20">
              <span className="text-2xl md:text-3xl">🎯</span>
              <span className="text-white font-semibold text-base md:text-lg">
                INSPIRATION
              </span>
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-secondary font-bold text-white mb-4 md:mb-6 leading-tight">
              Ignite Your
              <span className="block text-orange">Chess Passion</span>
            </h2>

            <p className="text-lg md:text-xl lg:text-2xl text-cream mb-6 md:mb-8 leading-relaxed max-w-3xl mx-auto px-2 md:px-0">
              Watch real stories of transformation. See how ordinary students
              become extraordinary chess masters through dedication, strategy,
              and the timeless wisdom of the game.
            </p>

            {/* Floating Action Elements */}
            <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 space-x-0 sm:space-x-6 mb-8 md:mb-12">
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-3 md:px-4 py-2 rounded-full animate-pulse">
                <span className="text-xl md:text-2xl">🔥</span>
                <span className="text-white font-semibold text-sm md:text-base">
                  Real Stories
                </span>
              </div>
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-3 md:px-4 py-2 rounded-full animate-pulse">
                <span className="text-xl md:text-2xl">💪</span>
                <span className="text-white font-semibold text-sm md:text-base">
                  Life Skills
                </span>
              </div>
            </div>

            {/* Inspirational Quote */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 md:p-6 max-w-2xl mx-auto border border-white/20">
              <p className="text-cream font-semibold italic text-base md:text-lg leading-relaxed">
                "Chess is not just a game. It's a way of life that teaches us
                patience, strategy, and the beauty of thinking ahead."
              </p>
              <p className="text-orange text-xs md:text-sm mt-3 md:mt-4 font-medium">
                - Viraj Pandit, Founder
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Learn Chess Section */}
      <section className="py-16 px-6 lg:px-12 bg-navy relative z-10">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-secondary font-bold text-white text-center mb-12">
            Why Learn Chess Here
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: "🧠",
                title: "Holistic Development",
                desc: "Build problem-solving skills, memory, and creativity",
              },
              {
                icon: "♚",
                title: "Expert Coaching",
                desc: "Learn from Grandmasters and FIDE-rated professionals",
              },
              {
                icon: "🌍",
                title: "Cultural Immersion",
                desc: "Embrace Indian chess heritage and traditions",
              },
              {
                icon: "📚",
                title: "Structured Curriculum",
                desc: "Progressive learning path for all skill levels",
              },
              {
                icon: "🎯",
                title: "Personalized Attention",
                desc: "Tailored approach to individual learning needs",
              },
              {
                icon: "🏅",
                title: "Achievement Focused",
                desc: "Track progress with clear milestones and goals",
              },
            ].map((item, idx) => (
              <RotateCard3D key={idx}>
                <Card className="bg-white text-center">
                  <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl">{item.icon}</span>
                  </div>
                  <h3 className="text-lg font-secondary font-semibold text-navy mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-700 text-sm">{item.desc}</p>
                </Card>
              </RotateCard3D>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 px-4 md:px-6 lg:px-12 bg-orange relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 text-6xl">♟</div>
          <div className="absolute top-20 right-20 text-4xl">♚</div>
          <div className="absolute bottom-20 left-1/4 text-5xl">♛</div>
          <div className="absolute bottom-10 right-10 text-3xl">♜</div>
        </div>

        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Video Content */}
            <div className="order-2 lg:order-1">
              <div className="relative">
                {/* Video Container */}
                <div className="relative max-w-sm md:max-w-md mx-auto lg:mx-0">
                  {/* Video Player */}
                  <div className="relative bg-black rounded-lg overflow-hidden aspect-[4/5] shadow-2xl">
                    <video
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="w-full h-full object-cover"
                      poster="/Chess/Motivation.jpg"
                    >
                      <source src="/Chess/Motivation.mp4" type="video/mp4" />
                      {/* Fallback content */}
                      <div className="w-full h-full bg-gradient-to-br from-navy to-orange flex items-center justify-center">
                        <div className="text-center text-white">
                          <div className="text-3xl mb-4">🎥</div>
                          <p className="text-sm">Motivational Video</p>
                        </div>
                      </div>
                    </video>

                    {/* Video Controls Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4">
                      <div className="flex items-center justify-between text-white">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                          <span className="text-xs font-medium">LIVE</span>
                        </div>
                        <div className="text-xs opacity-75">
                          Motivational Stories
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Floating Elements */}
                  <div className="absolute -top-3 -right-3 md:-top-4 md:-right-4 w-6 h-6 md:w-8 md:h-8 bg-orange rounded-full flex items-center justify-center text-white text-xs md:text-sm font-bold shadow-lg animate-bounce">
                    🔥
                  </div>
                  <div className="absolute -bottom-3 -left-3 md:-bottom-4 md:-left-4 w-6 h-6 md:w-8 md:h-8 bg-navy rounded-full flex items-center justify-center text-white text-xs md:text-sm font-bold shadow-lg animate-pulse">
                    💪
                  </div>
                </div>
              </div>
            </div>

            {/* Text Content */}
            <div className="order-1 lg:order-2 text-center lg:text-left">
              <div className="space-y-4 md:space-y-6">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-secondary font-bold text-white leading-tight">
                  Real Stories of
                  <span className="block text-white">Transformation</span>
                </h2>

                <p className="text-base md:text-lg text-white leading-relaxed max-w-lg mx-auto lg:mx-0 px-2 md:px-0">
                  Watch inspiring journeys of students who turned their chess
                  dreams into reality. From beginners to champions, see how
                  dedication and expert guidance create extraordinary results.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center lg:justify-start px-4 md:px-0">
                  <div className="bg-white/90 backdrop-blur-sm rounded-lg md:rounded-xl p-3 md:p-4 shadow-lg border border-orange/20">
                    <div className="flex items-center space-x-2 md:space-x-3">
                      <div className="w-8 h-8 md:w-10 md:h-10 bg-orange rounded-full flex items-center justify-center">
                        <span className="text-white text-sm md:text-lg">
                          ⭐
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-navy text-sm md:text-base">
                          Success Stories
                        </p>
                        <p className="text-xs md:text-sm text-gray-600">
                          Real student journeys
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/90 backdrop-blur-sm rounded-lg md:rounded-xl p-3 md:p-4 shadow-lg border border-navy/20">
                    <div className="flex items-center space-x-2 md:space-x-3">
                      <div className="w-8 h-8 md:w-10 md:h-10 bg-navy rounded-full flex items-center justify-center">
                        <span className="text-white text-sm md:text-lg">
                          🎯
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-navy text-sm md:text-base">
                          Life-Changing Impact
                        </p>
                        <p className="text-xs md:text-sm text-gray-600">
                          Beyond the chessboard
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 md:pt-4 px-4 md:px-0">
                  <p className="text-navy font-semibold italic text-sm md:text-base leading-relaxed">
                    "Every champion was once a beginner who refused to give up."
                  </p>
                  <p className="text-gray-600 text-xs md:text-sm mt-2">
                    - Viraj Pandit, Founder
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Developers Section */}
      <section className="py-16 px-6 lg:px-12 bg-cream">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-secondary font-bold text-navy text-center mb-12">
            Meet the Developers
          </h2>
          <div className="grid md:grid-cols-4 sm:grid-cols-2 gap-8 mb-8">
            {/* Ankit Keshri */}
            <Card className="text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <img
                src="/Developers/Ankit.jpg"
                alt="Ankit Keshri"
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-navy/10"
              />
              <h3 className="text-xl font-secondary font-bold text-navy mb-1">
                Ankit Keshri
              </h3>
              <p className="text-sm text-gray-500 mb-1">IIIT Dharwad CSE</p>
              <p className="text-orange mb-2">Lead & Backend Developer</p>
              <p className="text-gray-700 text-sm mb-2">
                Team Lead, Node.js, Express, MongoDB
              </p>
            </Card>
            {/* Yogesh Gupta */}
            <Card className="text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <img
                src="/Developers/Yogesh.jpeg"
                alt="Yogesh Gupta"
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-navy/10"
              />
              <h3 className="text-xl font-secondary font-bold text-navy mb-1">
                Yogesh Gupta
              </h3>
              <p className="text-sm text-gray-500 mb-1">IIIT Dharwad CSE</p>
              <p className="text-orange mb-2">Frontend/UI UX</p>
              <p className="text-gray-700 text-sm mb-2">
                React, Tailwind CSS, UX Design
              </p>
            </Card>
            {/* Bhumica Jaiswal */}
            <Card className="text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <img
                src="/Developers/Bhumica.png"
                alt="Bhumica Jaiswal"
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-navy/10"
              />
              <h3 className="text-xl font-secondary font-bold text-navy mb-1">
                Bhumica Jaiswal
              </h3>
              <p className="text-sm text-gray-500 mb-1">IIIT Dharwad CSE</p>
              <p className="text-orange mb-2">Frontend/UI UX</p>
              <p className="text-gray-700 text-sm mb-2">
                React, UI/UX, Responsive Design
              </p>
            </Card>
            {/* Abhinav Verma */}
            <Card className="text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <img
                src="/Developers/Abhinav.png"
                alt="Abhinva Verma"
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-navy/10"
              />
              <h3 className="text-xl font-secondary font-bold text-navy mb-1">
                Abhinav Verma
              </h3>
              <p className="text-sm text-gray-500 mb-1">IIIT Dharwad CSE</p>
              <p className="text-orange mb-2">AI/ML Expert</p>
              <p className="text-gray-700 text-sm mb-2">
                AI Integrations, ML, Automation
              </p>
            </Card>
          </div>
          <div className="text-center mt-8">
            <p className="text-lg text-navy font-medium mb-2">
              If you find any issues, bugs, or want to request a feature,
              contact our developers team:
            </p>
            <p className="text-gray-700 text-base">
              Email:{" "}
              <a
                href="mailto:ankitkeshari550@gmail.com"
                className="text-orange underline"
              >
                ankitkeshari550@gmail.com
              </a>{" "}
              &nbsp;|&nbsp; Phone:{" "}
              <a href="tel:9693594630" className="text-orange underline">
                9693594630
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section id="programs" className="py-16 px-6 lg:px-12 bg-white">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-secondary font-bold text-navy text-center mb-12">
            Our Programs
          </h2>
          <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-8 mb-8">
            {/* Beginner Program */}
            <Card className="text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="w-16 h-16 bg-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">♙</span>
              </div>
              <h3 className="text-xl font-secondary font-bold text-navy mb-1">
                Beginner
              </h3>
              <p className="text-gray-700 text-sm mb-2">
                For new learners: rules, basic tactics, and fun activities to
                build a strong foundation.
              </p>
            </Card>
            {/* Intermediate Program */}
            <Card className="text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="w-16 h-16 bg-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">♘</span>
              </div>
              <h3 className="text-xl font-secondary font-bold text-navy mb-1">
                Intermediate
              </h3>
              <p className="text-gray-700 text-sm mb-2">
                Sharpen your skills: openings, strategies, and regular practice
                games with feedback.
              </p>
            </Card>
            {/* Advanced Program */}
            <Card className="text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="w-16 h-16 bg-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">♔</span>
              </div>
              <h3 className="text-xl font-secondary font-bold text-navy mb-1">
                Advanced
              </h3>
              <p className="text-gray-700 text-sm mb-2">
                Tournament prep: advanced tactics, endgames, analysis, and
                one-on-one coaching.
              </p>
            </Card>
          </div>
          <div className="text-center mt-8">
            <Link to="/book-demo">
              <Button variant="secondary" size="lg">
                Book a Free Demo for Programs
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Subscriptions Section */}
      <section id="subscriptions" className="py-16 px-6 lg:px-12 bg-cream">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl font-secondary font-bold text-navy text-center mb-12">
            Subscriptions
          </h2>
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* One-to-One Class Plan */}
            <Card className="text-center border-2 border-orange shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="w-16 h-16 bg-orange/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">👤</span>
              </div>
              <h3 className="text-xl font-secondary font-bold text-navy mb-1">
                One-to-One Class
              </h3>
              <p className="text-gray-700 text-base mb-2">
                Personalized coaching with a dedicated trainer for rapid
                progress.
              </p>
              <div className="text-2xl font-bold text-orange mb-2">
                ₹2999<span className="text-base font-normal">/month</span>
              </div>
            </Card>
            {/* Group Class Plan */}
            <Card className="text-center border-2 border-navy shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="w-16 h-16 bg-navy/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">👥</span>
              </div>
              <h3 className="text-xl font-secondary font-bold text-navy mb-1">
                Group Class
              </h3>
              <p className="text-gray-700 text-base mb-2">
                Collaborative learning in small groups, interactive sessions,
                and peer play.
              </p>
              <div className="text-2xl font-bold text-navy mb-2">
                ₹1499<span className="text-base font-normal">/month</span>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Coaches Section */}
      <section id="coaches" className="py-16 px-6 lg:px-12 bg-white">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-secondary font-bold text-navy text-center mb-12">
            Meet Our Expert Coaches
          </h2>
          <p className="text-lg text-gray-700 text-center mb-12 max-w-3xl mx-auto">
            Our certified coaches bring years of experience and passion for
            chess, helping students achieve their full potential through
            personalized guidance and strategic mentorship.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Coach 1 */}
            <FloatCard3D floatHeight={15}>
              <Card className="text-center overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="relative">
                  <img
                    src="/coaches/COACH1.png"
                    alt="Expert Chess Coach"
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-secondary font-bold text-white mb-1">
                      Grandmaster Arjun
                    </h3>
                    <p className="text-orange font-semibold text-sm">
                      FIDE Rated 2400+
                    </p>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-gray-700 mb-4">
                    Former National Champion with 15+ years of coaching
                    experience. Specializes in advanced tactics and tournament
                    preparation.
                  </p>
                  <div className="flex justify-center space-x-4 text-sm text-gray-600">
                    <span>🏆 50+ Tournaments</span>
                    <span>👥 200+ Students</span>
                  </div>
                </div>
              </Card>
            </FloatCard3D>

            {/* Coach 2 */}
            <FloatCard3D floatHeight={15}>
              <Card className="text-center overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="relative">
                  <img
                    src="/coaches/COACH2.png"
                    alt="Professional Chess Coach"
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-secondary font-bold text-white mb-1">
                      Coach Priya
                    </h3>
                    <p className="text-orange font-semibold text-sm">
                      FIDE Rated 2200+
                    </p>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-gray-700 mb-4">
                    International Women's Champion and youth development
                    specialist. Expert in beginner to intermediate level
                    coaching.
                  </p>
                  <div className="flex justify-center space-x-4 text-sm text-gray-600">
                    <span>👑 Women's Champion</span>
                    <span>🌟 150+ Students</span>
                  </div>
                </div>
              </Card>
            </FloatCard3D>

            {/* Coach 3 */}
            <FloatCard3D floatHeight={15}>
              <Card className="text-center overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="relative">
                  <img
                    src="/coaches/COACH3.png"
                    alt="Experienced Chess Coach"
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-secondary font-bold text-white mb-1">
                      Coach Ramesh
                    </h3>
                    <p className="text-orange font-semibold text-sm">
                      FIDE Rated 2100+
                    </p>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-gray-700 mb-4">
                    Chess education specialist with focus on fundamental
                    development and long-term player growth.
                  </p>
                  <div className="flex justify-center space-x-4 text-sm text-gray-600">
                    <span>📚 Education Expert</span>
                    <span>🎯 100+ Students</span>
                  </div>
                </div>
              </Card>
            </FloatCard3D>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-16 px-6 lg:px-12 bg-cream">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-secondary font-bold text-navy text-center mb-12">
            What Our Students & Parents Say
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Parent Testimonial 1 */}
            <FloatCard3D floatHeight={10}>
              <Card className="p-6 shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
                <div className="flex items-center mb-4">
                  <img
                    src="/Testimonials/PARENT1.png"
                    alt="Parent Testimonial"
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h4 className="font-semibold text-navy">Mrs. Sharma</h4>
                    <p className="text-sm text-gray-600">
                      Parent of Aryan (Age 12)
                    </p>
                  </div>
                </div>
                <div className="mb-4">
                  <div className="flex text-orange mb-2">{"★".repeat(5)}</div>
                  <p className="text-gray-700 italic">
                    "My son has improved tremendously under the guidance of
                    Coach Arjun. From struggling with basic moves to winning
                    local tournaments, the transformation has been incredible!"
                  </p>
                </div>
                <div className="text-sm text-gray-500">
                  ⭐ Improved from beginner to tournament winner in 8 months
                </div>
              </Card>
            </FloatCard3D>

            {/* Student Testimonial */}
            <FloatCard3D floatHeight={10}>
              <Card className="p-6 shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
                <div className="flex items-center mb-4">
                  <img
                    src="/Testimonials/STUDENT.png"
                    alt="Student Testimonial"
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h4 className="font-semibold text-navy">Rahul Kumar</h4>
                    <p className="text-sm text-gray-600">Student (Age 15)</p>
                  </div>
                </div>
                <div className="mb-4">
                  <div className="flex text-orange mb-2">{"★".repeat(5)}</div>
                  <p className="text-gray-700 italic">
                    "The coaching methodology is excellent. I love how they
                    break down complex strategies into simple concepts. My
                    rating has jumped from 1200 to 1800 in just 6 months!"
                  </p>
                </div>
                <div className="text-sm text-gray-500">
                  📈 Rating improvement: 1200 → 1800 (6 months)
                </div>
              </Card>
            </FloatCard3D>

            {/* Parent Testimonial 2 */}
            <FloatCard3D floatHeight={10}>
              <Card className="p-6 shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
                <div className="flex items-center mb-4">
                  <img
                    src="/Testimonials/PARENT2.png"
                    alt="Parent Testimonial"
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h4 className="font-semibold text-navy">Mr. Patel</h4>
                    <p className="text-sm text-gray-600">
                      Parent of Priya (Age 10)
                    </p>
                  </div>
                </div>
                <div className="mb-4">
                  <div className="flex text-orange mb-2">{"★".repeat(5)}</div>
                  <p className="text-gray-700 italic">
                    "Coach Priya has been amazing with my daughter. She not only
                    teaches chess but also builds confidence and strategic
                    thinking. The progress reports are detailed and helpful."
                  </p>
                </div>
                <div className="text-sm text-gray-500">
                  💪 Enhanced confidence and strategic thinking
                </div>
              </Card>
            </FloatCard3D>
          </div>
        </div>
      </section>

      {/* Impact Numbers */}
      <section className="py-16 px-6 lg:px-12 bg-navy">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-4xl font-secondary font-bold text-white text-center mb-12">
            Our Impact in Numbers
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { number: "2000+", label: "Happy Students" },
              { number: "25+", label: "Certified Coaches" },
              { number: "95%", label: "Success Rate" },
              { number: "500+", label: "Tournaments Won" },
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-5xl font-bold text-orange mb-2">
                  {stat.number}
                </div>
                <div className="text-lg text-white">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 px-6 lg:px-12 bg-cream">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl font-secondary font-bold text-navy text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[
              {
                q: "What is the age limit for enrollment?",
                a: "We welcome students from as young as 6 years old, all the way up to adults. Our programs are designed to cater to various age groups and skill levels.",
              },
              {
                q: "Do you offer trial classes?",
                a: "Yes, we offer free demo classes for all new students. Book a slot to experience our teaching methodology.",
              },
              {
                q: "What software or tools are required?",
                a: "You'll need a computer or tablet with internet connection. We'll provide access to our online chess platform and learning resources.",
              },
              {
                q: "How do you track student progress?",
                a: "We use a comprehensive tracking system that includes regular assessments, game analysis, and progress reports shared with parents.",
              },
            ].map((faq, index) => (
              <FloatCard3D key={index} floatHeight={10}>
                <Card
                  className="cursor-pointer hover:shadow-medium transition-shadow"
                  onClick={() => toggleFaq(index)}
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-navy">{faq.q}</h3>
                    <span className="text-navy text-xl">
                      {openFaq === index ? "▲" : "▼"}
                    </span>
                  </div>
                  {openFaq === index && (
                    <p className="mt-4 text-gray-700">{faq.a}</p>
                  )}
                </Card>
              </FloatCard3D>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 px-6 lg:px-12 bg-orange">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-4xl font-secondary font-bold text-white mb-4">
            Ready to Start Your Chess Journey?
          </h2>
          <p className="text-white/90 text-lg mb-8">
            Book a free demo class today and unlock your strategic potential.
            Let us help you master the game and sharpen your mind.
          </p>
          <Link to="/book-demo">
            <button className="bg-white text-orange px-8 py-4 rounded-lg font-medium text-lg hover:opacity-90 transition-opacity">
              Book Your Free Demo
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy text-white py-12 px-6 lg:px-12">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex items-center space-x-2 mb-4">
                  <img
                    src="/LOGO.png"
                    alt="Indian Chess Academy Logo"
                    className="h-[128px] w-32 object-contain"
                  />
                </div>
                <span className="text-xl font-secondary font-bold">
                  Indian Chess Academy
                </span>
              </div>
              <p className="text-gray-300 text-sm">
                © 2024 Indian Chess Academy. All rights reserved.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>
                  <a
                    href="#about"
                    className="hover:text-orange transition-colors"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#programs"
                    className="hover:text-orange transition-colors"
                  >
                    Programs
                  </a>
                </li>
                <li>
                  <a
                    href="#coaches"
                    className="hover:text-orange transition-colors"
                  >
                    Coaches
                  </a>
                </li>
                <li>
                  <a
                    href="#faq"
                    className="hover:text-orange transition-colors"
                  >
                    FAQ
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>
                  <a href="#" className="hover:text-orange transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-orange transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-orange transition-colors">
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <div className="flex space-x-4">
                <span className="cursor-pointer hover:text-orange transition-colors text-xl">
                  📘
                </span>
                <span className="cursor-pointer hover:text-orange transition-colors text-xl">
                  🐦
                </span>
                <span className="cursor-pointer hover:text-orange transition-colors text-xl">
                  📷
                </span>
                <span className="cursor-pointer hover:text-orange transition-colors text-xl">
                  💼
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
