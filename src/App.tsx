
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import "./App.css";
import AdminLayout from "./layouts/AdminLayout";
import MainLayout from "./layouts/MainLayout";
import LocationsPage from "./pages/admin/LocationsPage";
import CategoriesPage from "./pages/admin/CategoriesPage";
import ScrapingPage from "./pages/admin/ScrapingPage";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/HomePage";  // Placeholder until AboutPage is created
import ContactPage from "./pages/HomePage";  // Placeholder until ContactPage is created
import ProfilePage from "./pages/ProfilePage";
import AuthPage from "./pages/AuthPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import { AuthProvider } from '@/components/AuthContext';
import { AdminProtectedRoute } from '@/components/admin/AdminProtectedRoute';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Toaster />
        <RouterProvider router={createRouter()} />
      </AuthProvider>
    </QueryClientProvider>
  );
}

function createRouter() {
  return createBrowserRouter([
    {
      path: "/",
      element: <MainLayout />,
      children: [
        {
          path: "/",
          element: <HomePage />,
        },
        {
          path: "/about",
          element: <AboutPage />,
        },
        {
          path: "/contact",
          element: <ContactPage />,
        },
        {
          path: "/profile",
          element: <ProfilePage />,
        },
      ],
    },
    {
      path: "/auth",
      element: <AuthPage />,
    },
    {
      path: "/admin",
      element: (
        <AdminLayout>
          <AdminProtectedRoute>
            <Navigate to="/admin/locations" replace />
          </AdminProtectedRoute>
        </AdminLayout>
      ),
    },
    {
      path: "/admin/locations",
      element: (
        <AdminLayout>
          <AdminProtectedRoute>
            <LocationsPage />
          </AdminProtectedRoute>
        </AdminLayout>
      ),
    },
    {
      path: "/admin/categories",
      element: (
        <AdminLayout>
          <AdminProtectedRoute>
            <CategoriesPage />
          </AdminProtectedRoute>
        </AdminLayout>
      ),
    },
    {
      path: "/admin/scraping",
      element: (
        <AdminLayout>
          <AdminProtectedRoute>
            <ScrapingPage />
          </AdminProtectedRoute>
        </AdminLayout>
      ),
    },
    // Auth routes
    {
      path: "/auth/login",
      element: <LoginPage />
    },
    {
      path: "/auth/register",
      element: <RegisterPage />
    },
  ]);
}
