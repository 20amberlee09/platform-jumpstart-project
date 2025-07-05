import { Button } from "@/components/ui/button";
import { Scale, Menu, X, User, Play } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAdminData } from "@/hooks/useAdminData";
import { useCourseAccess } from "@/hooks/useCourseAccess";

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

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const startCourse = () => {
    navigate('/automation?start=true');
  };

  const baseNavItems: NavItem[] = [
    { href: "/", label: "Home" },
    { href: "/automation", label: "Boot Camp documents" }
  ];
  
  // Add course access and admin items based on user permissions
  let navItems: NavItem[] = [...baseNavItems];
  
  if (hasCourseAccess) {
    navItems.push({ href: "/automation?start=true", label: "Start Course", isSpecial: true });
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
              <Link
                key={item.href}
                to={item.href}
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
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center space-x-4">
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
                <Link
                  key={item.href}
                  to={item.href}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    isActive(item.href) ? "text-primary" : "text-muted-foreground"
                  } ${
                    item.isSpecial ? "btn-royal-gold px-3 py-2 rounded-md flex items-center gap-2 mobile-touch-optimized" : ""
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.isSpecial && <Play className="h-4 w-4" />}
                  {item.label}
                </Link>
              ))}
              <div className="flex flex-col space-y-2 pt-4 border-t">
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