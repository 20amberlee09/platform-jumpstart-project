import { Scale } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAdminData } from "@/hooks/useAdminData";
import { useCourseAccess } from "@/hooks/useCourseAccess";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import GiftCodeDropdown from "@/components/GiftCodeDropdown";
import { MobileNavigation, DesktopNavigation } from "@/components/Navigation/";

interface NavItem {
  href: string;
  label: string;
  isSpecial?: boolean;
}

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [ministerStatus, setMinisterStatus] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdminData();
  const { hasCourseAccess } = useCourseAccess();
  const { toast } = useToast();

  const courseId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

  useEffect(() => {
    const checkMinisterStatus = async () => {
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('minister_verified, first_name, minister_name')
          .eq('user_id', user.id)
          .single();
        
        if (profile?.minister_verified) {
          setMinisterStatus(`Minister ${profile.minister_name || profile.first_name}`);
        } else {
          setMinisterStatus(profile?.first_name || 'User');
        }
      }
    };
    
    checkMinisterStatus();
  }, [user]);

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
    // Add XRP test link for admins
    navItems.push({ href: "/xrp-test", label: "🧪 XRP Test" });
  }

  const isActive = (href: string) => {
    if (href === "/") return location.pathname === "/";
    return location.pathname.startsWith(href);
  };

  const userDisplayName = ministerStatus || user?.email?.split('@')[0] || 'User';

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
          <DesktopNavigation
            navItems={navItems}
            hasCourseAccess={hasCourseAccess}
            user={user}
            startCourse={startCourse}
            handlePurchase={handlePurchase}
            handleSignOut={handleSignOut}
            isActive={isActive}
            userDisplayName={userDisplayName}
          >
            <GiftCodeDropdown />
          </DesktopNavigation>

          {/* Mobile Navigation */}
          <MobileNavigation
            isMenuOpen={isMenuOpen}
            setIsMenuOpen={setIsMenuOpen}
            navItems={navItems}
            hasCourseAccess={hasCourseAccess}
            user={user}
            startCourse={startCourse}
            handlePurchase={handlePurchase}
            handleSignOut={handleSignOut}
            userDisplayName={userDisplayName}
          >
            <GiftCodeDropdown />
          </MobileNavigation>
        </div>
      </div>
    </header>
  );
};

export default Navigation;