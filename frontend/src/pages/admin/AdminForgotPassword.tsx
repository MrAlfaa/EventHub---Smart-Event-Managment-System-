import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Send, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

const AdminForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Please enter your admin email address");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // In a real application, you would make an API call to send a reset link
      // For demo purposes, we'll simulate a successful API call
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
      
      setIsSubmitted(true);
      toast.success("Password reset link sent to your admin email");
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container flex h-screen flex-col items-center justify-center py-10 bg-gray-50">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate("/admin/login")}
            className="flex items-center gap-1 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </Button>
          <div className="text-center flex-grow">
            <h1 className="text-3xl font-bold text-blue-900">Admin Portal</h1>
          </div>
          <div className="w-[60px]"></div> {/* Spacer for centering */}
        </div>
        
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl flex items-center justify-center gap-2">
              <ShieldCheck className="h-6 w-6 text-blue-600" />
              Reset Admin Password
            </CardTitle>
            <CardDescription>
              {isSubmitted 
                ? "Check your email for a password reset link" 
                : "Enter your admin email to reset your password"
              }
            </CardDescription>
          </CardHeader>
          
          {!isSubmitted ? (
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-email">Admin Email</Label>
                  <Input
                    id="admin-email"
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="text-xs text-gray-500">
                  <p>Please note that password reset links are only sent to verified admin email addresses.</p>
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-col space-y-4">
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-white"></span>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Reset Link
                    </>
                  )}
                </Button>
                
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => navigate("/admin/login")}
                >
                  Return to Login
                </Button>
              </CardFooter>
            </form>
          ) : (
            <CardContent className="space-y-6 pb-6">
              <div className="rounded-lg bg-blue-50 p-4 text-center">
                <p className="text-sm text-blue-800">
                  We've sent a password reset link to <strong>{email}</strong>. Please check your inbox and follow the instructions.
                </p>
              </div>
              
              <div className="space-y-4">
                <Button 
                  onClick={() => navigate("/admin/login")} 
                  variant="outline" 
                  className="w-full"
                >
                  Return to Login
                </Button>
                
                <Button 
                  onClick={() => setIsSubmitted(false)} 
                  variant="ghost" 
                  className="w-full"
                >
                  Try a different email
                </Button>
              </div>
              
              <div className="text-center text-xs text-gray-500">
                <p>If you're still having trouble, please contact the system administrator.</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AdminForgotPassword;