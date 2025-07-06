import { Button } from "@/components/ui/button";
import { Menu, X, User, Play, CreditCard } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

interface MobileNavigationProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
  navItems: Array<{href: string; label: string; isSpecial?: boolean}>;
  hasCourseAccess: boolean;
  user: any;
  startCourse: () => void;
  handlePurchase: () => void;
  handleSignOut: () => void;
  userDisplayName: string;
  children?: React.ReactNode;
}

export const MobileNavigation = ({
  isMenuOpen,
  setIsMenuOpen,
  navItems,
  hasCourseAccess,
  user,
  startCourse,
  handlePurchase,
  handleSignOut,
  userDisplayName,
  children
}: MobileNavigationProps) => {
  const location = useLocation();
  
  const isActive = (href: string) => {
    if (href === "/") return location.pathname === "/";
    return location.pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="md:hidden p-2"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label="Toggle menu"
      >
        {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Mobile Navigation Menu */}
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
                  } btn-royal-gold px-3 py-2 rounded-md flex items-center gap-2 mobile-touch-optimized`}
                >
                  <Play className="h-4 w-4" />
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
                {children}
              </div>
              {user ? (
                <>
                  <div className="flex items-center space-x-2 text-sm px-2 py-1">
                    <User className="h-4 w-4" />
                    <span className="text-muted-foreground">Welcome back, {userDisplayName}!</span>
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
    </>
  );
};