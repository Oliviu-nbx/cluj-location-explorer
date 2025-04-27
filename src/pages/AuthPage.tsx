
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { SignInForm } from '@/components/auth/SignInForm';
import { SignUpForm } from '@/components/auth/SignUpForm';

const AuthPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAdmin, isLoading } = useAuth();
  
  const searchParams = new URLSearchParams(location.search);
  const redirectTo = searchParams.get('redirect') || '/';

  useEffect(() => {
    if (isLoading) {
      return;
    }
    
    if (user) {
      console.log('Already logged in, redirecting to', redirectTo);
      
      if (redirectTo.includes('/admin') && !isAdmin) {
        navigate('/', { replace: true });
      } else {
        navigate(redirectTo, { replace: true });
      }
    }
  }, [user, isAdmin, isLoading, navigate, redirectTo]);

  if (isLoading) {
    return (
      <div className="container max-w-md mx-auto my-8 p-6 bg-white rounded-md shadow">
        <div className="flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-center text-gray-500">Checking authentication status...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="container max-w-md mx-auto my-8 p-6 bg-white rounded-md shadow">
        <div className="flex flex-col items-center justify-center space-y-4">
          <p className="text-center text-gray-500">Already signed in. Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-md my-8">
      <Card className="shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Welcome</CardTitle>
          <CardDescription className="text-center">
            Sign in or create an account to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <SignInForm
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                redirectTo={redirectTo}
              />
            </TabsContent>

            <TabsContent value="signup">
              <SignUpForm
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;
