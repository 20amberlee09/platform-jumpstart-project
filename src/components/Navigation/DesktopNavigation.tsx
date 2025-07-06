import { Button } from "@/components/ui/button";
import { User, Play, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";

interface DesktopNavigationProps {
  navItems: Array<{href: string; label: string; isSpecial?: boolean}>;
  hasCourseAccess: boolean;
  user: any;
  startCourse: () => void;
  handlePurchase: () => void;
  handleSignOut: () => void;
  isActive: (href: string) => boolean;
  userDisplayName: string;
  children?: React.ReactNode;
}

export const DesktopNavigation = ({
  navItems,
  hasCourseAccess,
  user,
  startCourse,
  handlePurchase,
  handleSignOut,
  isActive,
  userDisplayName,
  children
}: DesktopNavigationProps) => {
  return (
    <>
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
              } btn-royal-gold px-3 py-1 rounded-md flex items-center gap-1`}
            >
              <Play className="h-4 w-4" />
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
        {children}
        {user ? (
          <>
            <div className="flex items-center space-x-2 text-sm">
              <User className="h-4 w-4" />
              <span className="text-muted-foreground">Welcome back, {userDisplayName}!</span>
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
    </>
  );
};