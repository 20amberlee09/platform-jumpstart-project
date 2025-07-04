import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ArrowRight, Shield, FileText, Award, Send, Clock } from "lucide-react";

const Automation = () => {
  const steps = [
    {
      number: 1,
      title: "Account Setup & ID Verification",
      description: "Upload your driver's license for secure identity verification with OCR processing and automated NDA generation.",
      icon: Shield,
      features: [
        "Secure file upload for driver's license",
        "OCR data extraction and validation", 
        "Automated NDA document generation",
        "E-signature integration",
        "Identity verification API integration"
      ],
      timeEstimate: "5-10 minutes"
    },
    {
      number: 2,
      title: "Trust Information Collection",
      description: "Comprehensive form to gather all necessary trust details including beneficiaries, purpose, and state requirements.",
      icon: FileText,
      features: [
        "Trust name and trustor information",
        "Primary and additional beneficiaries",
        "Trust purpose selection (Asset Protection, Estate Planning, etc.)",
        "State of formation dropdown (all 50 states)",
        "Custom trust terms and provisions"
      ],
      timeEstimate: "15-20 minutes"
    },
    {
      number: 3,
      title: "Custom Trust Seal Creation", 
      description: "Automated generation of unique trust seals with QR codes, barcodes, and digital signatures for document authenticity.",
      icon: Award,
      features: [
        "Unique trust identifier creation",
        "QR code generation with trust data",
        "Barcode generation for document tracking",
        "Custom seal design with trust information",
        "Digital signature preparation"
      ],
      timeEstimate: "5 minutes (automated)"
    },
    {
      number: 4,
      title: "Legal Document Assembly",
      description: "Automated generation of all required legal documents including trust agreements, certificates, and assignment forms.",
      icon: FileText,
      features: [
        "Trust Agreement (primary legal document)",
        "Certificate of Trust (summary document)",
        "Assignment of Assets forms",
        "Beneficiary designation forms",
        "State-specific legal requirement integration"
      ],
      timeEstimate: "10 minutes (automated)"
    },
    {
      number: 5,
      title: "Document Delivery & Notarization",
      description: "Secure document delivery through multiple channels with integrated online notarization scheduling.",
      icon: Send,
      features: [
        "Google Drive integration for document storage",
        "Email delivery with secure links", 
        "PDFfiller.com integration for form completion",
        "Online notarization scheduling",
        "Digital signature collection"
      ],
      timeEstimate: "10-15 minutes"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-hero text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Legal Document Automation Process
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto">
            Complete your trust formation in 5 simple steps. Our automated system handles everything from identity verification to document notarization.
          </p>
          <Badge className="bg-accent text-accent-foreground text-lg px-6 py-2">
            Complete in 45-60 minutes
          </Badge>
        </div>
      </section>

      {/* Process Steps */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Your 5-Step Journey</h2>
            <p className="text-xl text-muted-foreground">
              Follow our guided process to create professional legal documents
            </p>
          </div>

          <div className="space-y-12">
            {steps.map((step, index) => (
              <Card key={index} className="shadow-legal-lg border-0 overflow-hidden">
                <div className="grid lg:grid-cols-12 gap-0">
                  <div className="lg:col-span-4 bg-gradient-primary p-8 text-white">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-xl font-bold mr-4">
                        {step.number}
                      </div>
                      <step.icon className="h-8 w-8" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                    <p className="text-white/90 mb-6">{step.description}</p>
                    <div className="flex items-center text-white/80">
                      <Clock className="h-4 w-4 mr-2" />
                      <span className="text-sm">{step.timeEstimate}</span>
                    </div>
                  </div>
                  
                  <div className="lg:col-span-8 p-8">
                    <h4 className="text-xl font-semibold mb-6">What's Included:</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      {step.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto shadow-legal-lg border-0">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-3xl mb-4">Ready to Start Your Legal Automation?</CardTitle>
              <p className="text-xl text-muted-foreground">
                Begin the 5-step process and have your professional legal documents ready within the hour.
              </p>
            </CardHeader>
            <CardContent className="text-center">
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary mb-2">45-60 min</div>
                  <div className="text-muted-foreground">Total Process Time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary mb-2">100%</div>
                  <div className="text-muted-foreground">Automated Process</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary mb-2">24/7</div>
                  <div className="text-muted-foreground">AI Legal Assistant</div>
                </div>
              </div>
              
              <Button size="lg" className="text-lg px-8">
                Begin Step 1: Identity Verification
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <p className="text-sm text-muted-foreground mt-4">
                Secure process • 30-day money-back guarantee • Professional legal documents
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Automation;