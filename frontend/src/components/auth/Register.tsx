import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";
import axios from "axios";
import { 
  User, Briefcase, Eye, EyeOff, ArrowLeft, ArrowRight, 
  Mail, Phone, AtSign, Lock, CheckCircle
} from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { TermsAndConditions } from "@/components/auth/TermsAndConditions";

const Register = () => {
  // Get type from URL query parameter if present
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("type") === "provider" ? "service_provider" : "user";
  const navigate = useNavigate();
  
  // State
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // User form state
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  
  // Service provider form state
  const [providerData, setProviderData] = useState({
    businessName: "",
    email: "",
    phone: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  // Set initial tab based on URL param
  useEffect(() => {
    if (searchParams.get("type") === "provider") {
      setActiveTab("service_provider");
    }
  }, [searchParams]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleUserInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleProviderInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setProviderData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const { register: registerUser, registerServiceProvider } = useAuthStore();

  const validateForm = (isProvider: boolean) => {
    const data = isProvider ? providerData : userData;
    
    if (!data.email || !data.password || !data.confirmPassword || 
        (isProvider && !providerData.businessName) || (!isProvider && !userData.name)) {
      toast.error("Please fill in all required fields");
      return false;
    }
    
    if (data.password !== data.confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }
    
    if (data.password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return false;
    }
    
    return true;
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm(false)) return;
    
    // Show terms and conditions dialog for regular users
    setShowTerms(true);
  };

  const handleProviderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm(true)) return;
    
    // Show terms and conditions dialog
    setShowTerms(true);
    
    // Note: The actual registration will happen in handleTermsAccepted
    // after the user accepts the terms and conditions
  };
  
  // Handle terms acceptance for both user types
  const handleTermsAccepted = async () => {
  // Close the terms dialog
  setShowTerms(false);
  
  setIsSubmitting(true);
  
  if (activeTab === "service_provider") {
    try {
      // Call the registration API
      const result = await registerServiceProvider({
        name: providerData.businessName,
        email: providerData.email,
        phone: providerData.phone,
        username: providerData.username,
        password: providerData.password,
        business_name: providerData.businessName,
        business_description: "Service provider for events",
        service_types: [],
      });
      
      toast.success("Service provider account created successfully! Please complete your profile setup.");
      
      // After successful registration, navigate to the approval form with initial data
      navigate("/provider-approval-form", { 
        state: { 
          initialData: {
            email: providerData.email,
            username: providerData.username,
            phone: providerData.phone
          }
        }
      });
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.detail || "Registration failed. Please check your information.");
      } else {
        toast.error("Registration failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  } else {
    // Regular user registration logic - unchanged
    try {
      await registerUser({
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        username: userData.username,
        password: userData.password
      });
      
      toast.success("Registration successful! Please log in to continue.");
      navigate("/login");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.detail || "Registration failed. Please check your information.");
      } else {
        toast.error("Registration failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }
};

  return (
    <div className="min-h-screen w-full bg-white p-4 sm:p-6 md:p-8 flex items-center justify-center overflow-hidden relative">
      {/* Main content card */}
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-md overflow-hidden z-10 relative">
        {/* Remove the top blue accent color bar */}
        
        <div className="p-6 sm:p-8">
          {/* Header with back button */}
          <div className="flex items-center justify-between mb-6">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate("/login")}
              className="flex items-center gap-1 text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft size={16} />
              <span>Back to Login</span>
            </Button>
            
            <div className="text-sm text-gray-500">
              Already have an account?{" "}
              <Link to="/login" className="font-medium text-blue-600 hover:text-blue-800 transition-colors">
                Sign in
              </Link>
            </div>
          </div>
          
          {/* Title with attractive styling */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-blue-600">
              Create Your Account
            </h1>
            <p className="mt-3 text-gray-600 max-w-xl mx-auto">
              Join EventHub today and get access to the best event planning services in Sri Lanka
            </p>
          </div>

          {/* Enhanced tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="flex w-full mb-8 p-1 bg-gray-100 rounded-xl h-auto">
              <TabsTrigger 
                value="user" 
                className="flex-1 flex items-center justify-center gap-2 py-3 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md rounded-xl transition-all"
              >
                <User className="h-5 w-5" />
                <span className="font-medium">Event Organizer</span>
              </TabsTrigger>
              <TabsTrigger 
                value="service_provider"
                className="flex-1 flex items-center justify-center gap-2 py-3 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md rounded-xl transition-all"
              >
                <Briefcase className="h-5 w-5" />
                <span className="font-medium">Service Provider</span>
              </TabsTrigger>
            </TabsList>
            
            <div className="px-1 md:px-8">
              <TabsContent value="user">
                <form onSubmit={handleUserSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <User className="h-4 w-4 text-blue-500" />
                        Full Name
                      </Label>
                      <Input
                        id="name"
                        value={userData.name}
                        onChange={handleUserInputChange}
                        placeholder="John Doe"
                        className="transition-all focus:ring focus:ring-blue-200 border-gray-300 focus:border-blue-500"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Mail className="h-4 w-4 text-blue-500" />
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={userData.email}
                        onChange={handleUserInputChange}
                        placeholder="john.doe@example.com"
                        className="transition-all focus:ring focus:ring-blue-200 border-gray-300 focus:border-blue-500"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Phone className="h-4 w-4 text-blue-500" />
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        value={userData.phone}
                        onChange={handleUserInputChange}
                        placeholder="+94 77 123 4567"
                        className="transition-all focus:ring focus:ring-blue-200 border-gray-300 focus:border-blue-500"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="username" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <AtSign className="h-4 w-4 text-blue-500" />
                        Username
                      </Label>
                      <Input
                        id="username"
                        value={userData.username}
                        onChange={handleUserInputChange}
                        placeholder="johndoe"
                        className="transition-all focus:ring focus:ring-blue-200 border-gray-300 focus:border-blue-500"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Lock className="h-4 w-4 text-blue-500" />
                        Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={userData.password}
                          onChange={handleUserInputChange}
                          placeholder="••••••••"
                          className="pr-10 transition-all focus:ring focus:ring-blue-200 border-gray-300 focus:border-blue-500"
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
                      <p className="text-xs text-gray-500">
                        Password must be at least 8 characters long
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Lock className="h-4 w-4 text-blue-500" />
                        Confirm Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={userData.confirmPassword}
                          onChange={handleUserInputChange}
                          placeholder="••••••••"
                          className="pr-10 transition-all focus:ring focus:ring-blue-200 border-gray-300 focus:border-blue-500"
                          required
                        />
                        <button
                          type="button"
                          onClick={toggleConfirmPasswordVisibility}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                          tabIndex={-1}
                        >
                          {showConfirmPassword ? (
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
                    className="w-full py-6 mt-6 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 text-lg font-semibold rounded-xl transition transform hover:translate-y-[-2px] hover:shadow-lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-opacity-25 border-t-white"></span>
                        <span>Creating Account...</span>
                      </>
                    ) : (
                      <>
                        <span>Continue Registration</span>
                        <ArrowRight className="h-5 w-5" />
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="service_provider">
                <form onSubmit={handleProviderSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="businessName" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-blue-500" />
                        Business Name
                      </Label>
                      <Input
                        id="businessName"
                        value={providerData.businessName}
                        onChange={handleProviderInputChange}
                        placeholder="Your Business Name"
                        className="transition-all focus:ring focus:ring-blue-200 border-gray-300 focus:border-blue-500"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Mail className="h-4 w-4 text-blue-500" />
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={providerData.email}
                        onChange={handleProviderInputChange}
                        placeholder="business@example.com"
                        className="transition-all focus:ring focus:ring-blue-200 border-gray-300 focus:border-blue-500"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Phone className="h-4 w-4 text-blue-500" />
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        value={providerData.phone}
                        onChange={handleProviderInputChange}
                        placeholder="+94 77 123 4567"
                        className="transition-all focus:ring focus:ring-blue-200 border-gray-300 focus:border-blue-500"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="username" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <AtSign className="h-4 w-4 text-blue-500" />
                        Username
                      </Label>
                      <Input
                        id="username"
                        value={providerData.username}
                        onChange={handleProviderInputChange}
                        placeholder="businessname"
                        className="transition-all focus:ring focus:ring-blue-200 border-gray-300 focus:border-blue-500"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Lock className="h-4 w-4 text-blue-500" />
                        Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={providerData.password}
                          onChange={handleProviderInputChange}
                          placeholder="••••••••"
                          className="pr-10 transition-all focus:ring focus:ring-blue-200 border-gray-300 focus:border-blue-500"
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
                      <p className="text-xs text-gray-500">
                        Password must be at least 8 characters long
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Lock className="h-4 w-4 text-blue-500" />
                        Confirm Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={providerData.confirmPassword}
                          onChange={handleProviderInputChange}
                          placeholder="••••••••"
                          className="pr-10 transition-all focus:ring focus:ring-blue-200 border-gray-300 focus:border-blue-500"
                          required
                        />
                        <button
                          type="button"
                          onClick={toggleConfirmPasswordVisibility}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                          tabIndex={-1}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 mt-6">
                    <p className="font-medium text-blue-800 flex items-center">
                      <CheckCircle className="h-5 w-5 mr-2 text-blue-600" />
                      Important Note for Service Providers
                    </p>
                    <p className="mt-1 text-blue-700 text-sm">
                      After registration, you will need to complete your service provider profile with additional business details.
                      Your account will then be reviewed by our team before approval.
                    </p>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full py-6 mt-6 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 text-lg font-semibold rounded-xl transition transform hover:translate-y-[-2px] hover:shadow-lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-opacity-25 border-t-white"></span>
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <span>Continue Registration</span>
                        <ArrowRight className="h-5 w-5" />
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>

      {/* Terms and Conditions Dialog */}
      <TermsAndConditions 
        isOpen={showTerms}
        onClose={() => setShowTerms(false)}
        onAccept={handleTermsAccepted}
        forServiceProvider={activeTab === "service_provider"}
      />
    </div>
  );
};

export default Register;