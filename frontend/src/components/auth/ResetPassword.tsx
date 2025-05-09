import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ArrowLeft, LockKeyhole, Eye, EyeOff, Mail, ArrowRight } from "lucide-react";

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const [isResetEmailSent, setIsResetEmailSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract the token from the URL query params
  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get('token');

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const validatePassword = (password: string) => {
    // Password must be at least 8 characters
    // Must contain at least one uppercase letter, one lowercase letter, and one number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!validatePassword(newPassword)) {
      toast.error("Password must be at least 8 characters and include uppercase, lowercase, and numbers");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // In a real application, you would make an API call to verify the token and update the password
      // For demo purposes, we'll simulate a successful API call
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
      
      setIsPasswordReset(true);
      toast.success("Your password has been reset successfully");
    } catch (error) {
      toast.error("Something went wrong. Please try again or request a new reset link.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendResetLink = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // In a real application, this would send a password reset email
      // For demo purposes, we'll simulate the API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsResetEmailSent(true);
      toast.success("Password reset link sent to your email");
    } catch (error) {
      toast.error("Failed to send reset link. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show password reset request form if there's no token and reset email hasn't been sent
  if (!token && !isResetEmailSent) {
    return (
      <div className="flex h-screen w-full bg-white">
        <div className="hidden lg:flex lg:w-1/2 bg-blue-50 items-center justify-center">
          <div className="w-full max-w-md p-6">
            <img 
              src="https://images.unsplash.com/photo-1555431189-0fabf2667795?q=80&w=1000" 
              alt="Forgot Password" 
              className="rounded-xl shadow-lg w-full object-cover h-96"
            />
            <div className="mt-8 text-center">
              <h2 className="text-3xl font-bold text-blue-900">Forgot Password?</h2>
              <p className="mt-2 text-gray-700">Don't worry, we'll help you recover your account.</p>
            </div>
          </div>
        </div>
        
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md space-y-8">
            <div className="flex items-center mb-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate("/login")}
                className="flex items-center gap-1 text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft size={16} />
                <span>Back to Login</span>
              </Button>
            </div>
            
            <div className="text-center">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Forgot Password</h1>
              <p className="mt-2 text-gray-600">
                Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>
            
            <form onSubmit={handleSendResetLink} className="mt-8 space-y-6">
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
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 py-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-opacity-25 border-t-white"></span>
                    <span>Sending Reset Link...</span>
                  </>
                ) : (
                  <>
                    <span>Send Reset Link</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> For demonstration purposes, you can use any email.
                  In a production environment, you would receive an actual email with a reset link.
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }
  
  // Show confirmation message after sending reset email
  if (isResetEmailSent && !token) {
    return (
      <div className="flex h-screen w-full bg-white">
        <div className="hidden lg:flex lg:w-1/2 bg-blue-50 items-center justify-center">
          <div className="w-full max-w-md p-6">
            <img 
              src="https://images.unsplash.com/photo-1555431189-0fabf2667795?q=80&w=1000" 
              alt="Email Sent" 
              className="rounded-xl shadow-lg w-full object-cover h-96"
            />
            <div className="mt-8 text-center">
              <h2 className="text-3xl font-bold text-blue-900">Check Your Email</h2>
              <p className="mt-2 text-gray-700">We've sent you instructions to reset your password.</p>
            </div>
          </div>
        </div>
        
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md space-y-8">
            <div className="flex items-center mb-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate("/login")}
                className="flex items-center gap-1 text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft size={16} />
                <span>Back to Login</span>
              </Button>
            </div>
            
            <div className="text-center">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Email Sent!</h1>
              <p className="mt-2 text-gray-600">
                We've sent you an email with a link to reset your password.
              </p>
            </div>
            
            <div className="mt-8 space-y-6">
              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <p className="text-green-800 text-sm">
                  Please check your inbox at <strong>{email}</strong> and follow the instructions to reset your password.
                  If you don't see the email, check your spam folder.
                </p>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-blue-800 text-sm">
                  <strong>Demo note:</strong> Since this is a demo application, no actual email is sent.
                  To simulate receiving a reset link, you can use the following link:
                </p>
                <div className="mt-2 p-2 bg-white rounded border border-blue-200">
                  <Link
                    to="/reset-password?token=demo-token-12345"
                    className="text-blue-600 hover:text-blue-800 text-xs break-all"
                  >
                    {window.location.origin}/reset-password?token=demo-token-12345
                  </Link>
                </div>
              </div>
              
              <Button 
                onClick={() => navigate("/login")} 
                variant="outline" 
                className="w-full"
              >
                Return to Login
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If an invalid token is provided, show an error message
  if (!token && !isPasswordReset) {
    return (
      <div className="flex h-screen w-full bg-white">
        <div className="hidden lg:flex lg:w-1/2 bg-blue-50 items-center justify-center">
          <div className="w-full max-w-md p-6">
            <img 
              src="https://images.unsplash.com/photo-1567473030293-2b8e3c2b4bc3?q=80&w=1000" 
              alt="Reset Password Error" 
              className="rounded-xl shadow-lg w-full object-cover h-96"
            />
            <div className="mt-8 text-center">
              <h2 className="text-3xl font-bold text-blue-900">Reset Link Error</h2>
              <p className="mt-2 text-gray-700">Please make sure you're using a valid password reset link.</p>
            </div>
          </div>
        </div>
        
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md space-y-8">
            <div className="flex items-center mb-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate("/login")}
                className="flex items-center gap-1 text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft size={16} />
                <span>Back to Login</span>
              </Button>
            </div>
            
            <div className="text-center">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Invalid Reset Link</h1>
              <p className="mt-2 text-gray-600">This password reset link is invalid or has expired.</p>
            </div>
            
            <div className="mt-8 space-y-6">
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                <p className="text-amber-800 text-sm">
                  Please request a new password reset link to continue.
                </p>
              </div>
              
              <div className="space-y-4">
                <Button 
                  onClick={() => {
                    window.location.href = "/reset-password";
                  }} 
                  variant="outline" 
                  className="w-full"
                >
                  Request New Reset Link
                </Button>
                
                <Button 
                  onClick={() => navigate("/login")} 
                  variant="ghost" 
                  className="w-full"
                >
                  Return to Login
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show the password reset form if a token is provided
  return (
    <div className="flex h-screen w-full bg-white">
      {/* Image section - Left side */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-50 items-center justify-center">
        <div className="w-full max-w-md p-6">
          <img 
            src="https://images.unsplash.com/photo-1614064641938-3bbee52942c7?q=80&w=1000" 
            alt="Reset Password" 
            className="rounded-xl shadow-lg w-full object-cover h-96"
          />
          <div className="mt-8 text-center">
            <h2 className="text-3xl font-bold text-blue-900">Almost there!</h2>
            <p className="mt-2 text-gray-700">{isPasswordReset ? "Your password has been reset successfully." : "Create a new secure password for your account."}</p>
          </div>
        </div>
      </div>

      {/* Form section - Right side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="flex items-center mb-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate("/login")}
              className="flex items-center gap-1 text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft size={16} />
              <span>Back to Login</span>
            </Button>
          </div>
          
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Reset Your Password</h1>
            <p className="mt-2 text-gray-600">
              {isPasswordReset 
                ? "Your password has been reset successfully" 
                : "Create a new password for your account"
              }
            </p>
          </div>

          {!isPasswordReset ? (
            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div>
                <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pr-10"
                    required
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Password must be at least 8 characters and include uppercase, lowercase, and numbers.
                </p>
              </div>

              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pr-10"
                    required
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={toggleConfirmPasswordVisibility}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 py-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-opacity-25 border-t-white"></span>
                    <span>Resetting Password...</span>
                  </>
                ) : (
                  <>
                    <LockKeyhole className="h-4 w-4" />
                    <span>Reset Password</span>
                  </>
                )}
              </Button>
            </form>
          ) : (
            <div className="mt-8 space-y-6">
              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <p className="text-green-800 text-sm">
                  Password reset successful. You can now log in with your new password.
                </p>
              </div>
              
              <Button 
                onClick={() => navigate("/login")} 
                variant="default" 
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Log In
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;