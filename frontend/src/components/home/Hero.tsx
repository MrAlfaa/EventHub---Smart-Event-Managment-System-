
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function Hero() {
  return (
    <div className="relative bg-gradient-to-r from-blue-900 to-blue-700 py-20 text-white">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/placeholder.svg')] bg-cover bg-center opacity-20"></div>
      </div>
      <div className="container relative z-10 mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="mb-6 text-4xl font-extrabold leading-tight md:text-5xl lg:text-6xl">
            Find Perfect Service Providers for Your Event
          </h1>
          <p className="mb-8 text-lg text-blue-100 md:text-xl">
            Connect with trusted vendors and create unforgettable experiences. All your event needs in one place.
          </p>
          <div className="space-x-4">
            <Link to="/service-providers">
              <Button size="lg" className="bg-white text-blue-900 hover:bg-blue-50">
                Find Providers
              </Button>
            </Link>
            <Link to="#search-section">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Advanced Search
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Wave effect at bottom */}
      <div className="absolute bottom-0 left-0 w-full">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full">
          <path
            fill="#ffffff"
            fillOpacity="1"
            d="M0,128L48,144C96,160,192,192,288,192C384,192,480,160,576,144C672,128,768,128,864,144C960,160,1056,192,1152,197.3C1248,203,1344,181,1392,170.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </div>
    </div>
  );
}
