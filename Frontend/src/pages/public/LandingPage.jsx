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
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const sliderImages = [
    "/Chess/1.jpg",
    "/Chess/2.jpg",
    "/Chess/3.jpg",
    "/Chess/4.jpg",
    "/Chess/5.jpg",
    "/Chess/6.jpg",
    "/Chess/7.jpg",
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(timer);
  }, []);

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

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div className="min-h-screen bg-white relative">
      {/* CSS for zoom animation */}
      <style>
        {`
          @keyframes zoomIn {
            0% {
              transform: scale(1);
            }
            100% {
              transform: scale(1.1);
            }
          }
          .zoom-animation {
            animation: zoomIn 4s ease-out forwards;
          }
        `}
      </style>
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
        {/* Image Slider */}
        <div className="absolute inset-0 bg-navy">
          {sliderImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? "opacity-100" : "opacity-0"
              }`}
            >
              <img
                src={image}
                alt={`Chess Academy ${index + 1}`}
                className={`w-full h-full object-cover ${
                  index === currentSlide ? "zoom-animation" : ""
                }`}
                onError={(e) => {
                  console.log("Image failed to load:", image);
                  e.target.style.display = "none";
                }}
              />
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
          ))}
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

            {/* Slider Dots */}
            <div className="flex gap-3 justify-center">
              {sliderImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentSlide
                      ? "bg-orange w-8"
                      : "bg-white/50 hover:bg-white/80"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
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
            {/* Abhinva Verma */}
            <Card className="text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <img
                src="/Developers/Abhinav.jpeg"
                alt="Abhinva Verma"
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-navy/10"
              />
              <h3 className="text-xl font-secondary font-bold text-navy mb-1">
                Abhinva Verma
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
