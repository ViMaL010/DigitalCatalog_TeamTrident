import { Button } from '@/components/ui/button';
import { Mic, Users, Share2, Download, ArrowRight, CheckCircle, Sparkles, Zap, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import heroImage from '@/assets/hero-voice-catalog.jpg';

export default function Landing() {
  const features = [
    {
      icon: <Mic className="w-8 h-8 text-primary animate-pulse" />,
      title: "Speak Naturally",
      description: "Just describe your products in any language - our AI listens and understands",
      bgGradient: "from-blue-50 to-indigo-50"
    },
    {
      icon: <Sparkles className="w-8 h-8 text-primary" />,
      title: "AI Magic",
      description: "Watch as AI transforms your words into professional product listings instantly",
      bgGradient: "from-purple-50 to-pink-50"
    },
    {
      icon: <Globe className="w-8 h-8 text-primary" />,
      title: "Share Everywhere",
      description: "Export to WhatsApp, PDF, or upload to marketplaces with one click",
      bgGradient: "from-green-50 to-emerald-50"
    }
  ];

  const benefits = [
    "No typing required - just speak naturally",
    "Works in local languages",
    "Professional product descriptions",
    "Export to multiple platforms",
    "Mobile-first design",
    "Free to start"
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Mic className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">CatalogAI</span>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
              How it Works
            </a>
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="outline" size="sm">Login</Button>
            </Link>
            <Link to="/auth">
              <Button variant="hero" size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-slide-up">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                  Create Your Product Catalog by 
                  <span className="text-primary"> Speaking</span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Perfect for farmers, artisans, and shopkeepers. Transform your voice into professional product listings with AI.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/auth">
                  <Button variant="hero" size="lg" className="w-full sm:w-auto">
                    <Mic className="w-5 h-5" />
                    Start Speaking Now
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Watch Demo
                </Button>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <CheckCircle className="w-5 h-5 text-success" />
                <span>Free to start • No credit card required</span>
              </div>
            </div>

            <div className="animate-fade-in">
              <div className="relative group">
                <img 
                  src={heroImage} 
                  alt="Voice catalog creation" 
                  className="w-full h-auto rounded-2xl shadow-elevated group-hover:shadow-2xl transition-shadow duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent rounded-2xl"></div>
                
                {/* Floating elements for visual appeal */}
                <div className="absolute top-4 right-4 w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur rounded-lg p-3 shadow-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-medium">AI Processing...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 bg-muted">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground">
              Three simple steps to create your professional catalog
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center space-y-4 animate-slide-up hover:scale-105 transition-transform duration-300" style={{ animationDelay: `${index * 0.2}s` }}>
                <div className={`w-20 h-20 bg-gradient-to-br ${feature.bgGradient} rounded-3xl flex items-center justify-center mx-auto shadow-elevated relative overflow-hidden group`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  {feature.icon}
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Why Choose CatalogAI?
            </h2>
            <p className="text-xl text-muted-foreground">
              Built specifically for small businesses and entrepreneurs
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-3 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                <span className="text-foreground">{benefit}</span>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/auth">
              <Button variant="hero" size="lg">
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <div className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center">
                <Mic className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground">CatalogAI</span>
            </div>
            <p className="text-muted-foreground">
              Empowering small businesses with AI-powered catalog creation
            </p>
            <div className="flex justify-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="hover:text-foreground transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}