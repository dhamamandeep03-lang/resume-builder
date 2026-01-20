import { Link } from "wouter";
import { motion } from "framer-motion";
import { CheckCircle, FileText, Download, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// Hero image from Unsplash
// HTML comment: Professional workspace with laptop and coffee
const HERO_IMAGE = "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?q=80&w=2072&auto=format&fit=crop";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Navbar */}
      <nav className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold font-serif">
              R
            </div>
            <span className="text-xl font-bold tracking-tight">ResuMake</span>
          </div>
          <a href="/api/login">
            <Button>Sign In</Button>
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-grow">
        <div className="relative overflow-hidden pt-16 pb-24 lg:pt-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 font-serif">
                  Craft Your Professional Story
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
                  Create stunning, ATS-friendly resumes in minutes. Our clean, professional templates help you stand out to recruiters and land your dream job.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <a href="/api/login" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full text-base font-semibold h-12 px-8 shadow-lg shadow-primary/20">
                      Create Resume Now
                    </Button>
                  </a>
                  <Button variant="outline" size="lg" className="w-full sm:w-auto text-base h-12 px-8">
                    View Templates
                  </Button>
                </div>
                
                <div className="mt-8 flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span>Free to start</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span>No credit card required</span>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-2xl transform rotate-3 scale-105 blur-2xl -z-10" />
                <img 
                  src={HERO_IMAGE} 
                  alt="Resume Builder Interface" 
                  className="rounded-2xl shadow-2xl border border-border/50 w-full object-cover h-[400px] lg:h-[500px]"
                />
              </motion.div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <section className="py-24 bg-secondary/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-bold tracking-tight mb-4 font-serif">Everything you need</h2>
              <p className="text-muted-foreground text-lg">
                Powerful tools to help you build the perfect resume without the hassle of formatting.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Wand2 className="w-8 h-8 text-primary" />,
                  title: "Smart Editor",
                  description: "Real-time preview updates as you type. Focus on content while we handle the design."
                },
                {
                  icon: <FileText className="w-8 h-8 text-primary" />,
                  title: "Professional Templates",
                  description: "Clean, modern designs approved by recruiters and optimized for ATS systems."
                },
                {
                  icon: <Download className="w-8 h-8 text-primary" />,
                  title: "Instant PDF Export",
                  description: "Download your resume in high-quality PDF format, ready to send to employers."
                }
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-background p-8 rounded-2xl shadow-sm border hover:shadow-md transition-shadow"
                >
                  <div className="mb-4 p-3 bg-primary/10 w-fit rounded-xl">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-12 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-muted-foreground">
          <p>&copy; 2024 ResuMake. Built for professionals.</p>
        </div>
      </footer>
    </div>
  );
}
