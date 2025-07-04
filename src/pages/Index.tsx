import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Shield, Scale, Users, Clock, Award } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const courses = [
    {
      id: 1,
      name: "Trust Formation Boot Camp",
      price: "$150/week",
      duration: "4 weeks",
      category: "Foundation",
      description: "Complete trust formation with automated legal documentation and custom seal creation.",
      features: [
        "Custom Trust Seal Creation",
        "Automated Legal Document Assembly", 
        "QR Code & Barcode Generation",
        "Online Notarization Integration",
        "Google Drive Document Delivery",
        "24/7 AI Legal Assistant",
        "Constitutional Law Guidance"
      ],
      total: "$600 total"
    },
    {
      id: 2,
      name: "Estate Planning Essentials",
      price: "$450",
      duration: "One-time",
      category: "Comprehensive",
      description: "Complete estate planning package including wills, power of attorney, and healthcare directives.",
      features: [
        "Will & Testament Creation",
        "Power of Attorney Documents",
        "Healthcare Directives", 
        "Trust Integration",
        "Asset Protection Planning",
        "Legal Compliance Verification"
      ],
      total: "One payment"
    },
    {
      id: 3,
      name: "Business Trust Formation", 
      price: "$200/week",
      duration: "Ongoing",
      category: "Professional",
      description: "Advanced business trust formation with commercial documentation and tax optimization.",
      features: [
        "Business Trust Creation",
        "Commercial Documentation",
        "Tax Optimization Structures",
        "Asset Protection Strategies", 
        "Compliance Management",
        "Multi-State Registration"
      ],
      total: "Weekly billing"
    }
  ];

  const platformFeatures = [
    {
      icon: Shield,
      title: "Automated ID Verification",
      description: "Secure identity verification with OCR integration and NDA generation"
    },
    {
      icon: Scale,
      title: "Legal Document Assembly", 
      description: "State-specific legal documents with automated clause selection"
    },
    {
      icon: Award,
      title: "Custom Trust Seals",
      description: "QR codes, barcodes, and digital signatures for document authenticity"
    },
    {
      icon: Users,
      title: "Online Notarization",
      description: "Integrated notarization services with digital signature collection"
    }
  ];

  return (
    <div className="min-h-screen bg-background">

      {/* Hero Section */}
      <section className="bg-gradient-hero text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Legal Document Automation
            <span className="block text-accent">Made Simple</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto">
            Automate trust formation, estate planning, and legal documentation with our comprehensive 5-step process. Professional legal documents delivered with custom seals and notarization.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/automation">
              <Button size="lg" className="bg-accent text-legal-dark hover:bg-accent/90 text-lg px-8">
                Start Free Consultation
              </Button>
            </Link>
            <Link to="/courses">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-legal-primary">
                View Courses
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Complete Legal Automation Platform</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our 5-step process ensures professional, legally compliant documentation every time
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {platformFeatures.map((feature, index) => (
              <Card key={index} className="text-center shadow-legal-card border-0">
                <CardHeader>
                  <feature.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Choose Your Legal Solution</h2>
            <p className="text-xl text-muted-foreground">
              Professional legal document automation tailored to your needs
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <Card key={course.id} className="relative shadow-legal-lg border-0 hover:shadow-xl transition-shadow">
                <CardHeader className="pb-6">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary" className="bg-accent/10 text-accent-foreground">
                      {course.category}
                    </Badge>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{course.price}</div>
                      <div className="text-sm text-muted-foreground">{course.total}</div>
                    </div>
                  </div>
                  <CardTitle className="text-2xl mb-2">{course.name}</CardTitle>
                  <div className="flex items-center text-muted-foreground mb-4">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>{course.duration}</span>
                  </div>
                  <p className="text-muted-foreground">{course.description}</p>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-3 mb-6">
                    {course.features.map((feature, index) => (
                      <div key={index} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Link to={`/course/${course.id === 1 ? 'trust-bootcamp' : course.id === 2 ? 'estate-planning' : 'business-trust'}`}>
                    <Button className="w-full" size="lg">
                      Get Started
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Automate Your Legal Documents?
          </h2>
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            Join thousands who have streamlined their legal processes with our AI-powered automation platform.
          </p>
          <Link to="/automation">
            <Button size="lg" className="bg-white text-legal-primary hover:bg-white/90 text-lg px-8">
              Start Your Free Consultation
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-legal-dark text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Scale className="h-6 w-6" />
                <span className="text-xl font-bold">TroothhHurtz</span>
              </div>
              <p className="text-white/70">
                Professional legal document automation platform with AI-powered assistance.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Services</h3>
              <ul className="space-y-2 text-white/70">
                <li>Trust Formation</li>
                <li>Estate Planning</li>
                <li>Business Trusts</li>
                <li>Document Notarization</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-white/70">
                <li>AI Legal Assistant</li>
                <li>Document Generation</li>
                <li>ID Verification</li>
                <li>Online Notarization</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-white/70">
                <li>24/7 AI Assistant</li>
                <li>Legal Guidance</li>
                <li>Documentation</li>
                <li>Contact Support</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/20 mt-8 pt-8 text-center text-white/70">
            <p>&copy; 2024 TroothhHurtz. Professional legal document automation platform.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;