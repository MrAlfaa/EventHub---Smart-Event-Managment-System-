import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";

interface TermsAndConditionsProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  forServiceProvider?: boolean;
}

export function TermsAndConditions({
  isOpen,
  onClose,
  onAccept,
  forServiceProvider = false,
}: TermsAndConditionsProps) {
  const [accepted, setAccepted] = useState(false);

  const handleAccept = () => {
    if (accepted) {
      onAccept();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Terms and Conditions</DialogTitle>
          <DialogDescription>
            Please read and accept our terms and conditions to continue.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4 text-sm">
            <h3 className="font-bold">1. Introduction</h3>
            <p>
              Welcome to EventHub. These Terms and Conditions govern your use of our platform
              and the services we offer. By accessing or using our service, you agree to be bound
              by these Terms.
            </p>

            <h3 className="font-bold">2. Definitions</h3>
            <p>
              "Platform" refers to the EventHub website and application.
              "User" refers to anyone who uses our platform.
              {forServiceProvider
                ? '"Service Provider" refers to businesses or individuals who offer event-related services through our platform.'
                : '"Customer" refers to users who book services through our platform.'}
            </p>

            <h3 className="font-bold">3. Account Registration</h3>
            <p>
              To use our services, you must create an account with accurate and complete information.
              You are responsible for maintaining the confidentiality of your account credentials
              and for all activities that occur under your account.
            </p>

            {forServiceProvider && (
              <>
                <h3 className="font-bold">4. Service Provider Specific Terms</h3>
                <p>
                  As a Service Provider, you agree to:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Provide accurate and up-to-date information about your business and services.</li>
                  <li>Submit valid identification and business registration documents for verification.</li>
                  <li>Wait for admin approval before your listing becomes active on the platform.</li>
                  <li>Maintain high standards of service quality and customer satisfaction.</li>
                  <li>Honor all bookings and commitments made through the platform.</li>
                  <li>Pay applicable platform fees and commissions as outlined in our fee structure.</li>
                </ul>
                
                <h3 className="font-bold">5. Approval Process</h3>
                <p>
                  All Service Provider accounts are subject to approval by our admin team. We reserve
                  the right to reject applications that do not meet our standards or requirements.
                  The approval process may take up to 7 business days, and we may request additional
                  information or documentation.
                </p>
                
                <h3 className="font-bold">6. Intellectual Property</h3>
                <p>
                  By uploading content to our platform, you grant EventHub a non-exclusive, 
                  worldwide, royalty-free license to use, reproduce, adapt, and publish that content
                  for the purpose of displaying your service listing and promoting your services.
                </p>
              </>
            )}

            <h3 className="font-bold">{forServiceProvider ? "7" : "4"}. Prohibited Activities</h3>
            <p>
              Users are prohibited from:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Violating any applicable laws or regulations.</li>
              <li>Impersonating another person or entity.</li>
              <li>Posting false, misleading, or deceptive content.</li>
              <li>Attempting to gain unauthorized access to our systems.</li>
              <li>Using the platform for any illegal or harmful activities.</li>
            </ul>

            <h3 className="font-bold">{forServiceProvider ? "8" : "5"}. Limitation of Liability</h3>
            <p>
              EventHub is not responsible for the quality, safety, or legality of services offered
              by Service Providers on our platform. We do not guarantee the accuracy or completeness
              of information provided by users or Service Providers.
            </p>

            <h3 className="font-bold">{forServiceProvider ? "9" : "6"}. Termination</h3>
            <p>
              We reserve the right to suspend or terminate your account at any time for violations
              of these Terms or for any other reason at our discretion.
            </p>

            <h3 className="font-bold">{forServiceProvider ? "10" : "7"}. Changes to Terms</h3>
            <p>
              We may update these Terms from time to time. Continued use of our platform after
              such changes constitutes your acceptance of the new Terms.
            </p>

            <h3 className="font-bold">{forServiceProvider ? "11" : "8"}. Contact Information</h3>
            <p>
              If you have any questions about these Terms, please contact us at support@eventhub.com.
            </p>

            <p className="font-semibold pt-4">
              Last Updated: May 6, 2025
            </p>
          </div>
        </ScrollArea>

        <DialogFooter className="flex-col gap-3 sm:flex-row sm:justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="terms" 
              checked={accepted}
              onCheckedChange={(checked) => setAccepted(checked === true)}
            />
            <label
              htmlFor="terms"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I have read and agree to the terms and conditions
            </label>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleAccept} disabled={!accepted}>
              Accept & Continue
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}