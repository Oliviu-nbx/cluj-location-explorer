
import { useEffect, useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "@/components/AuthContext";
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { MapPin, ListOrdered, LogOut, LayoutDashboard, BarChart, AlertTriangle, Webhook, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function AdminLayout() {
  const { user, isAdmin, isLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    console.log('AdminLayout - Auth state check:', { 
      user: !!user, 
      isAdmin, 
      isLoading,
      email: user?.email 
    });

    if (isLoading) {
      console.log('AdminLayout - Still loading auth state...');
      setAuthError(null);
      return;
    }

    if (!user) {
      console.log('AdminLayout - No user found, redirecting to /auth');
      navigate("/auth?redirect=/admin", { replace: true });
      return;
    }

    // If authentication check is complete and user is not admin
    if (!isAdmin) {
      console.log('AdminLayout - User is not admin, displaying error');
      setAuthError("You don't have admin privileges. If you believe this is an error, please contact support.");
      
      // Show a toast notification
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "You don't have admin privileges",
      });
      
      // After a short delay, redirect to home page
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 3000);
      return;
    }

    // If we get here, user is logged in and is admin
    console.log('AdminLayout - User is authorized as admin');
    setAuthError(null);
    setIsAuthorized(true);
  }, [user, isAdmin, isLoading, navigate, toast]);

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

  if (authError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md p-6 bg-red-50 rounded-lg border border-red-200">
          <h2 className="text-xl font-medium mb-2 text-red-700">Access Denied</h2>
          <p className="text-gray-700 mb-4">{authError}</p>
          <Button onClick={() => navigate("/")} variant="outline">
            Go to Homepage
          </Button>
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
                <SidebarMenuButton onClick={() => navigate("/admin/scraping")}>
                  <Database />
                  <span>Data Scraping</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => navigate("/admin/categories")}>
                  <ListOrdered />
                  <span>Categories</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => navigate("/admin/analytics")}>
                  <BarChart />
                  <span>Analytics</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => navigate("/admin/monitoring")}>
                  <AlertTriangle />
                  <span>Monitoring</span>
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
