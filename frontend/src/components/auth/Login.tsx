import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { AtSign, Eye, EyeOff, Lock, LogIn } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import adminService from "@/services/adminService";

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, isAdmin } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [credentials, setCredentials] = useState({
    email: "",
    password: ""
  });
  
  const [needsSuperAdmin, setNeedsSuperAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  // Check if super admin exists
  useEffect(() => {
    const checkSuperAdmin = async () => {
      try {
        const exists = await adminService.checkSuperAdminExists();
        setNeedsSuperAdmin(!exists);
      } catch (error) {
        console.error("Error checking for super admin:", error);
      } finally {
        setCheckingAdmin(false);
      }
    };
    
    checkSuperAdmin();
  }, []);

  // Handle redirection if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      if (isAdmin) {
        navigate('/admin/dashboard');
      } else {
        navigate('/home');
      }
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!credentials.email || !credentials.password) {
      toast.error("Please enter both email and password");
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log("Login attempt with:", credentials.email);
      const response = await login(credentials);
      console.log("Login response received, user role:", response.user.role);
      
      // Store user data in localStorage for persistence
      localStorage.setItem('eventHub_user', JSON.stringify(response.user));
      
      // Handle navigation based on role
      switch(response.user.role) {
        case 'super_admin':
          console.log("Super admin login detected, navigating to admin dashboard");
          toast.success("Super Admin login successful");
          navigate('/admin/dashboard');
          break;
        case 'admin':
          console.log("Admin login detected, navigating to admin dashboard");
          toast.success("Admin login successful");
          navigate('/admin/dashboard');
          break;
        case 'service_provider':
          console.log("Service provider login detected, navigating to provider dashboard");
          toast.success("Service provider login successful");
          navigate('/provider/dashboard');
          break;
        default:
          console.log("Regular user login detected, navigating to home");
          toast.success("Login successful");
          navigate('/home');
      }
    } catch (error: any) {
      console.error("Login error:", error);
      // Handle specific error cases
      if (error.response?.status === 403) {
        if (error.response?.data?.detail === "Your account is pending approval") {
          toast.error("Your service provider account is pending approval. Please check back later.");
        } else if (error.response?.data?.detail === "Your account application has been rejected") {
          toast.error("Your service provider application has been rejected. Please contact support for more information.");
        } else {
          toast.error(error.response?.data?.detail || "Access denied");
        }
      } else {
        toast.error(error.response?.data?.detail || "Invalid credentials");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // If we're still checking for super admin, show a loading state
  if (checkingAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent mx-auto"></div>
          <p className="text-gray-600">Initializing system...</p>
        </div>
      </div>
    );
  }

  // If we need a super admin, redirect to super admin setup
  if (needsSuperAdmin) {
    navigate('/setup-admin');
    return null;
  }

  return (
    <div className="min-h-screen w-full bg-white p-4 sm:p-6 md:p-8 flex items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md overflow-hidden z-10">
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-blue-600">
              Welcome Back
            </h1>
            <p className="mt-2 text-gray-600">
              Sign in to access your EventHub account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <AtSign className="h-4 w-4 text-blue-500" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={credentials.email}
                onChange={handleInputChange}
                placeholder="your.email@example.com"
                className="transition-all focus:ring focus:ring-blue-200 border-gray-300 focus:border-blue-500"
                required
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Lock className="h-4 w-4 text-blue-500" />
                  Password
                </Label>
                <Link 
                  to="/reset-password" 
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={credentials.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="pr-10 transition-all focus:ring focus:ring-blue-200 border-gray-300 focus:border-blue-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full py-2.5 mt-6 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 text-base font-semibold rounded-lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-opacity-25 border-t-white"></span>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <LogIn className="h-5 w-5" />
                  <span>Sign In</span>
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link to="/register" className="font-medium text-blue-600 hover:text-blue-800 transition-colors">
                Sign up now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
