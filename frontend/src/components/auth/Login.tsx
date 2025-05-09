import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useApp } from "@/providers/AppProvider";
import { Eye, EyeOff, LogIn, Mail, Lock, UserCircle } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

// Temporary credentials for testing (would be removed in real application)
const TEMP_SERVICE_PROVIDER = {
  email: "serv@gmail.com",
  password: "serv123",
};

const TEMP_ADMIN = {
  email: "admin@example.com",
  password: "admin",
};

const TEMP_USER = {
  email: "user@example.com",
  password: "password",
};

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useApp();
  const { isAuthenticated, isAdmin, login: zustandLogin } = useAuthStore();
  
  // If user is already authenticated, redirect them
  useEffect(() => {
    if (isAuthenticated) {
      if (isAdmin) {
        navigate("/admin/dashboard");
      } else {
        navigate("/home");
      }
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // In a real application, you would make an API call to authenticate
      // and the backend would determine the user role
      // For demo purposes, we'll simulate login with hardcoded credentials

      // Check if admin
      if (email === TEMP_ADMIN.email && password === TEMP_ADMIN.password) {
        // Create admin user object
        const mockAdminUser = {
          id: "admin-1",
          name: "Admin User",
          username: "admin",
          email: email,
          phone: "+94 77 123 0000",
          role: "admin" as const,
        };
        
        // Login with both authentication systems
        zustandLogin(mockAdminUser);
        login(email, "admin");
        
        // Store admin login state in localStorage to persist across refreshes
        localStorage.setItem('eventHub_user', JSON.stringify(mockAdminUser));
        
        toast.success("Admin login successful");
        navigate("/admin/dashboard");
        return;
      }
      
      // Check if service provider
      if (email === TEMP_SERVICE_PROVIDER.email && password === TEMP_SERVICE_PROVIDER.password) {
        login(email, "service_provider");
        toast.success("Service provider login successful");
        navigate("/provider/dashboard");
        return;
      }
      
      // Default to regular user login
      if (email === TEMP_USER.email && password === TEMP_USER.password) {
        login(email, "user");
        toast.success("Login successful");
        navigate("/home");
        return;
      }
      
      // If no matching credentials
      toast.error("Invalid email or password");
      
    } catch (error) {
      toast.error("Authentication failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sentences to display in the rotating text
  const sentences = [
    "Plan your perfect event with our trusted service providers",
    "Discover top-rated venues and event organizers all in one place",
    "Create memorable celebrations with our seamless booking platform",
    "Connect with Sri Lanka's best event planning professionals",
    "Your event journey begins here - simple, secure, and stress-free"
  ];
  
  const [currentSentence, setCurrentSentence] = useState(0);
  const [fadeState, setFadeState] = useState("fade-in");
  const sentenceInterval = useRef<NodeJS.Timeout | null>(null);

  // Set up the sentence rotation
  useEffect(() => {
    if (sentenceInterval.current) {
      clearInterval(sentenceInterval.current);
    }
    
    sentenceInterval.current = setInterval(() => {
      setFadeState("fade-out");
      
      // Change the sentence after fade out animation completes
      setTimeout(() => {
        setCurrentSentence((prev) => (prev + 1) % sentences.length);
        setFadeState("fade-in");
      }, 1000); // 1s for fade out
      
    }, 5000); // Change every 5 seconds
    
    return () => {
      if (sentenceInterval.current) {
        clearInterval(sentenceInterval.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen w-full flex">
      {/* Left side with background image and rotating sentences */}
      <div className="hidden md:flex md:w-1/2 relative bg-blue-600">
        <img 
          src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1000"
          alt="EventHub Events" 
          className="h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">EventHub</h1>
            <div className="h-1 w-20 bg-white mx-auto"></div>
          </div>
          
          <div className="h-24 flex items-center justify-center">
            <p 
              className={`text-2xl text-center text-white font-medium max-w-md transition-opacity duration-1000 ${
                fadeState === "fade-in" ? "opacity-100" : "opacity-0"
              }`}
            >
              {sentences[currentSentence]}
            </p>
          </div>
        </div>
      </div>
      
      {/* Right side with sign in form */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-white px-4 py-8">
        <div className="w-full max-w-md">
          <div className="bg-white p-6 sm:p-8 rounded-xl shadow-md border border-blue-50">
            {/* Logo and heading */}
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <UserCircle className="h-12 w-12 text-blue-600" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-blue-800 mb-2">
                Welcome Back
              </h1>
              <p className="text-gray-700">Sign in to continue to your dashboard</p>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-6 mt-8">
              <div className="space-y-5">
                {/* Email field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Mail className="h-5 w-5 text-blue-400" />
                    </div>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 border-blue-100 focus:border-blue-400 focus:ring-blue-200"
                      required
                    />
                  </div>
                </div>

                {/* Password field */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <Link 
                      to="/reset-password" 
                      className="text-xs font-medium text-blue-600 hover:text-blue-800"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Lock className="h-5 w-5 text-blue-400" />
                    </div>
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 border-blue-100 focus:border-blue-400 focus:ring-blue-200"
                      required
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
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
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 py-6 rounded-lg text-lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-opacity-25 border-t-white"></span>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="h-5 w-5" />
                    <span>Sign in</span>
                  </>
                )}
              </Button>

              <div className="flex items-center justify-center mt-6">
                <div className="text-sm text-gray-700">
                  Don't have an account?{" "}
                  <Link
                    to="/register"
                    className="font-medium text-blue-600 hover:text-blue-800"
                  >
                    Create an account
                  </Link>
                </div>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
