import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Shield, Scale, Clock, Award } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const bootCampFeatures = [
    "Complete $150 package - no recurring fees",
    "Government ID verification with document upload",
    "Trust name availability verification (USPTO & State searches)",
    "Ministerial ordination certificate upload",
    "Ecclesiastic revocable living trust creation",
    "Gmail account setup for trust",
    "Google Drive folder creation",
    "QR code generation for documentation",
    "Barcode certificate purchase and upload guidance",
    "Custom document seal creation and upload",
    "Professional document generation with all verification elements"
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Logo Background */}
      <section 
        className="bg-gradient-hero text-foreground py-20 relative overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('/lovable-uploads/bc3a82ad-d4e6-4ec7-a355-4d7bb5a51845.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-royal-glow">
            TroothHurtz
            <span className="block text-primary mt-2">Legal Document Automation</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-foreground/90 max-w-3xl mx-auto">
            Professional ecclesiastic revocable living trust creation with automated legal documentation, 
            custom seal creation, and complete verification services.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/automation">
              <Button size="lg" className="btn-royal-gold text-lg px-8">
                Start Boot Camp Process
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Boot Camp Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">Boot Camp documents</h2>
            <p className="text-xl text-muted-foreground">
              Complete trust formation with automated legal documentation and custom seal creation
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="card-royal shadow-royal border-2 border-primary glow-gold">
              <CardHeader className="pb-6 bg-gradient-gold/10">
                <div className="flex justify-between items-start mb-4">
                  <Badge variant="secondary" className="bg-primary text-black border-primary glow-gold">
                    Complete Package
                  </Badge>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary glow-gold">$150</div>
                    <div className="text-sm text-electric-blue">One-time payment</div>
                  </div>
                </div>
                <CardTitle className="text-3xl mb-4 text-primary text-royal-glow">Boot Camp documents</CardTitle>
                <div className="flex items-center text-electric-blue mb-4">
                  <Clock className="h-5 w-5 mr-2 text-electric-blue glow-blue" />
                  <span>Complete in 8 steps</span>
                </div>
                <p className="text-foreground text-lg">
                  Complete ecclesiastic revocable living trust creation with ministerial ordination, 
                  verification services, and professional documentation. All required documents must be uploaded before completion.
                </p>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="grid md:grid-cols-2 gap-4 mb-8">
                  {bootCampFeatures.map((feature, index) => (
                    <div key={index} className="flex items-start p-2 rounded-lg bg-gradient-royal/20 border border-electric-blue/30">
                      <CheckCircle className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0 glow-gold" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <Link to="/automation">
                  <Button className="w-full btn-royal-gold" size="lg">
                    Start Boot Camp Process
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <section className="py-20 bg-gradient-royal/30 border-y-2 border-primary/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary text-royal-glow">8-Step Process</h2>
            <p className="text-xl text-foreground max-w-2xl mx-auto">
              Our comprehensive process ensures professional, legally compliant documentation every time
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center card-royal border-2 border-primary glow-gold">
              <CardHeader className="bg-gradient-gold/10">
                <Shield className="h-12 w-12 text-primary mx-auto mb-4 glow-gold" />
                <CardTitle className="text-xl text-primary">Payment & NDA</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground">Secure payment processing and non-disclosure agreement</p>
              </CardContent>
            </Card>

            <Card className="text-center card-royal border-2 border-electric-blue glow-blue">
              <CardHeader className="bg-gradient-royal/10">
                <Scale className="h-12 w-12 text-electric-blue mx-auto mb-4 glow-blue" />
                <CardTitle className="text-xl text-electric-blue">Identity & Trust Name</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground">ID verification and trust name availability checking</p>
              </CardContent>
            </Card>

            <Card className="text-center card-royal border-2 border-accent-teal glow-teal">
              <CardHeader className="bg-gradient-royal/10">
                <Award className="h-12 w-12 text-electric-cyan mx-auto mb-4 glow-teal" />
                <CardTitle className="text-xl text-electric-cyan">Ordination & Setup</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground">Ministerial ordination and Gmail/Drive setup</p>
              </CardContent>
            </Card>

            <Card className="text-center card-royal border-2 border-primary glow-gold">
              <CardHeader className="bg-gradient-gold/10">
                <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4 glow-gold" />
                <CardTitle className="text-xl text-primary">Documents & Seals</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground">Verification tools and final document generation</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-royal text-primary border-2 border-primary/50 glow-gold">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-royal-glow">
            Ready to Create Your Trust?
          </h2>
          <p className="text-xl mb-8 text-foreground/90 max-w-2xl mx-auto">
            Join thousands who have secured their assets with our professional ecclesiastic trust formation process.
          </p>
          <Link to="/automation">
            <Button size="lg" className="btn-royal-gold text-lg px-8 glow-gold">
              Start Your Boot Camp Process
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-royal-black text-foreground py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Scale className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold text-primary">TroothHurtz</span>
              </div>
              <p className="text-muted-foreground">
                Professional ecclesiastic trust formation with automated legal documentation and verification services.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-primary">Services</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>Ecclesiastic Trust Formation</li>
                <li>Ministerial Ordination</li>
                <li>Document Verification</li>
                <li>Custom Seal Creation</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-primary">Platform</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>Automated Documentation</li>
                <li>ID Verification</li>
                <li>Trust Name Search</li>
                <li>QR Code Generation</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-primary/20 mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 TroothHurtz. Professional ecclesiastic trust formation platform.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;