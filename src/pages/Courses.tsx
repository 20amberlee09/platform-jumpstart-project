import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Courses = () => {
  const courses = [
    {
      id: "trust-bootcamp",
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
      total: "$600 total",
      popular: true
    },
    {
      id: "estate-planning",
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
      total: "One payment",
      popular: false
    },
    {
      id: "business-trust",
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
      total: "Weekly billing",
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-hero text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Choose Your Legal Solution
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto">
            Professional legal document automation tailored to your specific needs. Each course includes our complete 5-step automation process.
          </p>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <Card key={course.id} className={`relative shadow-legal-lg border-0 hover:shadow-xl transition-all ${course.popular ? 'ring-2 ring-primary' : ''}`}>
                {course.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}
                
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
                  
                  <div className="space-y-3">
                    <Link to={`/course/${course.id}`}>
                      <Button className="w-full" size="lg">
                        View Details
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                    <Link to="/automation">
                      <Button variant="outline" className="w-full" size="lg">
                        Start Process Now
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Process Overview */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our 5-Step Automation Process</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Every course includes our complete legal document automation workflow
            </p>
          </div>
          
          <div className="grid md:grid-cols-5 gap-6">
            {[
              { step: 1, title: "ID Verification", desc: "Secure identity verification with OCR" },
              { step: 2, title: "Information Collection", desc: "Gather trust and legal details" },
              { step: 3, title: "Custom Seal Creation", desc: "Generate QR codes and digital seals" },
              { step: 4, title: "Document Assembly", desc: "Automated legal document generation" },
              { step: 5, title: "Delivery & Notarization", desc: "Secure delivery with notarization" }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Courses;