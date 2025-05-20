import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useApp } from "@/providers/AppProvider";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, Building, MapPin, Mail, Phone, User, Briefcase, CreditCard as CreditCardIcon, Upload, Plus, Trash2, Edit2, CalendarRange, Globe, Lock, FileText, IdCard, ChevronDown, X, Check } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import CardConfirmationDialog from "./dialogs/CardConfirmationDialog";
import ProfileUpdateConfirmationDialog from "./dialogs/ProfileUpdateConfirmationDialog";
import { Separator } from "@/components/ui/separator";
import providerService from "@/services/providerService";

// Define service types for dropdown selection
const SERVICE_TYPES = [
  "Hotel",
  "Band",
  "Catering",
  "Photography",
  "Decoration",
  "Transportation",
  "Entertainment",
  "Venue"
];

// Define provinces in Sri Lanka
const SRI_LANKA_PROVINCES = [
  "Western",
  "Central",
  "Southern",
  "Northern",
  "Eastern",
  "North Western",
  "North Central",
  "Uva",
  "Sabaragamuwa"
];

// Define major cities in Sri Lanka by province
const SRI_LANKA_CITIES = {
  "Western": ["Colombo", "Negombo", "Kalutara", "Gampaha", "Moratuwa", "Panadura"],
  "Central": ["Kandy", "Matale", "Nuwara Eliya", "Dambulla", "Gampola"],
  "Southern": ["Galle", "Matara", "Hambantota", "Tangalle", "Ambalangoda"],
  "Northern": ["Jaffna", "Vavuniya", "Kilinochchi", "Mullaitivu", "Point Pedro"],
  "Eastern": ["Trincomalee", "Batticaloa", "Ampara", "Kalmunai", "Kattankudy"],
  "North Western": ["Kurunegala", "Puttalam", "Chilaw", "Kuliyapitiya", "Wariyapola"],
  "North Central": ["Anuradhapura", "Polonnaruwa", "Kekirawa", "Tambuttegama"],
  "Uva": ["Badulla", "Bandarawela", "Monaragala", "Haputale", "Welimada"],
  "Sabaragamuwa": ["Ratnapura", "Kegalle", "Balangoda", "Embilipitiya"]
};

// Flatten all cities for when province is not selected
const ALL_SRI_LANKA_CITIES = Object.values(SRI_LANKA_CITIES).flat().sort();

// Event types for selection
const EVENT_TYPES = [
  { label: "Wedding", value: "wedding" },
  { label: "Birthday", value: "birthday" },
  { label: "Corporate", value: "corporate" },
  { label: "Conference", value: "conference" },
  { label: "Festival", value: "festival" },
  { label: "Anniversary", value: "anniversary" },
  { label: "Graduation", value: "graduation" },
  { label: "Engagement", value: "engagement" },
  { label: "Exhibition", value: "exhibition" },
  { label: "Concert", value: "concert" },
  { label: "Religious", value: "religious" },
  { label: "Other", value: "other" }
];

// Card types for dropdown
const CARD_TYPES = ["Visa", "Mastercard", "American Express"];

// Month options for card expiry
const EXPIRY_MONTHS = Array.from({ length: 12 }, (_, i) => {
  const month = i + 1;
  return { value: month.toString().padStart(2, '0'), label: month.toString().padStart(2, '0') };
});

// Year options for card expiry (current year + 10 years)
const currentYear = new Date().getFullYear();
const EXPIRY_YEARS = Array.from({ length: 11 }, (_, i) => {
  const year = currentYear + i;
  return { value: year.toString(), label: year.toString() };
});

// Card data interface
interface CardDetails {
  id: string;
  cardholderName: string;
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  cardType: string;
  isDefault: boolean;
}

const ProviderProfile = () => {
  const { user, isAuthenticated } = useApp();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [availableCities, setAvailableCities] = useState<string[]>(ALL_SRI_LANKA_CITIES);
  
  // Profile confirmation dialog states
  const [isProfileUpdateDialogOpen, setIsProfileUpdateDialogOpen] = useState(false);
  const [isProfileUpdateProcessing, setIsProfileUpdateProcessing] = useState(false);
  
  // Card management states
  const [cards, setCards] = useState<CardDetails[]>([
    {
      id: "1",
      cardholderName: "Event Masters",
      cardNumber: "4111 1111 1111 1111",
      expiryMonth: "12",
      expiryYear: "2026",
      cvv: "123",
      cardType: "Visa",
      isDefault: true
    }
  ]);
  const [isCardDialogOpen, setIsCardDialogOpen] = useState(false);
  const [currentCard, setCurrentCard] = useState<CardDetails | null>(null);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  
  // Confirmation dialog states
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<string | null>(null);
  const [confirmationAction, setConfirmationAction] = useState<"delete" | "update">("delete");
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Form states - Updated to match ServiceProviderApprovalForm
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [coverPhoto, setCoverPhoto] = useState<File | null>(null);
  const [nicFrontImage, setNicFrontImage] = useState<File | null>(null);
  const [nicBackImage, setNicBackImage] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    // Personal info
    providerName: "John Smith",
    nicNumber: "990123456V",
    
    // Business info
    businessName: "Event Masters Ltd",
    businessRegistrationNumber: "BRN12345678",
    description: "We are a premium service provider specializing in event management and catering services for weddings, corporate events, and private parties.",
    slogan: "Making your special events truly memorable",
    address: "123 Business Street",
    city: "Colombo",
    province: "Western",
    
    // Account info
    username: "eventmasters",
    email: "john@eventmasters.com",
    password: "********",
    
    // Contact info
    phone: "+94 76 123 4567",
    contactEmail: "contact@eventmasters.com",
    contactPhone: "76 123 4567",
    
    // Service details
    serviceTypes: "Hotel",
    serviceLocations: ["Colombo", "Gampaha", "Negombo", "Kandy"],
    coveredEventTypes: ["wedding", "conference", "corporate", "exhibition"],
  });

  // URLs for Profile Images
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>("https://placehold.co/400x400?text=Profile");
  const [coverPhotoUrl, setCoverPhotoUrl] = useState<string | null>("https://placehold.co/1200x400?text=Cover+Photo");
  const [nicFrontImageUrl, setNicFrontImageUrl] = useState<string | null>("https://placehold.co/400x250?text=NIC+Front");
  const [nicBackImageUrl, setNicBackImageUrl] = useState<string | null>("https://placehold.co/400x250?text=NIC+Back");

  // Bank account states
  const [isBankAccountDialogOpen, setIsBankAccountDialogOpen] = useState(false);
  const [bankAccountDetails, setBankAccountDetails] = useState({
    bankName: "Commercial Bank",
    branch: "Colombo Main",
    accountNumber: "1234567890123",
    accountOwner: "John Smith"
  });
  const [tempBankAccountDetails, setTempBankAccountDetails] = useState({
    bankName: "Commercial Bank",
    branch: "Colombo Main",
    accountNumber: "1234567890123",
    accountOwner: "John Smith"
  });

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Please login to view your profile");
      navigate("/login");
      return;
    }
    
    setLoading(true);
    
    // Fetch provider profile data from API
    const fetchProviderProfile = async () => {
      try {
        const profileData = await providerService.getProviderProfile();
        
        // Update form data with profile data
        setFormData({
  providerName: profileData.provider_name || "",
  nicNumber: profileData.nic_number || "",
  businessName: profileData.business_name || "",
  businessRegistrationNumber: profileData.business_registration_number || "",
  description: profileData.business_description || "",
  slogan: profileData.slogan || "",
  address: profileData.address || "",
  city: profileData.city || "",
  province: profileData.province || "",
  username: user?.username || "",
  email: user?.email || profileData.contact_email || "",
  phone: user?.phone || profileData.contact_phone || "",
  contactEmail: profileData.contact_email || "",
  contactPhone: profileData.contact_phone || "",
  serviceTypes: profileData.service_types || "",
  serviceLocations: profileData.service_locations || [],
  coveredEventTypes: profileData.covered_event_types || [],
  password: "********", 
});
        
        // Set image URLs if available
        if (profileData.profile_picture_url) {
          setProfileImageUrl(profileData.profile_picture_url);
        }
        if (profileData.cover_photo_url) {
          setCoverPhotoUrl(profileData.cover_photo_url);
        }
        if (profileData.nic_front_image_url) {
          setNicFrontImageUrl(profileData.nic_front_image_url);
        }
        if (profileData.nic_back_image_url) {
          setNicBackImageUrl(profileData.nic_back_image_url);
        }
        
        // Set bank account details
        setBankAccountDetails({
          bankName: profileData.bank_name || "Commercial Bank",
          branch: profileData.branch_name || "Colombo Main",
          accountNumber: profileData.account_number || "1234567890123",
          accountOwner: profileData.account_owner_name || "John Smith"
        });
        
        // Also update the temp bank details
        setTempBankAccountDetails({
          bankName: profileData.bank_name || "Commercial Bank",
          branch: profileData.branch_name || "Colombo Main",
          accountNumber: profileData.account_number || "1234567890123",
          accountOwner: profileData.account_owner_name || "John Smith"
        });
        
        // Update city availability based on province
        if (profileData.province) {
          setAvailableCities(SRI_LANKA_CITIES[profileData.province as keyof typeof SRI_LANKA_CITIES] || ALL_SRI_LANKA_CITIES);
        }
        
        // Fetch cards
        fetchProviderCards();
        
      } catch (error) {
        console.error("Error fetching provider profile:", error);
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchProviderProfile();
  }, [user, isAuthenticated, navigate]);

  // Add function to fetch provider cards
  const fetchProviderCards = async () => {
    try {
      const cardsData = await providerService.getProviderCards();
      setCards(cardsData);
    } catch (error) {
      console.error("Error fetching provider cards:", error);
      toast.error("Failed to load payment cards");
    }
  };

  // Form handling functions
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };
  
  const handleServiceTypeChange = (value: string) => {
    setFormData(prev => ({ ...prev, serviceTypes: value }));
  };

  // Add functions for handling service locations and event types
  const [isServiceLocationsDropdownOpen, setIsServiceLocationsDropdownOpen] = useState(false);
  const [isCoveredEventTypesDropdownOpen, setIsCoveredEventTypesDropdownOpen] = useState(false);
  const [locationSearchQuery, setLocationSearchQuery] = useState("");
  const [eventTypeSearchQuery, setEventTypeSearchQuery] = useState("");

  const toggleServiceLocation = (location: string) => {
    setFormData(prev => {
      const updatedLocations = prev.serviceLocations.includes(location)
        ? prev.serviceLocations.filter(loc => loc !== location)
        : [...prev.serviceLocations, location];
      return { ...prev, serviceLocations: updatedLocations };
    });
  };

  const toggleCoveredEventType = (eventType: string) => {
    setFormData(prev => {
           const updatedEventTypes = prev.coveredEventTypes.includes(eventType)
        ? prev.coveredEventTypes.filter(type => type !== eventType)
        : [...prev.coveredEventTypes, eventType];
      return { ...prev, coveredEventTypes: updatedEventTypes };
    });
  };

  const handleProvinceChange = (value: string) => {
    setFormData(prev => ({ 
      ...prev, 
      province: value,
      // Reset city if it's not in the newly selected province
      city: SRI_LANKA_CITIES[value as keyof typeof SRI_LANKA_CITIES].includes(prev.city) 
        ? prev.city 
        : ""
    }));
    
    // Update available cities based on selected province
    setAvailableCities(SRI_LANKA_CITIES[value as keyof typeof SRI_LANKA_CITIES]);
  };
  
  const handleCityChange = (value: string) => {
    setFormData(prev => ({ ...prev, city: value }));
  };
  
  // Image handling functions
  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImage(file);
      setProfileImageUrl(URL.createObjectURL(file));
      toast.info("Profile picture selected. Save changes to update.");
    }
  };
  
  const handleCoverPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverPhoto(file);
      setCoverPhotoUrl(URL.createObjectURL(file));
      toast.info("Cover photo selected. Save changes to update.");
    }
  };

  // Save profile changes
  const handleSaveChanges = () => {
    setIsProfileUpdateDialogOpen(true);
  };

  // Confirm profile update with API call
  const confirmProfileUpdate = () => {
    setIsProfileUpdateProcessing(true);
    
    // Prepare data for API
    const updateData = {
      provider_name: formData.providerName,
      business_name: formData.businessName,
      business_description: formData.description,
      slogan: formData.slogan,
      address: formData.address,
      city: formData.city,
      province: formData.province,
      contact_email: formData.contactEmail,
      contact_phone: formData.contactPhone,
      service_locations: formData.serviceLocations,
      covered_event_types: formData.coveredEventTypes,
    };
    
    // API call to update profile
    const updateProfile = async () => {
      try {
        // Handle image uploads first if needed
        if (profileImage) {
          // In a real implementation, we would upload the images and get URLs back
          // For now, just log that we would upload
          console.log("Would upload profile image:", profileImage);
        }
        
        if (coverPhoto) {
          console.log("Would upload cover photo:", coverPhoto);
        }
        
        // Update profile data
        await providerService.updateProviderProfile(updateData);
        
        toast.success("Profile updated successfully");
        setIsEditing(false);
      } catch (error) {
        console.error("Error updating profile:", error);
        toast.error("Failed to update profile");
      } finally {
        setIsProfileUpdateProcessing(false);
        setIsProfileUpdateDialogOpen(false);
      }
    };
    
    updateProfile();
  };

  // Card management functions
  const formatCardNumber = (value: string) => {
    // Remove all non-digit characters
    const cleanValue = value.replace(/\D/g, '');
    
    // Format with spaces every 4 digits
    let formattedValue = '';
    for (let i = 0; i < cleanValue.length; i += 4) {
      formattedValue += cleanValue.slice(i, i + 4) + ' ';
    }
    
    return formattedValue.trim();
  };
  
  // Generate masked card number for display (e.g., **** **** **** 1234)
  const getMaskedCardNumber = (cardNumber: string) => {
    const cleanNumber = cardNumber.replace(/\s/g, '');
    if (cleanNumber.length < 4) return '****';
    
    const lastFourDigits = cleanNumber.slice(-4);
    return `**** **** **** ${lastFourDigits}`;
  };
  
  // Initialize new card form
  const initNewCard = () => {
    setCurrentCard({
      id: Date.now().toString(),
      cardholderName: "",
      cardNumber: "",
      expiryMonth: "",
      expiryYear: "",
      cvv: "",
      cardType: "",
      isDefault: cards.length === 0 // Make default if it's the first card
    });
    setEditingCardId(null);
    setIsCardDialogOpen(true);
  };
  
  // Edit existing card
  const editCard = (cardId: string) => {
    const cardToEdit = cards.find(card => card.id === cardId);
    if (cardToEdit) {
      setCurrentCard({ ...cardToEdit });
      setEditingCardId(cardId);
      setIsCardDialogOpen(true);
    }
  };
  
  // Handle card form input changes
  const handleCardInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    
    if (currentCard) {
      if (id === "cardNumber") {
        setCurrentCard({ ...currentCard, [id]: formatCardNumber(value) });
      } else {
        setCurrentCard({ ...currentCard, [id]: value });
      }
    }
  };
  
  // Handle dropdown changes for card form
  const handleCardSelectChange = (field: string, value: string) => {
    if (currentCard) {
      setCurrentCard({ ...currentCard, [field]: value });
    }
  };
  
  // Request to confirm card update
  const confirmCardUpdate = () => {
    if (!currentCard) return;
    
    // Basic validation
    if (!currentCard.cardholderName || !currentCard.cardNumber || !currentCard.expiryMonth || 
        !currentCard.expiryYear || !currentCard.cvv || !currentCard.cardType) {
      toast.error("Please fill in all card details");
      return;
    }
    
    setConfirmationAction("update");
    setConfirmationDialogOpen(true);
  };
  
  // Actually save card changes after confirmation
  const saveCardChanges = () => {
    if (!currentCard) return;
    
    setIsProcessing(true);
    
    // API call to save card
    const saveCard = async () => {
      try {
        if (editingCardId) {
          // Update existing card
          await providerService.updateProviderCard(editingCardId, currentCard);
          toast.success("Card updated successfully");
        } else {
          // Add new card
          await providerService.addProviderCard(currentCard);
          toast.success("Card added successfully");
        }
        
        // Refresh cards
        fetchProviderCards();
      } catch (error) {
        console.error("Error saving card:", error);
        toast.error("Failed to save card");
      } finally {
        setIsProcessing(false);
        setConfirmationDialogOpen(false);
        setIsCardDialogOpen(false);
      }
    };
    
    saveCard();
  };
  
  // Request to delete card
  const requestDeleteCard = (cardId: string) => {
    // Check if it's the only card
    if (cards.length === 1) {
      toast.error("At least one card is required");
      return;
    }
    
    setCardToDelete(cardId);
    setConfirmationAction("delete");
    setConfirmationDialogOpen(true);
  };
  
  // Actually delete card after confirmation
  const deleteCard = () => {
    if (!cardToDelete) return;
    
    setIsProcessing(true);
    
    // API call to delete card
    const removeCard = async () => {
      try {
        await providerService.deleteProviderCard(cardToDelete);
        toast.success("Card removed successfully");
        
        // Refresh cards
        fetchProviderCards();
      } catch (error) {
        console.error("Error deleting card:", error);
        toast.error("Failed to delete card");
      } finally {
        setIsProcessing(false);
        setConfirmationDialogOpen(false);
        setCardToDelete(null);
      }
    };
    
    removeCard();
  };
  
  // Set a card as default
  const setDefaultCard = (cardId: string) => {
    // API call to set default card
    const updateDefaultCard = async () => {
      try {
        // Find the card
        const cardToUpdate = cards.find(card => card.id === cardId);
        if (cardToUpdate) {
          // Update card with isDefault: true
          await providerService.updateProviderCard(cardId, { ...cardToUpdate, isDefault: true });
          toast.success("Default payment method updated");
          
          // Refresh cards
          fetchProviderCards();
        }
      } catch (error) {
        console.error("Error setting default card:", error);
        toast.error("Failed to update default payment method");
      }
    };
    
    updateDefaultCard();
  };

  // Handle confirmation dialog close
  const handleConfirmationDialogClose = () => {
    setConfirmationDialogOpen(false);
    setCardToDelete(null);
  };

  // Handle confirmation action
  const handleConfirmAction = () => {
    if (confirmationAction === "delete") {
      deleteCard();
    } else {
      saveCardChanges();
    }
  };

  // Bank account handlers
  const openBankAccountDialog = () => {
    setTempBankAccountDetails({...bankAccountDetails});
    setIsBankAccountDialogOpen(true);
  };

  const handleBankAccountInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setTempBankAccountDetails(prev => ({ ...prev, [id]: value }));
  };

  const saveBankAccountDetails = () => {
    // API call to update bank account details
    const updateBankDetails = async () => {
      try {
        await providerService.updateProviderProfile({
          bank_name: tempBankAccountDetails.bankName,
          branch_name: tempBankAccountDetails.branch,
          account_number: tempBankAccountDetails.accountNumber,
          account_owner_name: tempBankAccountDetails.accountOwner
        });
        
        setBankAccountDetails({...tempBankAccountDetails});
        setIsBankAccountDialogOpen(false);
        toast.success("Bank account details updated successfully");
      } catch (error) {
        console.error("Error updating bank details:", error);
        toast.error("Failed to update bank account details");
      }
    };
    
    updateBankDetails();
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-300 border-t-blue-600 mx-auto"></div>
          <p className="mt-4">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Service Provider Profile</h1>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
            <Button onClick={handleSaveChanges}>Save Changes</Button>
          </div>
        )}
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile Information</TabsTrigger>
          <TabsTrigger value="account">Payment Cards</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="space-y-6">
          {/* Cover Photo - Only visible in Profile Information tab */}
          <div className="relative w-full h-64 rounded-lg overflow-hidden bg-gray-200 shadow-md">
            {coverPhotoUrl ? (
              <img 
                src={coverPhotoUrl} 
                alt="Cover" 
                className="w-full h-full object-cover" 
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <span className="text-gray-400">Cover Photo</span>
              </div>
            )}
            
            {/* Cover Photo Upload Button (visible only in edit mode) */}
            {isEditing && (
              <div className="absolute bottom-4 right-4">
                <label htmlFor="coverPhotoUpload" className="cursor-pointer">
                  <div className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors">
                    <Upload className="h-5 w-5" />
                  </div>
                  <input 
                    type="file" 
                    title="Upload Cover Photo"
                    id="coverPhotoUpload" 
                    className="hidden" 
                    onChange={handleCoverPhotoChange}
                    accept="image/*"
                  />
                </label>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column - Profile Picture */}
            <div className="space-y-6">
              {/* Profile Picture Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Profile Picture</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <div className="relative h-40 w-40 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mb-4 border-4 border-white shadow-md">
                    {profileImageUrl ? (
                      <img 
                        src={profileImageUrl} 
                        alt={formData.businessName} 
                        className="h-full w-full object-cover" 
                      />
                    ) : (
                      <span className="text-2xl text-gray-400">SP</span>
                    )}
                    
                    {/* Profile Image Upload Button (visible only in edit mode) */}
                    {isEditing && (
                                            <div className="absolute bottom-0 right-0 left-0 bg-black bg-opacity-50 text-white text-xs py-1 text-center cursor-pointer">
                        <label htmlFor="profileImageUpload" className="cursor-pointer block w-full">
                          Update
                          <input 
                            type="file" 
                            id="profileImageUpload" 
                            className="hidden" 
                            onChange={handleProfileImageChange}
                            accept="image/*"
                          />
                        </label>
                      </div>
                    )}
                  </div>
                  
                  {isEditing ? (
                    <Input 
                      id="providerName"
                      value={formData.providerName}
                      onChange={handleInputChange}
                      className="text-center font-medium"
                    />
                  ) : (
                    <div className="text-lg font-medium text-center">{formData.providerName}</div>
                  )}
                  
                  <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <Briefcase className="h-3 w-3" />
                    {formData.serviceTypes}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Right Column - Information (Categories) */}
            <div className="space-y-6 md:col-span-2">
              {/* 1. Personal Information */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-600" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-0">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label className="text-muted-foreground text-xs">Service Provider Name</Label>
                      {isEditing ? (
                        <Input 
                          id="providerName"
                          value={formData.providerName}
                          onChange={handleInputChange}
                        />
                      ) : (
                        <div className="p-2 border rounded-md bg-gray-50">
                          {formData.providerName}
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-muted-foreground text-xs">NIC Number</Label>
                      {/* NIC Number - Always Read Only */}
                      <div className="p-2 border rounded-md bg-gray-50">
                        {formData.nicNumber}
                      </div>
                      {isEditing && (
                        <p className="text-xs text-muted-foreground">NIC number cannot be edited</p>
                      )}
                    </div>
                  </div>
                  
                  {/* NIC Images - Always Read Only */}
                  <div className="mt-2">
                    <Label className="text-muted-foreground text-xs">NIC Images</Label>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div>
                        <p className="text-xs mb-2 font-medium">Front Side</p>
                        <div className="h-32 bg-gray-200 rounded-md overflow-hidden shadow">
                          {nicFrontImageUrl ? (
                            <img 
                              src={nicFrontImageUrl} 
                              alt="NIC Front" 
                              className="h-full w-full object-contain" 
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <span className="text-sm text-gray-400">NIC Front Image</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs mb-2 font-medium">Back Side</p>
                        <div className="h-32 bg-gray-200 rounded-md overflow-hidden shadow">
                          {nicBackImageUrl ? (
                            <img 
                              src={nicBackImageUrl} 
                              alt="NIC Back" 
                              className="h-full w-full object-contain" 
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <span className="text-sm text-gray-400">NIC Back Image</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    {isEditing && (
                      <p className="text-xs text-muted-foreground mt-2">NIC images cannot be changed</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* 2. Business Information */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-blue-600" />
                    Business Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-0">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-muted-foreground text-xs">Business Name</Label>
                      {isEditing ? (
                        <Input 
                          id="businessName"
                          value={formData.businessName}
                          onChange={handleInputChange}
                        />
                      ) : (
                        <div className="p-2 border rounded-md bg-gray-50">
                          {formData.businessName}
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-muted-foreground text-xs">Business Registration Number</Label>
                      {/* Business Registration Number - Always Read Only */}
                      <div className="p-2 border rounded-md bg-gray-50">
                        {formData.businessRegistrationNumber}
                      </div>
                      {isEditing && (
                        <p className="text-xs text-muted-foreground">Business registration number cannot be edited</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-xs flex items-center gap-1">
                      <FileText className="h-3 w-3" /> Business Description
                    </Label>
                    {isEditing ? (
                      <Textarea 
                        id="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={4}
                      />
                    ) : (
                      <div className="p-2 border rounded-md bg-gray-50 min-h-[100px]">
                        {formData.description}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-xs flex items-center gap-1">
                      <FileText className="h-3 w-3" /> Business Slogan
                    </Label>
                    {isEditing ? (
                      <Input
                        id="slogan"
                        value={formData.slogan}
                        onChange={handleInputChange}
                        placeholder="Your catchy business slogan"
                      />
                    ) : (
                      <div className="p-2 border rounded-md bg-gray-50">
                        {formData.slogan}
                      </div>
                    )}
                  </div>
                  
                  {/* Location */}
                  <div className="space-y-2 pt-2">
                    <Label className="text-muted-foreground text-xs flex items-center gap-1 font-medium">
                      <MapPin className="h-3 w-3" /> Location
                    </Label>
                    <Separator className="my-2" />
                    
                    <div className="space-y-2">
                      <Label className="text-muted-foreground text-xs">Address</Label>
                      {isEditing ? (
                        <Textarea 
                          id="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          rows={2}
                        />
                      ) : (
                        <div className="p-2 border rounded-md bg-gray-50">
                          {formData.address}
                        </div>
                      )}
                    </div>
                    
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-muted-foreground text-xs">Province</Label>
                        {isEditing ? (
                          <Select
                            value={formData.province}
                            onValueChange={handleProvinceChange}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select province" />
                            </SelectTrigger>
                            <SelectContent>
                              {SRI_LANKA_PROVINCES.map(province => (
                                <SelectItem key={province} value={province}>
                                  {province}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="p-2 border rounded-md bg-gray-50">
                            {formData.province}
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label className="text-muted-foreground text-xs">City</Label>
                        {isEditing ? (
                          <Select
                            value={formData.city}
                            onValueChange={handleCityChange}
                            disabled={!formData.province}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder={formData.province ? "Select city" : "Select province first"} />
                            </SelectTrigger>
                            <SelectContent>
                              {availableCities.map(city => (
                                <SelectItem key={city} value={city}>
                                  {city}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="p-2 border rounded-md bg-gray-50">
                            {formData.city}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 3. Service Information */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-blue-600" />
                    Service Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-0">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-xs">Service Type</Label>
                    {/* Service Type - Always Read Only */}
                    <div className="p-2 border rounded-md bg-gray-50">
                      {formData.serviceTypes}
                    </div>
                    {isEditing && (
                      <p className="text-xs text-muted-foreground">Service type cannot be edited</p>
                    )}
                  </div>
                  
                  {/* Service Locations */}
                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-xs flex items-center gap-1">
                      <Globe className="h-3 w-3" /> Service Locations
                    </Label>
                    
                    {isEditing ? (
                      <div className="relative">
                        <div 
                          className="flex min-h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background cursor-pointer"
                          onClick={() => setIsServiceLocationsDropdownOpen(!isServiceLocationsDropdownOpen)}
                        >
                          <div className="flex flex-wrap gap-1">
                            {formData.serviceLocations.length > 0 ? (
                              formData.serviceLocations.map((location, index) => (
                                <Badge key={index} variant="secondary" className="bg-green-100 text-green-700">
                                  {location}
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleServiceLocation(location);
                                    }}
                                    className="ml-1 h-4 w-4 p-0 text-green-700 hover:text-green-900"
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </Badge>
                              ))
                            ) : (
                              <span className="text-muted-foreground">Select locations...</span>
                            )}
                          </div>
                          <div className="ml-2">
                            <ChevronDown className="h-4 w-4" />
                          </div>
                        </div>
                        
                        {isServiceLocationsDropdownOpen && (
                          <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
                            <div className="max-h-60 overflow-y-auto p-2">
                              <div className="sticky top-0 bg-white pb-2 mb-1 border-b border-gray-100">
                                <Input
                                  type="text"
                                  placeholder="Search locations..."
                                  value={locationSearchQuery}
                                  onChange={(e) => setLocationSearchQuery(e.target.value)}
                                  className="border-gray-100"
                                />
                              </div>
                              <div className="space-y-1">
                                {ALL_SRI_LANKA_CITIES
                                  .filter(city => 
                                    city.toLowerCase().includes(locationSearchQuery.toLowerCase())
                                  )
                                  .map(city => (
                                    <div
                                      key={city}
                                      className={`flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer ${
                                        formData.serviceLocations.includes(city) 
                                          ? "bg-green-50 text-green-700"
                                          : "hover:bg-green-50/50"
                                      }`}
                                      onClick={() => toggleServiceLocation(city)}
                                    >
                                      <span className="text-sm">{city}</span>
                                      {formData.serviceLocations.includes(city) && (
                                                                               <Check className="h-4 w-4 text-green-600" />
                                      )}
                                    </div>
                                  ))
                                }
                              </div>
                            </div>
                            <div className="flex items-center justify-between p-2 border-t border-gray-100">
                              <span className="text-sm text-gray-500">{formData.serviceLocations.length} selected</span>
                              <Button 
                                type="button" 
                                variant="outline" 
                                size="sm"
                                onClick={() => setIsServiceLocationsDropdownOpen(false)}
                              >
                                Done
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {formData.serviceLocations.length > 0 ? (
                          formData.serviceLocations.map((location, index) => (
                            <Badge 
                              key={index} 
                              variant="outline" 
                              className="bg-green-50 text-green-700"
                            >
                              {location}
                            </Badge>
                          ))
                        ) : (
                          <div className="text-sm text-gray-400">No service locations selected</div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Covered Event Types */}
                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-xs flex items-center gap-1">
                      <CalendarRange className="h-3 w-3" /> Covered Event Types
                    </Label>
                    
                    {isEditing ? (
                      <div className="relative">
                        <div 
                          className="flex min-h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background cursor-pointer"
                          onClick={() => setIsCoveredEventTypesDropdownOpen(!isCoveredEventTypesDropdownOpen)}
                        >
                          <div className="flex flex-wrap gap-1">
                            {formData.coveredEventTypes.length > 0 ? (
                              formData.coveredEventTypes.map((type, index) => {
                                // Find the corresponding event type object to get the label
                                const eventType = EVENT_TYPES.find(e => e.value === type);
                                return (
                                  <Badge key={index} variant="secondary" className="bg-purple-100 text-purple-700">
                                    {eventType?.label || type.charAt(0).toUpperCase() + type.slice(1)}
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleCoveredEventType(type);
                                      }}
                                      className="ml-1 h-4 w-4 p-0 text-purple-700 hover:text-purple-900"
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </Badge>
                                );
                              })
                            ) : (
                              <span className="text-muted-foreground">Select event types...</span>
                            )}
                          </div>
                          <div className="ml-2">
                            <ChevronDown className="h-4 w-4" />
                          </div>
                        </div>
                        
                        {isCoveredEventTypesDropdownOpen && (
                          <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
                            <div className="max-h-60 overflow-y-auto p-2">
                              <div className="sticky top-0 bg-white pb-2 mb-1 border-b border-gray-100">
                                <Input
                                  type="text"
                                  placeholder="Search event types..."
                                  value={eventTypeSearchQuery}
                                  onChange={(e) => setEventTypeSearchQuery(e.target.value)}
                                  className="border-gray-100"
                                />
                              </div>
                              <div className="space-y-1">
                                {EVENT_TYPES
                                  .filter(eventType => 
                                    eventType.label.toLowerCase().includes(eventTypeSearchQuery.toLowerCase())
                                  )
                                  .map(eventType => (
                                    <div
                                      key={eventType.value}
                                      className={`flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer ${
                                        formData.coveredEventTypes.includes(eventType.value) 
                                          ? "bg-purple-50 text-purple-700"
                                          : "hover:bg-purple-50/50"
                                      }`}
                                      onClick={() => toggleCoveredEventType(eventType.value)}
                                    >
                                      <span className="text-sm">{eventType.label}</span>
                                      {formData.coveredEventTypes.includes(eventType.value) && (
                                        <Check className="h-4 w-4 text-purple-600" />
                                      )}
                                    </div>
                                  ))
                                }
                              </div>
                            </div>
                            <div className="flex items-center justify-between p-2 border-t border-gray-100">
                              <span className="text-sm text-gray-500">{formData.coveredEventTypes.length} selected</span>
                              <Button 
                                type="button" 
                                variant="outline" 
                                size="sm"
                                onClick={() => setIsCoveredEventTypesDropdownOpen(false)}
                              >
                                Done
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {formData.coveredEventTypes.length > 0 ? (
                          formData.coveredEventTypes.map((type, index) => {
                            const eventType = EVENT_TYPES.find(e => e.value === type);
                            return (
                              <Badge 
                                key={index} 
                                variant="outline" 
                                className="bg-purple-50 text-purple-700"
                              >
                                {eventType?.label || type.charAt(0).toUpperCase() + type.slice(1)}
                              </Badge>
                            );
                          })
                        ) : (
                          <div className="text-sm text-gray-400">No event types selected</div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* 4. Account Information */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-600" />
                    Account Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-0">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1 text-muted-foreground text-xs">
                        <User className="h-3 w-3" /> Username
                      </Label>
                      <div className="p-2 border rounded-md bg-gray-50">
                        {formData.username}
                      </div>
                      {isEditing && (
                        <p className="text-xs text-muted-foreground">Username cannot be edited</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1 text-muted-foreground text-xs">
                        <Mail className="h-3 w-3" /> Email
                      </Label>
                      {/* Account Email - Always Read Only */}
                      <div className="p-2 border rounded-md bg-gray-50">
                        {formData.email}
                      </div>
                      {isEditing && (
                        <p className="text-xs text-muted-foreground">Account email cannot be edited</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1 text-muted-foreground text-xs">
                        <Phone className="h-3 w-3" /> Phone
                      </Label>
                      {/* Account Phone - Always Read Only */}
                      <div className="p-2 border rounded-md bg-gray-50">
                        {formData.phone}
                      </div>
                      {isEditing && (
                        <p className="text-xs text-muted-foreground">Account phone cannot be edited</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1 text-muted-foreground text-xs">
                        <Lock className="h-3 w-3" /> Password
                      </Label>
                      <div className="p-2 border rounded-md bg-gray-50">
                        ********
                      </div>
                      <Button variant="link" className="text-xs h-auto p-0">
                        Change Password
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 5. Contact Information */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-blue-600" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-0">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1 text-muted-foreground text-xs">
                        <Phone className="h-3 w-3" /> Phone Number
                      </Label>
                      {isEditing ? (
                        <Input 
                          id="contactPhone"
                          value={formData.contactPhone}
                          onChange={handleInputChange}
                        />
                      ) : (
                        <div className="p-2 border rounded-md bg-gray-50">
                          {formData.contactPhone}
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">This phone number will be visible to customers</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1 text-muted-foreground text-xs">
                        <Mail className="h-3 w-3" /> Contact Email
                      </Label>
                      {isEditing ? (
                        <Input 
                          id="contactEmail"
                          type="email"
                          value={formData.contactEmail}
                          onChange={handleInputChange}
                        />
                      ) : (
                        <div className="p-2 border rounded-md bg-gray-50">
                          {formData.contactEmail}
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">This email will be visible to customers</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="account" className="space-y-6">
          {/* Cards Management */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center">
                <div className="mr-4 p-2 bg-blue-100 rounded-md">
                  <CreditCardIcon className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Payment Cards</CardTitle>
              </div>
              {cards.length < 3 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={initNewCard}
                  className="flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" /> Add Card
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {cards.length === 0 ? (
                <div className="text-center py-8">
                  <CreditCardIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No payment cards</h3>
                  <p className="text-sm text-gray-500 mt-1">Add at least one card to receive payments</p>
                  <Button 
                    className="mt-4"
                    onClick={initNewCard}
                  >
                    Add Your First Card
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {cards.map(card => (
                    <div 
                      key={card.id} 
                      className={`p-4 border rounded-lg relative ${
                        card.isDefault ? 'border-blue-500 bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-6 bg-gray-100 flex items-center justify-center rounded border">
                            {card.cardType === "Visa" && <span className="font-bold text-blue-800 text-xs">VISA</span>}
                            {card.cardType === "Mastercard" && <span className="font-bold text-red-600 text-xs">MC</span>}
                            {card.cardType === "American Express" && <span className="font-bold text-blue-600 text-xs">AMEX</span>}
                          </div>
                          <div>
                            <div className="font-medium">{card.cardholderName}</div>
                            <div className="text-sm text-gray-500">{getMaskedCardNumber(card.cardNumber)}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0" 
                            onClick={() => editCard(card.id)}
                          >
                            <Edit2 className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button 
                                                        variant="ghost" 
                            size="sm"
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => requestDeleteCard(card.id)}
                            disabled={cards.length <= 1}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-3">
                        <div className="text-sm text-gray-500">
                          Expires: {card.expiryMonth}/{card.expiryYear.slice(2)}
                        </div>
                        {!card.isDefault && (
                          <Button 
                            variant="link" 
                            size="sm" 
                            className="text-xs h-auto p-0"
                            onClick={() => setDefaultCard(card.id)}
                          >
                            Set as default
                          </Button>
                        )}
                        {card.isDefault && (
                          <span className="text-xs bg-blue-100 text-blue-800 py-1 px-2 rounded">
                            Default
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  {cards.length < 3 && (
                    <div className="text-center pt-2">
                      <p className="text-sm text-gray-500">
                        You can add up to {3 - cards.length} more card{3 - cards.length > 1 ? 's' : ''}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bank Account Details */}
          <Card>
            <CardHeader className="flex flex-row items-center">
              <div className="flex items-center">
                <div className="mr-4 p-2 bg-green-100 rounded-md">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>Bank Account Details</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Bank Name</div>
                  <div className="font-medium">{bankAccountDetails.bankName}</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Branch</div>
                  <div className="font-medium">{bankAccountDetails.branch}</div>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Account Number</div>
                  <div className="font-medium">{bankAccountDetails.accountNumber}</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Account Owner</div>
                  <div className="font-medium">{bankAccountDetails.accountOwner}</div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={openBankAccountDialog}>
                  <Edit2 className="h-4 w-4" /> Edit Bank Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Card Dialog */}
      <Dialog open={isCardDialogOpen} onOpenChange={setIsCardDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingCardId ? "Edit Card" : "Add New Card"}</DialogTitle>
            <DialogDescription>
              {editingCardId 
                ? "Update your card information below."
                : "Enter your card details to add a new payment method."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cardholderName">Cardholder Name</Label>
              <Input
                id="cardholderName"
                value={currentCard?.cardholderName || ""}
                onChange={handleCardInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                value={currentCard?.cardNumber || ""}
                onChange={handleCardInputChange}
                maxLength={19} // 16 digits + 3 spaces
                placeholder="1234 5678 9012 3456"
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Expiry Month</Label>
                <Select
                  value={currentCard?.expiryMonth}
                  onValueChange={(value) => handleCardSelectChange("expiryMonth", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="MM" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPIRY_MONTHS.map(month => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Expiry Year</Label>
                <Select
                  value={currentCard?.expiryYear}
                  onValueChange={(value) => handleCardSelectChange("expiryYear", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="YYYY" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPIRY_YEARS.map(year => (
                      <SelectItem key={year.value} value={year.value}>
                        {year.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  type="text"
                  inputMode="numeric"
                  value={currentCard?.cvv || ""}
                  onChange={handleCardInputChange}
                  maxLength={4}
                  placeholder="123"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Card Type</Label>
              <Select
                value={currentCard?.cardType}
                onValueChange={(value) => handleCardSelectChange("cardType", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select card type" />
                </SelectTrigger>
                <SelectContent>
                  {CARD_TYPES.map(type => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {!editingCardId && cards.length > 0 && (
              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  title="Set as default payment method"
                  id="isDefault"
                  checked={currentCard?.isDefault || false}
                  onChange={(e) => {
                    if (currentCard) {
                      setCurrentCard({
                        ...currentCard,
                        isDefault: e.target.checked
                      });
                    }
                  }}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="isDefault" className="text-sm font-normal">
                  Set as default payment method
                </Label>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCardDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmCardUpdate}>
              {editingCardId ? "Update Card" : "Add Card"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Confirmation Dialog */}
      <CardConfirmationDialog
        isOpen={confirmationDialogOpen}
        onClose={handleConfirmationDialogClose}
        onConfirm={handleConfirmAction}
        title={confirmationAction === "delete" ? "Delete Card" : "Confirm Card Update"}
        description={
          confirmationAction === "delete"
            ? "Are you sure you want to remove this card? This action cannot be undone."
            : "Please confirm that you want to update your card information."
        }
        confirmText={confirmationAction === "delete" ? "Delete" : "Confirm"}
        type={confirmationAction}
        isLoading={isProcessing}
      />
      
      {/* Profile Update Confirmation Dialog */}
      <ProfileUpdateConfirmationDialog
        isOpen={isProfileUpdateDialogOpen}
        onClose={() => setIsProfileUpdateDialogOpen(false)}
        onConfirm={confirmProfileUpdate}
        isLoading={isProfileUpdateProcessing}
      />

      {/* Bank Account Dialog */}
      <Dialog open={isBankAccountDialogOpen} onOpenChange={setIsBankAccountDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Bank Account</DialogTitle>
            <DialogDescription>
              Update your bank account details below.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="bankName">Bank Name</Label>
              <Input
                id="bankName"
                value={tempBankAccountDetails.bankName}
                onChange={handleBankAccountInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="branch">Branch</Label>
              <Input
                id="branch"
                value={tempBankAccountDetails.branch}
                onChange={handleBankAccountInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="accountNumber">Account Number</Label>
              <Input
                id="accountNumber"
                value={tempBankAccountDetails.accountNumber}
                onChange={handleBankAccountInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="accountOwner">Account Owner</Label>
              <Input
                id="accountOwner"
                value={tempBankAccountDetails.accountOwner}
                onChange={handleBankAccountInputChange}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBankAccountDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveBankAccountDetails}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProviderProfile;




