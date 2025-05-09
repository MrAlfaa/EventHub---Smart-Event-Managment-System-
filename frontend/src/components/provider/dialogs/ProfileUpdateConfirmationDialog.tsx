import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Save } from "lucide-react";

interface ProfileUpdateConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmText?: string;
  isLoading?: boolean;
}

const ProfileUpdateConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Profile Update",
  description = "Are you sure you want to save these changes to your profile information?",
  confirmText = "Save Changes",
  isLoading = false,
}: ProfileUpdateConfirmationDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-blue-500" />
            <DialogTitle>{title}</DialogTitle>
          </div>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-gray-500">
            Your profile information will be updated based on the changes you've made. 
            This information will be visible to users browsing services on EventHub.
          </p>
        </div>

        <DialogFooter className="gap-2 sm:justify-end">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            onClick={onConfirm}
            disabled={isLoading}
            className={`bg-blue-600 hover:bg-blue-700 ${isLoading ? "opacity-70" : ""}`}
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {confirmText}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileUpdateConfirmationDialog;