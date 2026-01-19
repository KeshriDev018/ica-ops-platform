import { useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import { FloatCard3D, RotateCard3D, ScaleCard3D, FlipCard3D, GlowPulseCard3D, BounceCard3D } from '../../components/3d/CardHoverEffects'
import WatermarkBackground from '../../components/common/WatermarkBackground'

const LandingPage = () => {
  const [openFaq, setOpenFaq] = useState(null)

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  return (
    <div className="min-h-screen bg-white relative">
      {/* 3D Watermark Background */}
      <WatermarkBackground />
      
      {/* Navigation Bar */}
      <nav className="bg-navy text-white py-4 px-6 lg:px-12">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img 
              src="/LOGO.png" 
              alt="Indian Chess Academy Logo" 
              className="h-[128px] w-auto"
            />
            <span className="text-xl font-secondary font-bold">Indian Chess Academy</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#about" className="hover:text-orange transition-colors">About</a>
            <a href="#programs" className="hover:text-orange transition-colors">Programs</a>
            <a href="#coaches" className="hover:text-orange transition-colors">Coaches</a>
            <a href="#testimonials" className="hover:text-orange transition-colors">Testimonials</a>
            <a href="#faq" className="hover:text-orange transition-colors">FAQ</a>
            <Link to="/login">
              <Button variant="secondary" size="sm">Login</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="py-16 lg:py-24 px-6 lg:px-12 bg-cream relative overflow-hidden">
        <div className="container mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10">
            <div className="relative">
              {/* Chess piece watermark effect */}
              <div className="absolute -top-10 -left-10 text-navy/5 text-9xl font-bold z-0">♟</div>
              <div className="relative z-10">
                <h1 className="text-5xl lg:text-6xl font-secondary font-bold text-navy mb-6">
                  Think. Plan. Triumph.
                </h1>
                <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                  Build smart minds and master the game of strategy through expert chess coaching rooted in Indian heritage. Unlock your full potential with our personalized programs.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/book-demo">
                    <Button variant="secondary" size="lg">Book a Free Demo</Button>
                  </Link>
                  <a href="#programs" className="inline-block">
                    <Button variant="outline" size="lg">Explore Programs</Button>
                  </a>
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <img 
                src="/main.png" 
                alt="Coach teaching children at Indian Chess Academy" 
                className="w-full max-w-lg h-[500px] rounded-card shadow-medium object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 px-6 lg:px-12 bg-cream relative z-10">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-secondary font-bold text-navy text-center mb-12">
            About Indian Chess Academy
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FloatCard3D floatHeight={25}>
              <Card className="text-center">
                <div className="w-16 h-16 bg-navy/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🧠</span>
                </div>
                <h3 className="text-lg font-secondary font-semibold text-navy mb-2">Cognitive Development</h3>
                <p className="text-gray-700 text-sm">Enhance memory, concentration, and analytical thinking skills.</p>
              </Card>
            </FloatCard3D>
            <FloatCard3D floatHeight={25}>
              <Card className="text-center">
                <div className="w-16 h-16 bg-navy/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">♚</span>
                </div>
                <h3 className="text-lg font-secondary font-semibold text-navy mb-2">Expert Training</h3>
                <p className="text-gray-700 text-sm">Learn from FIDE-rated Grandmasters and certified coaches.</p>
              </Card>
            </FloatCard3D>
            <FloatCard3D floatHeight={25}>
              <Card className="text-center">
              <div className="w-16 h-16 bg-navy/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🏆</span>
              </div>
              <h3 className="text-lg font-secondary font-semibold text-navy mb-2">Competition Ready</h3>
              <p className="text-gray-700 text-sm">Prepare for tournaments with strategic training and practice.</p>
              </Card>
            </FloatCard3D>
            <FloatCard3D floatHeight={25}>
              <Card className="text-center">
                <div className="w-16 h-16 bg-navy/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🇮🇳</span>
                </div>
                <h3 className="text-lg font-secondary font-semibold text-navy mb-2">Indian Heritage</h3>
                <p className="text-gray-700 text-sm">Connect with the rich tradition of chess in India.</p>
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
              { icon: '🧠', title: 'Holistic Development', desc: 'Build problem-solving skills, memory, and creativity' },
              { icon: '♚', title: 'Expert Coaching', desc: 'Learn from Grandmasters and FIDE-rated professionals' },
              { icon: '🌍', title: 'Cultural Immersion', desc: 'Embrace Indian chess heritage and traditions' },
              { icon: '📚', title: 'Structured Curriculum', desc: 'Progressive learning path for all skill levels' },
              { icon: '🎯', title: 'Personalized Attention', desc: 'Tailored approach to individual learning needs' },
              { icon: '🏅', title: 'Achievement Focused', desc: 'Track progress with clear milestones and goals' }
            ].map((item, idx) => (
              <RotateCard3D key={idx}>
                <Card className="bg-white text-center">
                  <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl">{item.icon}</span>
                  </div>
                  <h3 className="text-lg font-secondary font-semibold text-navy mb-2">{item.title}</h3>
                  <p className="text-gray-700 text-sm">{item.desc}</p>
                </Card>
              </RotateCard3D>
            ))}
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section id="programs" className="py-16 px-6 lg:px-12 bg-cream relative z-10">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-4xl font-secondary font-bold text-navy text-center mb-12">
            Our Programs
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* 1-on-1 Coaching */}
            <GlowPulseCard3D>
              <Card className="p-0 overflow-hidden border-none">
              {/* Header Section - Orange background with white text */}
              <div className="bg-orange text-white p-6">
                <h3 className="text-2xl font-primary font-bold mb-2">
                  1-on-1 Coaching
                </h3>
                <p className="text-white/90 text-sm mb-4">Personalized attention for rapid progress</p>
                <div className="text-5xl font-bold">₹2,999<span className="text-2xl font-normal">/month</span></div>
              </div>
              {/* Features Section - White background with dark text */}
              <div className="bg-white p-6">
                <ul className="space-y-3 mb-6 text-gray-800">
                  <li className="flex items-start">
                    <span className="text-olive mr-2 font-bold text-lg">✓</span>
                    <span>8 personalized sessions per month</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-olive mr-2 font-bold text-lg">✓</span>
                    <span>Customized learning plan</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-olive mr-2 font-bold text-lg">✓</span>
                    <span>Dedicated coach assignment</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-olive mr-2 font-bold text-lg">✓</span>
                    <span>Flexible scheduling</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-olive mr-2 font-bold text-lg">✓</span>
                    <span>Progress tracking & reports</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-olive mr-2 font-bold text-lg">✓</span>
                    <span>Tournament preparation</span>
                  </li>
                </ul>
                <button className="w-full bg-orange text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity shadow-soft">
                  Start Learning
                </button>
              </div>
              </Card>
            </GlowPulseCard3D>

            {/* Group Coaching */}
            <GlowPulseCard3D>
              <Card className="p-0 overflow-hidden border-none">
              {/* Header Section - Olive green background with white text */}
              <div className="bg-olive text-white p-6">
                <h3 className="text-2xl font-primary font-bold mb-2">
                  Group Coaching
                </h3>
                <p className="text-white/90 text-sm mb-4">Learn together, grow together</p>
                <div className="text-5xl font-bold">₹1,499<span className="text-2xl font-normal">/month</span></div>
              </div>
              {/* Features Section - White background with dark text */}
              <div className="bg-white p-6">
                <ul className="space-y-3 mb-6 text-gray-800">
                  <li className="flex items-start">
                    <span className="text-olive mr-2 font-bold text-lg">✓</span>
                    <span>12 group sessions per month</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-olive mr-2 font-bold text-lg">✓</span>
                    <span>Small batches (max 6 students)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-olive mr-2 font-bold text-lg">✓</span>
                    <span>Age & skill-based grouping</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-olive mr-2 font-bold text-lg">✓</span>
                    <span>Interactive learning environment</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-olive mr-2 font-bold text-lg">✓</span>
                    <span>Peer learning & practice games</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-olive mr-2 font-bold text-lg">✓</span>
                    <span>Monthly tournaments</span>
                  </li>
                </ul>
                <button className="w-full bg-olive text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity shadow-soft">
                  Join Group
                </button>
              </div>
              </Card>
            </GlowPulseCard3D>
          </div>
        </div>
      </section>

      {/* How Demo Works */}
      <section className="py-16 px-6 lg:px-12 bg-cream">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-4xl font-secondary font-bold text-navy text-center mb-4">
            How Your Free Demo Works
          </h2>
          <div className="relative flex flex-col md:flex-row items-center justify-center gap-8 mb-8">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center flex-1 relative">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4 text-2xl font-bold text-white relative z-10" style={{ backgroundColor: '#FC8A24' }}>
                1
              </div>
              <h3 className="text-lg font-secondary font-semibold text-navy mb-2">Book Your Slot</h3>
              <p className="text-gray-700 text-sm">Schedule your free demo class at your convenience</p>
            </div>
            
            {/* Connector Line */}
            <div className="hidden md:block absolute top-10 left-1/4 right-1/4 h-0.5 bg-gray-300"></div>
            
            {/* Step 2 */}
            <div className="flex flex-col items-center text-center flex-1 relative">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4 text-2xl font-bold text-white relative z-10" style={{ backgroundColor: '#6B8E23' }}>
                2
              </div>
              <h3 className="text-lg font-secondary font-semibold text-navy mb-2">Meet Your Coach</h3>
              <p className="text-gray-700 text-sm">Experience our teaching methodology firsthand</p>
            </div>
            
            {/* Connector Line */}
            <div className="hidden md:block absolute top-10 left-1/2 right-1/4 h-0.5 bg-gray-300"></div>
            
            {/* Step 3 */}
            <div className="flex flex-col items-center text-center flex-1 relative">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4 text-2xl font-bold text-white relative z-10" style={{ backgroundColor: '#FC8A24' }}>
                3
              </div>
              <h3 className="text-lg font-secondary font-semibold text-navy mb-2">Start Learning</h3>
              <p className="text-gray-700 text-sm">Begin your chess journey with personalized guidance</p>
            </div>
          </div>
          <div className="text-center">
            <Link to="/book-demo">
              <Button variant="secondary" size="lg">Book Your Free Demo</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Meet Our Coaches */}
      <section id="coaches" className="py-16 px-6 lg:px-12 bg-cream">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-4xl font-secondary font-bold text-navy text-center mb-4">
            Our Expert Coaches
          </h2>
          <p className="text-center text-gray-700 mb-12 max-w-2xl mx-auto">
            Our team comprises FIDE-rated coaches, Grandmasters, and seasoned educators dedicated to nurturing champions.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
              <Card className="text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-gray-400">GM</span>
                </div>
                <h3 className="text-xl font-secondary font-bold text-navy mb-1">GM Rahul Sharma</h3>
                <p className="text-orange mb-3">Grandmaster, Head Coach</p>
                <p className="text-gray-700 text-sm">Experienced Grandmaster with over 15 years of coaching expertise.</p>
              </Card>
              <Card className="text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-gray-400">WFM</span>
                </div>
                <h3 className="text-xl font-secondary font-bold text-navy mb-1">WFM Priya Singh</h3>
                <p className="text-orange mb-3">FIDE Master, Senior Coach</p>
                <p className="text-gray-700 text-sm">Dedicated to developing young talent with personalized attention.</p>
              </Card>
              <Card className="text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-gray-400">FM</span>
              </div>
              <h3 className="text-xl font-secondary font-bold text-navy mb-1">FM Anil Kumar</h3>
              <p className="text-orange mb-3">FIDE Master, Junior Coach</p>
              <p className="text-gray-700 text-sm">Passionate about making chess accessible to all age groups.</p>
              </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-16 px-6 lg:px-12 bg-cream">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-secondary font-bold text-navy text-center mb-4">
            What Parents & Students Say
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { quote: "Indian Chess Academy has transformed my son's logical thinking. He is more focused and confident now!", author: "Deepika Sharma", role: "Parent of Rohan" },
              { quote: "I've improved my rating significantly since joining. The personalized game analysis is simply invaluable!", author: "Aryan Mehta", role: "Advanced Student" },
              { quote: "The coaches are patient and encouraging. My daughter loves her classes and looks forward to each session!", author: "Rajesh Patel", role: "Parent of Ananya" }
            ].map((testimonial, idx) => (
                <Card key={idx} className="transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-orange text-xl">★</span>
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 italic">"{testimonial.quote}"</p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
                    <div>
                      <p className="font-semibold text-navy">{testimonial.author}</p>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                    </div>
                  </div>
                </Card>
            ))}
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
              { number: '2000+', label: 'Happy Students' },
              { number: '25+', label: 'Certified Coaches' },
              { number: '95%', label: 'Success Rate' },
              { number: '500+', label: 'Tournaments Won' }
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-5xl font-bold text-orange mb-2">{stat.number}</div>
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
              { q: "What is the age limit for enrollment?", a: "We welcome students from as young as 6 years old, all the way up to adults. Our programs are designed to cater to various age groups and skill levels." },
              { q: "Do you offer trial classes?", a: "Yes, we offer free demo classes for all new students. Book a slot to experience our teaching methodology." },
              { q: "What software or tools are required?", a: "You'll need a computer or tablet with internet connection. We'll provide access to our online chess platform and learning resources." },
              { q: "How do you track student progress?", a: "We use a comprehensive tracking system that includes regular assessments, game analysis, and progress reports shared with parents." }
            ].map((faq, index) => (
              <FloatCard3D key={index} floatHeight={10}>
                <Card className="cursor-pointer hover:shadow-medium transition-shadow" onClick={() => toggleFaq(index)}>
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-navy">{faq.q}</h3>
                    <span className="text-navy text-xl">{openFaq === index ? '▲' : '▼'}</span>
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
            Book a free demo class today and unlock your strategic potential. Let us help you master the game and sharpen your mind.
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
                <span className="text-xl font-secondary font-bold">Indian Chess Academy</span>
              </div>
              <p className="text-gray-300 text-sm">© 2024 Indian Chess Academy. All rights reserved.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li><a href="#about" className="hover:text-orange transition-colors">About</a></li>
                <li><a href="#programs" className="hover:text-orange transition-colors">Programs</a></li>
                <li><a href="#coaches" className="hover:text-orange transition-colors">Coaches</a></li>
                <li><a href="#faq" className="hover:text-orange transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li><a href="#" className="hover:text-orange transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-orange transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-orange transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <div className="flex space-x-4">
                <span className="cursor-pointer hover:text-orange transition-colors text-xl">📘</span>
                <span className="cursor-pointer hover:text-orange transition-colors text-xl">🐦</span>
                <span className="cursor-pointer hover:text-orange transition-colors text-xl">📷</span>
                <span className="cursor-pointer hover:text-orange transition-colors text-xl">💼</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
