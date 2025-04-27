
import { useEffect, useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "@/components/AuthContext";
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { MapPin, ListOrdered, LogOut, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminLayout() {
  const { user, isAdmin, isLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    console.log('AdminLayout - Auth state check:', { 
      user: !!user, 
      isAdmin, 
      isLoading,
      email: user?.email 
    });

    if (isLoading) {
      console.log('AdminLayout - Still loading auth state...');
      return;
    }

    if (!user) {
      console.log('AdminLayout - No user found, redirecting to /auth');
      navigate("/auth?redirect=/admin", { replace: true });
      return;
    }

    if (!isAdmin) {
      console.log('AdminLayout - User is not admin, redirecting to /');
      navigate("/", { replace: true });
      return;
    }

    // If we get here, user is logged in and is admin
    console.log('AdminLayout - User is authorized as admin');
    setIsAuthorized(true);
  }, [user, isAdmin, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-medium mb-2">Loading...</h2>
          <p className="text-gray-500">Verifying admin access</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  console.log('AdminLayout - Rendering admin interface for user:', user?.email);
  
  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarHeader className="border-b px-6 py-3">
            <h2 className="text-lg font-semibold">Admin Dashboard</h2>
            <p className="text-sm text-muted-foreground">Logged in as {user?.email}</p>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => navigate("/admin")}>
                  <LayoutDashboard />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
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
