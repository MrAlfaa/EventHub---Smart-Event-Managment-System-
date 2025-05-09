import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ServiceProviderApprovalForm } from "@/components/auth/ServiceProviderApprovalForm";
import { toast } from "sonner";

export default function ProfileSetup() {
  const location = useLocation();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState({
    email: "",
    username: "",
    phone: ""
  });
  
  useEffect(() => {
    // Get data passed from registration page
    if (location.state) {
      setInitialData({
        email: location.state.email || "",
        username: location.state.username || "",
        phone: location.state.phone || ""
      });
    } else {
      // If user navigated directly without state data, redirect to login
      toast.error("Invalid access. Please log in first.");
      navigate("/login");
    }
  }, [location, navigate]);
  
  const handleSubmit = (data: any) => {
    // In a real app, this would make an API call to save the profile data
    console.log("Profile data submitted:", data);
    
    toast.success("Your service provider profile has been submitted for approval!");
    toast.info("Our team will review your application and contact you within 1-2 business days.");
    
    // Redirect after submission
    setTimeout(() => {
      navigate("/login", { 
        state: { 
          message: "Your profile is under review. You'll be notified when it's approved." 
        } 
      });
    }, 2000);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-8 md:py-12">
      <div className="container mx-auto max-w-3xl px-4">
        <h1 className="mb-8 text-center text-3xl font-bold text-blue-800">Complete Your Service Provider Profile</h1>
        
        <ServiceProviderApprovalForm 
          initialData={initialData}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}