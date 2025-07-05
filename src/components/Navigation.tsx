import { Button } from "@/components/ui/button";
import { Scale, Menu, X, User, Play, CreditCard } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAdminData } from "@/hooks/useAdminData";
import { useCourseAccess } from "@/hooks/useCourseAccess";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import GiftCodeDropdown from "@/components/GiftCodeDropdown";

interface NavItem {
  href: string;
  label: string;
  isSpecial?: boolean;
}

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdminData();
  const { hasCourseAccess } = useCourseAccess();
  const { toast } = useToast();

  const courseId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const startCourse = () => {
    // Scroll to the course section on the home page
    const element = document.getElementById('course-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  const handlePurchase = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to purchase this course.",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    try {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          course_id: courseId,
          amount: 15000, // $150 in cents
          currency: 'usd',
          status: 'pending'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      localStorage.setItem('pendingOrderId', order.id);
      window.open('https://www.paypal.com/ncp/payment/4QSTXR5Z9UVEW', '_blank');
      
      toast({
        title: "Redirecting to PayPal",
        description: "Complete your payment to access the course.",
      });
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: "Payment Error",
        description: "Unable to process payment. Please try again.",
        variant: "destructive"
      });
    }
  };

  const baseNavItems: NavItem[] = [
    { href: "/", label: "Home" }
  ];
  
  // Add admin items based on user permissions
  let navItems: NavItem[] = [...baseNavItems];
  
  if (hasCourseAccess) {
    // Make the start course button more prominent by putting it first
    navItems.unshift({ href: "/#start", label: "▶ Start Course", isSpecial: true });
  }
  
  if (isAdmin) {
    navItems.push({ href: "/admin", label: "Admin" });
  }

  const isActive = (href: string) => {
    if (href === "/") return location.pathname === "/";
    return location.pathname.startsWith(href);
  };

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Scale className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary">TROOTHHURTZ</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              item.isSpecial ? (
                <button
                  key={item.href}
                  onClick={startCourse}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    isActive(item.href) 
                      ? "text-primary border-b-2 border-primary pb-1" 
                      : "text-muted-foreground"
                  } ${
                    item.isSpecial ? "btn-royal-gold px-3 py-1 rounded-md flex items-center gap-1" : ""
                  }`}
                >
                  {item.isSpecial && <Play className="h-4 w-4" />}
                  {item.label}
                </button>
              ) : (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    isActive(item.href) 
                      ? "text-primary border-b-2 border-primary pb-1" 
                      : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              )
            ))}
            {!hasCourseAccess && (
              <button
                onClick={handlePurchase}
                className="text-sm font-medium transition-colors hover:text-primary bg-primary text-black px-4 py-2 rounded-md flex items-center gap-2 hover:bg-primary/90"
              >
                <CreditCard className="h-4 w-4" />
                Purchase $150
              </button>
            )}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center space-x-4">
            <GiftCodeDropdown />
            {user ? (
              <>
                <div className="flex items-center space-x-2 text-sm">
                  <User className="h-4 w-4" />
                  <span className="text-muted-foreground">Welcome back!</span>
                </div>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link to="/auth">
                  <Button size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-4">
              {navItems.map((item) => (
                item.isSpecial ? (
                  <button
                    key={item.href}
                    onClick={startCourse}
                    className={`text-sm font-medium transition-colors hover:text-primary ${
                      isActive(item.href) ? "text-primary" : "text-muted-foreground"
                    } ${
                      item.isSpecial ? "btn-royal-gold px-3 py-2 rounded-md flex items-center gap-2 mobile-touch-optimized" : ""
                    }`}
                  >
                    {item.isSpecial && <Play className="h-4 w-4" />}
                    {item.label}
                  </button>
                ) : (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`text-sm font-medium transition-colors hover:text-primary ${
                      isActive(item.href) ? "text-primary" : "text-muted-foreground"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                )
              ))}
              {!hasCourseAccess && (
                <button
                  onClick={() => {
                    handlePurchase();
                    setIsMenuOpen(false);
                  }}
                  className="text-sm font-medium transition-colors bg-primary text-black px-4 py-3 rounded-md flex items-center gap-2 hover:bg-primary/90 mobile-touch-optimized"
                >
                  <CreditCard className="h-4 w-4" />
                  Purchase Course $150
                </button>
              )}
              <div className="flex flex-col space-y-2 pt-4 border-t">
                <div className="px-2 pb-2">
                  <GiftCodeDropdown />
                </div>
                {user ? (
                  <>
                    <div className="flex items-center space-x-2 text-sm px-2 py-1">
                      <User className="h-4 w-4" />
                      <span className="text-muted-foreground">Welcome back!</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleSignOut}>
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="ghost" size="sm" className="w-full">Sign In</Button>
                    </Link>
                    <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                      <Button size="sm" className="w-full">Get Started</Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navigation;