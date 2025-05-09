import { Button } from "@/components/ui/button";
import { Calendar, ShoppingCart, PlusCircle } from "lucide-react";

interface QuickActionsProps {
  onAddToCart: () => void;
  onBookNow: () => void;
}

export const QuickActions = ({ onAddToCart, onBookNow }: QuickActionsProps) => {
  return (
    <div className="mt-4 sm:mt-6 rounded-lg border bg-white p-4 sm:p-6 shadow-sm">
      <h2 className="mb-3 sm:mb-4 text-lg font-semibold">Quick Actions</h2>
      <div className="space-y-3">
        <Button variant="outline" className="w-full justify-start text-sm sm:text-base" onClick={onAddToCart}>
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </Button>
        <Button className="w-full justify-start text-sm sm:text-base" onClick={onBookNow}>
          <Calendar className="mr-2 h-4 w-4" />
          Book Now
        </Button>
        <Button variant="secondary" className="w-full justify-start text-sm sm:text-base">
          <PlusCircle className="mr-2 h-4 w-4" />
          View Packages
        </Button>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center">
            <p className="text-sm text-gray-600">Response Rate</p>
            <p className="font-semibold">98%</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Avg. Response</p>
            <p className="font-semibold">2 hours</p>
          </div>
        </div>
      </div>
    </div>
  );
};
