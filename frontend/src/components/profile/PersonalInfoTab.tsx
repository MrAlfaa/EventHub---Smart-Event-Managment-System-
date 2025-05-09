import { useState, useRef } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Edit, Save, User, Mail, Phone, FileImage, MapPin, AlertCircle, Lock } from "lucide-react";
import { toast } from "sonner";
import ProfileUpdateConfirmDialog from "@/components/ui/ProfileUpdateConfirmDialog";

interface UserData {
  name: string;
  email: string;
  phone: string;
  address: string;
  nic: string;
  profileImage?: string;
}

interface PersonalInfoTabProps {
  userData: UserData;
  setUserData: React.Dispatch<React.SetStateAction<UserData>>;
}

export const PersonalInfoTab = ({ userData, setUserData }: PersonalInfoTabProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempUserData, setTempUserData] = useState<UserData>(userData);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Default profile image if none is provided
  const defaultProfileImage = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png";
  
  // Start editing - create a temporary copy of user data
  const startEditing = () => {
    setTempUserData({...userData});
    setIsEditing(true);
  };

  // Cancel editing - revert to original data
  const cancelEditing = () => {
    setTempUserData({...userData});
    setIsEditing(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTempUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle save button click - show confirmation dialog
  const handleSaveClick = () => {
    setShowConfirmDialog(true);
  };

  // Handle confirmed save - update actual user data
  const handleConfirmedSave = () => {
    setUserData(tempUserData);
    setIsEditing(false);
    toast.success("Profile updated successfully");
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            {/* Profile Image - Now locked/non-editable */}
            <div className="relative">
              <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-gray-200">
                <img 
                  src={userData.profileImage || defaultProfileImage} 
                  alt={`${userData.name}'s profile`} 
                  className="h-full w-full object-cover"
                />
                
                {/* Lock icon overlay indicating profile pic cannot be changed */}
                <div className="absolute bottom-0 right-0 bg-gray-700 bg-opacity-70 p-1 rounded-full">
                  <Lock className="h-4 w-4 text-white" />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold">{userData.name}</h2>
              <p className="text-sm text-muted-foreground">Member since January 2024</p>
              <p className="text-xs text-amber-600 mt-1 flex items-center">
                <AlertCircle size={12} className="mr-1" /> Profile picture cannot be changed
              </p>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            {isEditing ? (
              <>
                <Button 
                  variant="outline" 
                  onClick={cancelEditing}
                  className="flex-1 sm:flex-initial"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveClick}
                  className="flex items-center gap-2 flex-1 sm:flex-initial"
                >
                  <Save size={16} />
                  Save Changes
                </Button>
              </>
            ) : (
              <Button 
                variant="outline" 
                onClick={startEditing}
                className="flex items-center gap-2"
              >
                <Edit size={16} />
                Edit Profile
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User size={16} /> Full Name
              </Label>
              <Input 
                id="name" 
                name="name"
                value={isEditing ? tempUserData.name : userData.name} 
                onChange={handleInputChange}
                disabled={!isEditing} 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail size={16} /> Email Address
                <span className="text-xs text-amber-600 flex items-center">
                  <AlertCircle size={12} className="mr-1" /> Cannot be changed
                </span>
              </Label>
              <Input 
                id="email" 
                name="email"
                type="email" 
                value={userData.email} 
                disabled={true}
                className="bg-muted/50" 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone size={16} /> Phone Number
              </Label>
              <Input 
                id="phone" 
                name="phone"
                value={isEditing ? tempUserData.phone : userData.phone} 
                onChange={handleInputChange}
                disabled={!isEditing} 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="nic" className="flex items-center gap-2">
                <FileImage size={16} /> NIC Number
                <span className="text-xs text-amber-600 flex items-center">
                  <AlertCircle size={12} className="mr-1" /> Cannot be changed
                </span>
              </Label>
              <Input 
                id="nic" 
                name="nic"
                value={userData.nic} 
                disabled={true}
                className="bg-muted/50" 
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address" className="flex items-center gap-2">
                <MapPin size={16} /> Address
              </Label>
              <Input 
                id="address" 
                name="address"
                value={isEditing ? tempUserData.address : userData.address} 
                onChange={handleInputChange}
                disabled={!isEditing} 
              />
            </div>
          </div>
          
          <div className="mt-8 border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">NIC Verification</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Your NIC documents have been verified. These documents cannot be changed. 
              Contact support if you need to update your identification documents.
            </p>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <Label htmlFor="nic-front">NIC Front</Label>
                <div className="mt-2 border rounded-md p-2 text-muted-foreground bg-muted/50">
                  NIC Front Image Uploaded
                </div>
              </div>
              <div>
                <Label htmlFor="nic-back">NIC Back</Label>
                <div className="mt-2 border rounded-md p-2 text-muted-foreground bg-muted/50">
                  NIC Back Image Uploaded
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <ProfileUpdateConfirmDialog 
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleConfirmedSave}
        title="Confirm Profile Update"
        description="Are you sure you want to update your profile information? Click Save Changes to confirm."
      />
    </>
  );
};
