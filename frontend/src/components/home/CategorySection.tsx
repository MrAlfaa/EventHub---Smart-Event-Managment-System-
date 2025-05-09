
import { serviceTypes } from "@/data/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import {
  Camera,
  Utensils,
  Building,
  Music,
  Palette,
  Car,
  UserCog,
  Shield,
  Video,
  Users
} from "lucide-react";

const iconMap: Record<string, any> = {
  "Venue": Building,
  "Catering": Utensils,
  "Photography": Camera,
  "Videography": Video,
  "Music Band": Music,
  "DJ": Music,
  "Decoration": Palette,
  "Transportation": Car,
  "Event Coordinator": UserCog,
  "Security": Shield,
};

export function CategorySection() {
  return (
    <section className="bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-bold text-blue-900">Browse by Category</h2>
          <p className="text-gray-600">
            Find providers specialized in different event services
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {serviceTypes.map((service) => {
            const Icon = iconMap[service.name] || Users;
            return (
              <Link
                key={service.id}
                to={`/service-providers?service=${encodeURIComponent(service.name)}`}
              >
                <Card className="card-hover h-full bg-white text-center">
                  <CardContent className="flex flex-col items-center justify-center p-6">
                    <div className="mb-4 rounded-full bg-blue-100 p-4">
                      <Icon className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-blue-900">{service.name}</h3>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
