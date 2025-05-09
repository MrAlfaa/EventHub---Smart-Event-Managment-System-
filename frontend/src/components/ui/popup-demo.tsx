import { useState } from "react";
import { EyeCatchingPopup } from "./eye-catching-popup";
import { Button } from "./button";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export const PopupDemo = () => {
  const [isBasicPopupOpen, setIsBasicPopupOpen] = useState(false);
  const [isSuccessPopupOpen, setIsSuccessPopupOpen] = useState(false);
  const [isAlertPopupOpen, setIsAlertPopupOpen] = useState(false);

  const basicContent = (
    <div className="space-y-4">
      <p className="text-zinc-700 dark:text-zinc-300">
        This is a clean, minimal popup design that's eye-catching without using multiple colors or gradients.
        It features subtle animations and shadows for a modern look.
      </p>
      <div className="flex justify-end">
        <Button onClick={() => setIsBasicPopupOpen(false)}>Got it</Button>
      </div>
    </div>
  );

  const successContent = (
    <div className="space-y-4">
      <div className="flex items-center space-x-3 mb-3">
        <CheckCircle2 className="h-8 w-8 text-emerald-500" />
        <p className="text-lg font-medium">Payment Successful</p>
      </div>
      <p className="text-zinc-700 dark:text-zinc-300">
        Your booking has been confirmed. You'll receive a confirmation email shortly with all the details.
      </p>
      <div className="flex justify-end pt-2">
        <Button onClick={() => setIsSuccessPopupOpen(false)}>Continue</Button>
      </div>
    </div>
  );

  const alertContent = (
    <div className="space-y-4">
      <div className="flex items-center space-x-3 mb-3">
        <AlertCircle className="h-8 w-8 text-amber-500" />
        <p className="text-lg font-medium">Session Expiring</p>
      </div>
      <p className="text-zinc-700 dark:text-zinc-300">
        Your session is about to expire in 2 minutes. Would you like to extend your session?
      </p>
      <div className="flex justify-end space-x-2 pt-2">
        <Button variant="outline" onClick={() => setIsAlertPopupOpen(false)}>
          Log out
        </Button>
        <Button onClick={() => setIsAlertPopupOpen(false)}>
          Extend Session
        </Button>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold mb-6">Eye-Catching Popup Examples</h2>
      
      <div className="flex flex-wrap gap-4">
        <Button onClick={() => setIsBasicPopupOpen(true)}>
          Basic Popup
        </Button>
        
        <Button onClick={() => setIsSuccessPopupOpen(true)}>
          Success Popup
        </Button>
        
        <Button onClick={() => setIsAlertPopupOpen(true)}>
          Alert Popup
        </Button>
      </div>

      {/* Popups */}
      <EyeCatchingPopup
        title="Welcome to EventHub"
        content={basicContent}
        isOpen={isBasicPopupOpen}
        onClose={() => setIsBasicPopupOpen(false)}
      />
      
      <EyeCatchingPopup
        title="Booking Confirmation"
        content={successContent}
        isOpen={isSuccessPopupOpen}
        onClose={() => setIsSuccessPopupOpen(false)}
      />
      
      <EyeCatchingPopup
        title="Attention Required"
        content={alertContent}
        isOpen={isAlertPopupOpen}
        onClose={() => setIsAlertPopupOpen(false)}
      />
    </div>
  );
};