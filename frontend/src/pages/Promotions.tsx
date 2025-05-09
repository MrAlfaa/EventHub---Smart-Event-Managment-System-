import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

interface Promotion {
  id: string;
  title: string;
  description: string;
  image: string;
  discount: number;
  validUntil: string;
  code: string;
  terms: string[];
}

export default function Promotions() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  // In a real application, you would fetch this data from your backend
  useEffect(() => {
    // Simulating API call with mock data
    const mockPromotions: Promotion[] = [
      {
        id: "1",
        title: "Early Bird Wedding Package",
        description: "Get 15% off on all wedding packages when you book 6 months in advance",
        image: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486",
        discount: 15,
        validUntil: "2025-12-31",
        code: "EARLY15",
        terms: [
          "Must book at least 6 months before the event date",
          "Valid for all wedding packages",
          "Cannot be combined with other offers",
          "Subject to availability"
        ]
      },
      {
        id: "2",
        title: "Corporate Event Special",
        description: "20% discount on corporate event packages for bookings above 200 guests",
        image: "https://images.unsplash.com/photo-1511578314322-379afb476865",
        discount: 20,
        validUntil: "2025-09-30",
        code: "CORP20",
        terms: [
          "Minimum 200 guests required",
          "Valid for corporate event packages only",
          "Booking must be made 3 months in advance",
          "Subject to venue availability"
        ]
      }
    ];

    setPromotions(mockPromotions);
    setLoading(false);
  }, []);

  const copyPromoCode = (code: string) => {
    navigator.clipboard.writeText(code);
    // In a real app, you would use a proper toast notification
    alert("Promo code copied!");
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Special Promotions</h1>
          <p className="text-gray-600">Discover our latest offers and special deals</p>
        </div>
        
        {loading ? (
          <div className="text-center py-12">Loading promotions...</div>
        ) : promotions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No active promotions at the moment.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {promotions.map((promo) => (
              <Card key={promo.id} className="overflow-hidden">
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={promo.image}
                    alt={promo.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-blue-600 text-white text-lg px-3 py-1">
                      {promo.discount}% OFF
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-semibold mb-2">{promo.title}</h2>
                  <p className="text-gray-600 mb-4">{promo.description}</p>
                  
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-500">Promo Code:</span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => copyPromoCode(promo.code)}
                      >
                        {promo.code}
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500">
                      Valid until: {new Date(promo.validUntil).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Terms & Conditions:</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {promo.terms.map((term, index) => (
                        <li key={index} className="text-sm text-gray-600">
                          {term}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}