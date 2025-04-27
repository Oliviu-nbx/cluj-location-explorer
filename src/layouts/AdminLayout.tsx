
import { useEffect, useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "@/components/AuthContext";
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { MapPin, ListOrdered, LogOut, LayoutDashboard, BarChart, AlertTriangle, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function AdminLayout() {
  const { user, isAdmin, isLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    console.log('AdminLayout - Auth state:', { 
      user: !!user, 
      isAdmin, 
      isLoading 
    });

    if (isLoading) {
      return; // Wait for auth to complete
    }

    if (!user) {
      console.log('AdminLayout - No user found, redirecting to login');
      navigate("/auth?redirect=/admin", { replace: true });
      return;
    }

    // If user is logged in but not admin
    if (!isAdmin) {
      console.log('AdminLayout - User is not admin');
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "You don't have admin privileges",
      });
      
      // Redirect to home page
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 1500);
      return;
    }

    // User is logged in and is admin
    console.log('AdminLayout - User authorized as admin');
    setIsAuthorized(true);
  }, [user, isAdmin, isLoading, navigate, toast]);

  // Handle sign out
  const handleSignOut = async () => {
    await signOut();
    navigate("/", { replace: true });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <h2 className="text-xl font-medium mb-2">Loading...</h2>
          <p className="text-gray-500">Verifying admin access</p>
        </div>
      </div>
    );
  }

  if (!user || !isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md p-6 bg-red-50 rounded-lg border border-red-200">
          <h2 className="text-xl font-medium mb-2 text-red-700">Access Denied</h2>
          <p className="text-gray-700 mb-4">
            You don't have admin privileges. If you believe this is an error, please contact support.
          </p>
          <Button onClick={() => navigate("/")} variant="outline">
            Go to Homepage
          </Button>
        </div>
      </div>
    );
  }
  
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
                <SidebarMenuButton onClick={handleSignOut}>
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
