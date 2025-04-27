
import { useEffect, useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "@/components/AuthContext";
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { MapPin, ListOrdered, LogOut } from "lucide-react";

export default function AdminLayout() {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    console.log('AdminLayout - Auth state check:', { user: !!user, isAdmin, email: user?.email });

    if (!user) {
      console.log('AdminLayout - No user found, redirecting to /auth');
      navigate("/auth", { replace: true });
      return;
    }

    if (!isAdmin) {
      console.log('AdminLayout - User is not admin, redirecting to /auth');
      navigate("/auth", { replace: true });
      return;
    }

    // If we get here, user is logged in and is admin
    console.log('AdminLayout - User is authorized as admin');
    setIsAuthorized(true);
  }, [user, isAdmin, navigate]);

  if (!isAuthorized) {
    console.log('AdminLayout - Not rendering admin UI, waiting for auth check');
    return null;
  }

  console.log('AdminLayout - Rendering admin interface for user:', user?.email);
  
  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarHeader className="border-b px-6 py-3">
            <h2 className="text-lg font-semibold">Admin Dashboard</h2>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => navigate("/admin/locations")}>
                  <MapPin />
                  <span>Locations</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => navigate("/admin/categories")}>
                  <ListOrdered />
                  <span>Categories</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={signOut}>
                  <LogOut />
                  <span>Sign Out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
}
