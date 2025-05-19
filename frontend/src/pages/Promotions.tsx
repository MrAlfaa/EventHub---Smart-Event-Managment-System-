import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { PromotionResponse } from "@/types/promotion";
import promotionService from "@/services/promotionService";
import { CalendarDays, Copy, CheckCircle } from "lucide-react";

export default function Promotions() {
  const [promotions, setPromotions] = useState<PromotionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        setLoading(true);
        const data = await promotionService.getActivePromotions();
        setPromotions(data);
      } catch (error) {
        console.error("Failed to fetch promotions:", error);
        toast.error("Failed to load promotions. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPromotions();
  }, []);

  const copyPromoCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success("Promo code copied to clipboard!");
    
    // Reset the copied state after 3 seconds
    setTimeout(() => {
      setCopiedCode(null);
    }, 3000);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Special Promotions</h1>
          <p className="text-gray-600">Discover our latest offers and special deals</p>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-700"></div>
          </div>
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
                    src={promo.bannerImage || "https://placehold.co/600x400?text=Promotion"}
                    alt={promo.title}
                    className="w-full h-full object-cover"
                  />
                  {promo.promoCode && (
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-blue-600 text-white text-lg px-3 py-1">
                        SPECIAL OFFER
                      </Badge>
                    </div>
                  )}
                </div>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-semibold mb-2">{promo.title}</h2>
                  <p className="text-gray-600 mb-4">{promo.description}</p>
                  
                  {promo.promoCode && (
                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-500">Promo Code:</span>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => copyPromoCode(promo.promoCode!)}
                          className="flex items-center gap-1"
                        >
                          {promo.promoCode}
                          {copiedCode === promo.promoCode ? 
                            <CheckCircle className="h-4 w-4 text-green-600" /> : 
                            <Copy className="h-4 w-4" />
                          }
                        </Button>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <CalendarDays className="h-4 w-4 mr-1" />
                        Valid until: {formatDate(promo.validUntil)}
                      </div>
                    </div>
                  )}
                  
                  {promo.terms && promo.terms.length > 0 && (
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
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}