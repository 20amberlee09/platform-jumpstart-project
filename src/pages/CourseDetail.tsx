import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Users, Award, ArrowLeft, ArrowRight } from "lucide-react";
import { Link, useParams } from "react-router-dom";

const CourseDetail = () => {
  const { courseId } = useParams();

  const courseData = {
    "trust-bootcamp": {
      name: "Trust Formation Boot Camp",
      price: "$150",
      duration: "4 weeks",
      category: "Foundation",
      description: "Master trust formation with our comprehensive 4-week program. This bootcamp covers everything from legal fundamentals to advanced automation techniques.",
      longDescription: "Our Trust Formation Boot Camp is designed for individuals who want to understand and implement trust structures effectively. Over 4 weeks, you'll learn constitutional law principles, trust formation strategies, and gain access to our complete automation platform.",
      features: [
        {
          title: "Custom Trust Seal Creation",
          description: "Generate unique, legally compliant trust seals with embedded QR codes and verification systems."
        },
        {
          title: "Automated Legal Document Assembly",
          description: "State-specific trust documents generated automatically based on your requirements."
        },
        {
          title: "QR Code & Barcode Generation", 
          description: "Every document includes unique tracking codes for verification and authenticity."
        },
        {
          title: "Online Notarization Integration",
          description: "Seamless integration with certified online notarization services."
        },
        {
          title: "Google Drive Document Delivery",
          description: "Secure document storage and sharing via Google Drive integration."
        },
        {
          title: "24/7 AI Legal Assistant",
          description: "Access to our constitutional law AI assistant for guidance and questions."
        },
        {
          title: "Constitutional Law Guidance",
          description: "Comprehensive coverage of relevant constitutional principles and applications."
        }
      ],
      curriculum: [
        {
          week: 1,
          title: "Trust Fundamentals & Constitutional Framework",
          topics: [
            "Introduction to Trust Law",
            "Constitutional Principles in Trust Formation",
            "State vs Federal Jurisdiction",
            "Privacy Rights and Asset Protection"
          ]
        },
        {
          week: 2,
          title: "Trust Documentation & Legal Requirements",
          topics: [
            "Trust Agreement Components",
            "State-Specific Requirements",
            "Beneficiary Designations",
            "Fiduciary Responsibilities"
          ]
        },
        {
          week: 3,
          title: "Trust Administration & Management",
          topics: [
            "Trust Operations",
            "Asset Management Strategies",
            "Tax Considerations",
            "Compliance Requirements"
          ]
        },
        {
          week: 4,
          title: "Advanced Strategies & Implementation",
          topics: [
            "Complex Trust Structures",
            "Multi-State Considerations",
            "Estate Planning Integration",
            "Final Project Implementation"
          ]
        }
      ],
      total: "$600 total",
      students: "2,450+",
      rating: "4.9/5"
    }
  };

  const course = courseData[courseId as keyof typeof courseData];

  if (!course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Course Not Found</h1>
          <Link to="/courses">
            <Button>Back to Courses</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Link to="/courses" className="flex items-center text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Courses
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-hero text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-accent text-accent-foreground mb-4">
                {course.category}
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                {course.name}
              </h1>
              <p className="text-xl mb-6 text-white/90">
                {course.description}
              </p>
              <div className="flex flex-wrap gap-6 text-white/80">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  <span>{course.students} students</span>
                </div>
                <div className="flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  <span>{course.rating} rating</span>
                </div>
              </div>
            </div>
            
            <Card className="shadow-2xl">
              <CardHeader>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="text-3xl font-bold text-primary">{course.price}</div>
                    <div className="text-muted-foreground">{course.total}</div>
                  </div>
                </div>
                <CardTitle className="text-2xl">Start Your Legal Automation Journey</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link to="/automation">
                  <Button className="w-full" size="lg">
                    Enroll Now & Start Process
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <p className="text-sm text-muted-foreground text-center">
                  30-day money-back guarantee • Cancel anytime
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Course Content */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              {/* About */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold mb-6">About This Course</h2>
                <p className="text-lg text-muted-foreground mb-6">
                  {course.longDescription}
                </p>
              </div>

              {/* Curriculum */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold mb-6">Course Curriculum</h2>
                <div className="space-y-6">
                  {course.curriculum.map((week, index) => (
                    <Card key={index} className="border-0 shadow-legal-card">
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold mr-3">
                            {week.week}
                          </div>
                          {week.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {week.topics.map((topic, topicIndex) => (
                            <li key={topicIndex} className="flex items-start">
                              <CheckCircle className="h-4 w-4 text-primary mr-3 mt-1 flex-shrink-0" />
                              <span className="text-muted-foreground">{topic}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div>
                <h2 className="text-3xl font-bold mb-6">What's Included</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {course.features.map((feature, index) => (
                    <Card key={index} className="border-0 shadow-legal-card">
                      <CardContent className="p-6">
                        <div className="flex items-start">
                          <CheckCircle className="h-6 w-6 text-primary mr-4 mt-1 flex-shrink-0" />
                          <div>
                            <h3 className="font-semibold mb-2">{feature.title}</h3>
                            <p className="text-sm text-muted-foreground">{feature.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div>
              <Card className="sticky top-24 shadow-legal-lg">
                <CardHeader>
                  <CardTitle>Ready to Get Started?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">{course.price}</div>
                    <div className="text-muted-foreground">{course.total}</div>
                  </div>
                  
                  <Link to="/automation">
                    <Button className="w-full" size="lg">
                      Start 5-Step Process
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  
                  <div className="text-center space-y-2 text-sm text-muted-foreground">
                    <p>✓ Immediate access to automation platform</p>
                    <p>✓ 24/7 AI legal assistant</p>
                    <p>✓ All documents included</p>
                    <p>✓ Online notarization included</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CourseDetail;