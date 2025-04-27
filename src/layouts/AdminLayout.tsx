
import { useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "@/components/AuthContext";
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { MapPin, ListOrdered, LogOut } from "lucide-react";

export default function AdminLayout() {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('AdminLayout - Current auth state:', { user: !!user, isAdmin });

    if (!user) {
      console.log('AdminLayout - No user found, redirecting to /auth');
      navigate("/auth");
      return;
    }

    if (!isAdmin) {
      console.log('AdminLayout - User is not admin, redirecting to /auth');
      navigate("/auth");
    }
  }, [user, isAdmin, navigate]);

  if (!user || !isAdmin) {
    console.log('AdminLayout - Rendering null due to no user or not admin');
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
                <SidebarMenuButton asChild>
                  <a href="/admin/locations">
                    <MapPin />
                    <span>Locations</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/admin/categories">
                    <ListOrdered />
                    <span>Categories</span>
                  </a>
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
