import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard, Calendar, Lock, User, X } from "lucide-react";

interface PaymentDetailsFormProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (paymentDetails: any) => void;
  amount: number;
  currency: string;
}

const PaymentDetailsForm: React.FC<PaymentDetailsFormProps> = ({
  isOpen,
  onClose,
  onComplete,
  amount,
  currency
}) => {
  // Form state
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  
  // Error state
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };
  
  // Format expiry date with slash
  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    
    if (v.length > 2) {
      return v.slice(0, 2) + '/' + v.slice(2, 4);
    }
    
    return v;
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!cardNumber.trim()) {
      newErrors.cardNumber = "Card number is required";
    } else if (cardNumber.replace(/\s+/g, '').length !== 16) {
      newErrors.cardNumber = "Card number must be 16 digits";
    }
    
    if (!cardName.trim()) {
      newErrors.cardName = "Name on card is required";
    }
    
    if (!expiryDate.trim()) {
      newErrors.expiryDate = "Expiry date is required";
    } else if (!(/^\d{2}\/\d{2}$/).test(expiryDate)) {
      newErrors.expiryDate = "Invalid expiry date format (MM/YY)";
    }
    
    if (!cvv.trim()) {
      newErrors.cvv = "CVV is required";
    } else if (cvv.length !== 3) {
      newErrors.cvv = "CVV must be 3 digits";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Payment form submitted");
    
    if (validateForm()) {
      console.log("Payment validation successful");
      // Process payment
      onComplete({
        cardNumber: cardNumber.replace(/\s+/g, ''),
        cardName,
        expiryDate,
        lastFourDigits: cardNumber.slice(-4)
      });
    }
  };
  
  // Format currency
  const formatCurrency = (value: number, currency: string) => {
    return `${value.toLocaleString()} ${currency}`;
  };
  
  if (!isOpen) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <CreditCard className="mr-2 h-5 w-5" />
            Payment Details
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Amount to pay */}
          <Card className="bg-blue-50">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Amount to pay:</span>
                <span className="font-bold text-lg text-blue-700">
                  {formatCurrency(amount, currency)}
                </span>
              </div>
            </CardContent>
          </Card>
          
          {/* Payment card */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-5 rounded-xl text-white shadow-lg relative overflow-hidden min-h-[180px]">
            <div className="absolute top-2 right-2">
              <div className="flex space-x-1">
                <div className="h-8 w-12 bg-yellow-400 rounded-md"></div>
                <div className="h-8 w-8 border border-white rounded-full opacity-60"></div>
              </div>
            </div>
            
            <div className="mt-8 flex flex-col space-y-4">
              <div className="flex space-x-1">
                {cardNumber ? (
                  cardNumber.split(' ').map((group, idx) => (
                    <div key={idx} className="text-lg font-mono">
                      {group || '••••'}
                    </div>
                  ))
                ) : (
                  <>
                    <div className="text-lg font-mono">••••</div>
                    <div className="text-lg font-mono">••••</div>
                    <div className="text-lg font-mono">••••</div>
                    <div className="text-lg font-mono">••••</div>
                  </>
                )}
              </div>
              
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-xs opacity-70">Card Holder</div>
                  <div className="font-medium truncate max-w-[150px]">
                    {cardName || 'Your Name'}
                  </div>
                </div>
                
                <div>
                  <div className="text-xs opacity-70">Expires</div>
                  <div className="font-medium">{expiryDate || 'MM/YY'}</div>
                </div>
              </div>
            </div>
            
            {/* Credit card chip */}
            <div className="absolute top-4 left-4">
              <div className="h-8 w-11 bg-gradient-to-br from-yellow-200 to-yellow-400 rounded-md opacity-90"></div>
            </div>
            
            {/* Pattern overlay */}
            <div className="absolute inset-0 opacity-10">
              <div className="h-full w-full bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[length:10px_10px]"></div>
            </div>
          </div>

          {/* Form fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cardNumber" className="flex items-center">
                <CreditCard className="h-4 w-4 mr-1" />
                Card Number
              </Label>
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                maxLength={19}
                className={errors.cardNumber ? "border-red-500" : ""}
              />
              {errors.cardNumber && <p className="text-sm text-red-500">{errors.cardNumber}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cardName" className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                Name on Card
              </Label>
              <Input
                id="cardName"
                placeholder="John Smith"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                className={errors.cardName ? "border-red-500" : ""}
              />
              {errors.cardName && <p className="text-sm text-red-500">{errors.cardName}</p>}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiryDate" className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Expiry Date
                </Label>
                <Input
                  id="expiryDate"
                  placeholder="MM/YY"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                  maxLength={5}
                  className={errors.expiryDate ? "border-red-500" : ""}
                />
                {errors.expiryDate && <p className="text-sm text-red-500">{errors.expiryDate}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cvv" className="flex items-center">
                  <Lock className="h-4 w-4 mr-1" />
                  CVV
                </Label>
                <Input
                  id="cvv"
                  placeholder="123"
                  type="password"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/[^0-9]/g, ''))}
                  maxLength={3}
                  className={errors.cvv ? "border-red-500" : ""}
                />
                {errors.cvv && <p className="text-sm text-red-500">{errors.cvv}</p>}
              </div>
            </div>
          </div>
          
          {/* Form actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="flex items-center"
            >
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button 
              type="submit"
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
            >
              Pay {formatCurrency(amount, currency)}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDetailsForm;