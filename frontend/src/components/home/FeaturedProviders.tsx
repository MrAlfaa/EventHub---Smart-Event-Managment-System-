import { serviceProviders } from "@/data/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, ArrowRight } from "lucide-react";

export function FeaturedProviders() {
  // Just get a few featured providers
  const featured = serviceProviders.slice(0, 4);

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-bold text-blue-900">Featured Service Providers</h2>
          <p className="text-gray-600">
            Discover top-rated vendors for your next event
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {featured.map((provider) => (
            <Card key={provider.id} className="group overflow-hidden transition-all duration-300 hover:shadow-lg">
              {/* Cover and Profile Image Section */}
              <div className="relative h-40">
                {/* Cover Image */}
                <div className="absolute inset-0">
                  <img
                    src={provider.coverImage || provider.profileImage}
                    alt={`${provider.name} cover`}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
                
                {/* Profile Image */}
                <div className="absolute -bottom-6 left-4">
                  <div className="h-16 w-16 rounded-full ring-4 ring-white overflow-hidden">
                    <img
                      src={provider.profileImage}
                      alt={provider.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
                
                {/* New Badge */}
                {provider.isNewcomer && (
                  <Badge className="absolute right-2 top-2 bg-blue-600 text-white">New</Badge>
                )}
              </div>

              <CardContent className="pt-8 px-4 pb-4">
                {/* Business Name and Rating */}
                <div className="mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">{provider.name}</h3>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center text-yellow-500">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="ml-1 text-sm font-medium">{provider.rating}</span>
                    </div>
                    <span className="text-sm text-gray-500">({provider.reviewCount} reviews)</span>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center text-gray-600 text-sm mb-3">
                  <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                  <span className="truncate">{provider.location.city}</span>
                </div>

                {/* Event Types */}
                <div className="mb-4 flex flex-wrap gap-1.5">
                  {provider.services.slice(0, 3).map((type, index) => (
                    <Badge key={index} variant="outline" className="bg-blue-50/50 text-xs">
                      {type}
                    </Badge>
                  ))}
                  {provider.services.length > 3 && (
                    <Badge variant="outline" className="bg-gray-50 text-xs">
                      +{provider.services.length - 3}
                    </Badge>
                  )}
                </div>

                {/* View More Button */}
                <Link to={`/service-providers/${provider.id}`} className="w-full">
                  <Button className="w-full" variant="outline">
                    View More
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link to="/service-providers">
            <Button variant="outline" size="lg">
              View All Providers
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
