import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen, Search, Menu, User, LogOut, MessageSquare } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { NotificationDropdown } from "@/components/NotificationDropdown";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileName, setProfileName] = useState<string>("");
  const { user, userRole, signOut } = useAuth();
  const navigate = useNavigate();

  const getDashboardLink = () => {
    if (userRole === "admin") return "/dashboard/admin";
    if (userRole === "instructor") return "/dashboard/instructor";
    if (userRole === "student") return "/dashboard/student";
    return "/";
  };

  // Fetch user profile name
  useEffect(() => {
    if (user?.id) {
      supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single()
        .then(({ data }) => {
          if (data?.full_name) {
            setProfileName(data.full_name);
          }
        });
    } else {
      setProfileName("");
    }
  }, [user?.id]);

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary">
            <BookOpen className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">LearnHub</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/courses" className="text-sm font-medium hover:text-primary transition-colors">
            Courses
          </Link>
          {user && (
            <Link to={getDashboardLink()} className="text-sm font-medium hover:text-primary transition-colors">
              Dashboard
            </Link>
          )}
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <NotificationDropdown />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/messages")}
                className="hidden md:flex"
              >
                <MessageSquare className="h-5 w-5" />
              </Button>
              <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <User className="h-5 w-5" />
                  {profileName && <span className="hidden md:inline">{profileName}</span>}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  {profileName || "My Account"}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate(getDashboardLink())}>
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/messages")}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Messages
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            </>
          ) : (
            <>
              <Link to="/auth/login">
                <Button variant="ghost" className="hidden md:flex">
                  Login
                </Button>
              </Link>
              <Link to="/auth/register">
                <Button variant="hero">Get Started</Button>
              </Link>
            </>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background p-4">
          <div className="flex flex-col gap-4">
            <Link to="/courses" className="text-sm font-medium hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>
              Courses
            </Link>
            {user && (
              <>
                <Link to={getDashboardLink()} className="text-sm font-medium hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>
                  Dashboard
                </Link>
                <Link to="/messages" className="text-sm font-medium hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>
                  Messages
                </Link>
              </>
            )}
            {user ? (
              <Button onClick={() => { signOut(); setMobileMenuOpen(false); }} className="w-full">
                Sign Out
              </Button>
            ) : (
              <>
                <Link to="/auth/login" className="w-full" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full">
                    Login
                  </Button>
                </Link>
                <Link to="/auth/register" className="w-full" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="hero" className="w-full">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
