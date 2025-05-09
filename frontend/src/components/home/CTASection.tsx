
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function CTASection() {
  return (
    <section className="bg-gradient-to-r from-blue-800 to-blue-600 py-16 text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="mb-4 text-3xl font-bold">Ready to Plan Your Perfect Event?</h2>
        <p className="mb-8 text-lg text-blue-100">
          Join thousands of users who have successfully found their ideal service providers
        </p>
        <div className="flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
          <Link to="/service-providers">
            <Button size="lg" className="bg-white text-blue-800 hover:bg-blue-50">
              Find Service Providers
            </Button>
          </Link>
          <Link to="/register">
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              Create Account
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
