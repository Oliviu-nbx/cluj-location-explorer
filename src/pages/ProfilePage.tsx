
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/components/AuthContext";
import { LogOut, User, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Fetch the current admin status when the component mounts
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        setIsAdmin(data?.is_admin || false);
      } catch (error: any) {
        console.error('Error fetching profile:', error);
      }
    };
    
    fetchProfile();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleAdminToggle = async () => {
    if (!user) return;
    
    try {
      setUpdating(true);
      
      // Update the profile
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: !isAdmin })
        .eq('id', user.id);
        
      if (error) throw error;
      
      setIsAdmin(!isAdmin);
      toast({
        title: "Success",
        description: !isAdmin 
          ? "You are now an admin. Please sign out and sign back in for changes to take effect." 
          : "Admin privileges removed.",
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update admin status: " + error.message,
      });
    } finally {
      setUpdating(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="container max-w-2xl my-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Email</label>
            <p className="mt-1">{user.email}</p>
          </div>
          
          <div className="flex items-center space-x-2 pt-2">
            <Switch 
              id="admin-mode" 
              checked={isAdmin}
              onCheckedChange={handleAdminToggle}
              disabled={updating}
            />
            <label 
              htmlFor="admin-mode"
              className="flex items-center gap-2 text-sm font-medium cursor-pointer"
            >
              <ShieldCheck className="h-4 w-4" />
              Admin Mode {isAdmin ? "(Enabled)" : "(Disabled)"}
            </label>
          </div>

          {isAdmin && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-700">
              Sign out and sign back in for admin changes to take effect.
            </div>
          )}
          
          <Button 
            variant="destructive" 
            onClick={handleSignOut}
            className="w-full sm:w-auto"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
