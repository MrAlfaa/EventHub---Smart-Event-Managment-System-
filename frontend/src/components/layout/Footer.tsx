import { Facebook, Instagram, Mail, MapPin, Phone, Twitter, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useApp } from "@/providers/AppProvider";

export function Footer() {
  const { isAuthenticated } = useApp();
  
  return (
    <footer className="bg-blue-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="mb-4 text-xl font-bold">EventHub</h3>
            <p className="mb-4 text-blue-100">
              Your one-stop platform for finding and booking event services. Connect with the best service providers for your special occasions.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-blue-200 hover:text-white">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-blue-200 hover:text-white">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-blue-200 hover:text-white">
                <Instagram size={20} />
              </a>
            </div>
            
            {!isAuthenticated && (
              <div className="mt-6">
                <Link to="/register">
                  <Button variant="secondary" className="w-full sm:w-auto">
                    Create Account
                  </Button>
                </Link>
              </div>
            )}
          </div>
          
          <div>
            <h3 className="mb-4 text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-blue-200 hover:text-white">Home</Link>
              </li>
              <li>
                <Link to="/service-providers" className="text-blue-200 hover:text-white">Service Providers</Link>
              </li>
              <li>
                <Link to="/about" className="text-blue-200 hover:text-white">About Us</Link>
              </li>
              <li>
                <Link to="/contact" className="text-blue-200 hover:text-white">Contact</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="mb-4 text-lg font-semibold">Service Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/service-providers?service=Venue" className="text-blue-200 hover:text-white">Venues</Link>
              </li>
              <li>
                <Link to="/service-providers?service=Catering" className="text-blue-200 hover:text-white">Catering</Link>
              </li>
              <li>
                <Link to="/service-providers?service=Photography" className="text-blue-200 hover:text-white">Photography</Link>
              </li>
              <li>
                <Link to="/service-providers?service=Music+Band" className="text-blue-200 hover:text-white">Music & Entertainment</Link>
              </li>
              <li>
                <Link to="/service-providers?service=Decoration" className="text-blue-200 hover:text-white">Decoration</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="mb-4 text-lg font-semibold">Contact Information</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-2">
                <MapPin size={18} className="mt-1 flex-shrink-0" />
                <span>123 Event Street, Colombo, Sri Lanka</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone size={18} className="flex-shrink-0" />
                <span>+94 11 234 5678</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail size={18} className="flex-shrink-0" />
                <span>info@eventhub.lk</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 border-t border-blue-800 pt-6 text-center text-blue-300">
          <p>&copy; {new Date().getFullYear()} EventHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
