
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "@/components/ui/navigation-menu";
import { Search } from "lucide-react";
import { CATEGORY_LABELS } from "@/types/location";

const Header = () => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between h-16">
        <Link to="/" className="flex items-center">
          <span className="text-2xl font-display font-bold text-primary">Cluj Compass</span>
        </Link>

        <div className="hidden md:block">
          <NavigationMenu>
            <NavigationMenuList>
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <NavigationMenuItem key={key}>
                  <Link to={`/category/${key}`}>
                    <NavigationMenuLink className="px-3 py-2 hover:text-primary">
                      {label}
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon">
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
