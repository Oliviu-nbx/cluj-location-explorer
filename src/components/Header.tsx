import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "@/components/ui/navigation-menu";
import { Search, User, LogIn, Menu } from "lucide-react";
import { CATEGORY_LABELS } from "@/types/location";
import { useAuth } from "./AuthContext";

const Header = () => {
  const { user, isAdmin } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between h-16">
        <Link to="/" className="flex items-center">
          <span className="text-xl sm:text-2xl font-display font-bold text-primary">Cluj Compass</span>
        </Link>

        <div className="hidden md:block">
          <NavigationMenu>
            <NavigationMenuList>
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <NavigationMenuItem key={key}>
                  <Link to={`/category/${key}`}>
                    <NavigationMenuLink className="px-3 py-2 hover:text-primary transition-colors">
                      {label}
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
          
          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>
            
            {user ? (
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <Link to="/admin">
                    <Button variant="outline" size="sm">
                      Admin
                    </Button>
                  </Link>
                )}
                <Link to="/profile">
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                    <span className="sr-only">Profile</span>
                  </Button>
                </Link>
              </div>
            ) : (
              <Link to="/auth">
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <LogIn className="h-4 w-4" />
                  <span>Sign In</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'}`}>
        <nav className="px-4 pt-2 pb-4 border-t border-gray-200 bg-white">
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <Link
              key={key}
              to={`/category/${key}`}
              className="block py-2 text-base hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              {label}
            </Link>
          ))}
          <div className="mt-4 flex flex-col gap-2">
            {user ? (
              <>
                {isAdmin && (
                  <Link to="/admin">
                    <Button variant="outline" className="w-full justify-start">
                      Admin Dashboard
                    </Button>
                  </Link>
                )}
                <Link to="/profile">
                  <Button variant="outline" className="w-full justify-start">
                    Profile
                  </Button>
                </Link>
              </>
            ) : (
              <Link to="/auth">
                <Button variant="default" className="w-full">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
