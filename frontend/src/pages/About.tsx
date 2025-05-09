import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Award, 
  Calendar, 
  Clock, 
  MapPin, 
  Star, 
  Shield, 
  CheckCircle 
} from "lucide-react";

const About = () => {
  // Team members data
  const team = [
    {
      name: "Sarah Johnson",
      role: "Founder & CEO",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400",
      bio: "Sarah has over 15 years of experience in event management and technology."
    },
    {
      name: "David Chen",
      role: "Chief Technology Officer",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400",
      bio: "David leads our technical team with expertise in platform development."
    },
    {
      name: "Priya Patel",
      role: "Head of Operations",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400",
      bio: "Priya ensures that our service providers meet the highest standards."
    },
    {
      name: "Michael Torres",
      role: "Marketing Director",
      image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=400",
      bio: "Michael drives our growth strategy and brand development."
    }
  ];

  // Statistics
  const stats = [
    { label: "Service Providers", value: "500+", icon: Users },
    { label: "Events Organized", value: "10,000+", icon: Calendar },
    { label: "Client Satisfaction", value: "98%", icon: Star },
    { label: "Districts Covered", value: "25", icon: MapPin }
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <section className="mb-12 sm:mb-20">
          <div className="text-center mb-8 sm:mb-16">
            <Badge className="mb-4">About Us</Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-blue-900 mb-4 sm:mb-6">Connecting Events With Excellence</h1>
            <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto px-2">
              EventHub is Sri Lanka's premier platform connecting event planners with top service providers, 
              making event organization seamless and memorable.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="order-2 md:order-1">
              <h2 className="text-2xl sm:text-3xl font-bold text-blue-900 mb-4 sm:mb-6">Our Mission</h2>
              <p className="text-gray-600 mb-4">
                At EventHub, we're on a mission to transform how events are organized in Sri Lanka. 
                We believe everyone deserves access to high-quality event services without the hassle 
                of endless searching and negotiating.
              </p>
              <p className="text-gray-600 mb-6">
                Our platform brings together the best service providers across the country, 
                offering transparent pricing, verified reviews, and streamlined booking processes 
                to make event planning a joyful experience.
              </p>
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-y-3 gap-x-4">
                <div className="flex items-center">
                  <CheckCircle className="text-blue-500 mr-2 flex-shrink-0" size={20} />
                  <span>Verified Providers</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="text-blue-500 mr-2 flex-shrink-0" size={20} />
                  <span>Transparent Pricing</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="text-blue-500 mr-2 flex-shrink-0" size={20} />
                  <span>Secure Bookings</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="text-blue-500 mr-2 flex-shrink-0" size={20} />
                  <span>Quality Guarantee</span>
                </div>
              </div>
            </div>
            <div className="relative order-1 md:order-2 mb-8 md:mb-0">
              <img 
                src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1000" 
                alt="EventHub Team" 
                className="rounded-lg shadow-xl w-full h-auto object-cover"
              />
              <div className="absolute -bottom-6 -left-6 bg-blue-600 text-white p-4 sm:p-6 rounded-lg shadow-lg hidden sm:block">
                <p className="text-xl sm:text-2xl font-bold">Since 2020</p>
                <p className="text-sm sm:text-base">Serving all of Sri Lanka</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-12 sm:mb-20">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-blue-900">Why Choose EventHub</h2>
            <p className="text-gray-600 mt-4 max-w-3xl mx-auto px-2">
              We've built a platform that addresses all the pain points in event planning, 
              ensuring a smooth experience for both clients and service providers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            <Card className="p-4 sm:p-6">
              <div className="bg-blue-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Clock className="text-blue-600" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Save Time</h3>
              <p className="text-gray-600">
                Find and compare service providers in minutes, not days. Our powerful search and filter 
                system helps you identify the perfect match for your event quickly.
              </p>
            </Card>
            
            <Card className="p-4 sm:p-6">
              <div className="bg-blue-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Shield className="text-blue-600" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Vetted Quality</h3>
              <p className="text-gray-600">
                Every service provider on our platform undergoes strict verification. 
                We check credentials, past work, and maintain quality control through reviews.
              </p>
            </Card>
            
            <Card className="p-4 sm:p-6 col-span-1 sm:col-span-2 md:col-span-1">
              <div className="bg-blue-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Award className="text-blue-600" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Customized Packages</h3>
              <p className="text-gray-600">
                Our smart package generator creates personalized service bundles based on your specific 
                event needs, ensuring you get exactly what you need within budget.
              </p>
            </Card>
          </div>
        </section>

        <section className="mb-12 sm:mb-20 bg-blue-50 py-10 sm:py-16 px-4 sm:px-6 rounded-2xl">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-blue-900">Our Impact</h2>
            <p className="text-gray-600 mt-4 max-w-3xl mx-auto">
              Since our launch, we've helped thousands of events come to life across Sri Lanka.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="bg-white p-3 sm:p-4 rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-md">
                  <stat.icon className="text-blue-600" size={20} />
                </div>
                <p className="text-xl sm:text-3xl font-bold text-blue-900">{stat.value}</p>
                <p className="text-sm sm:text-base text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12 sm:mb-20">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-blue-900">Meet Our Team</h2>
            <p className="text-gray-600 mt-4 max-w-3xl mx-auto">
              The passionate individuals behind EventHub who make it all happen.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {team.map((member, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="aspect-square overflow-hidden">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-4 text-center">
                  <h3 className="font-semibold">{member.name}</h3>
                  <p className="text-blue-600 text-sm mb-2">{member.role}</p>
                  <p className="text-sm text-gray-600">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-blue-900 mb-4 sm:mb-6">Ready to Plan Your Next Event?</h2>
          <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who have used EventHub to create memorable events.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link to="/service-providers">Find Service Providers</Link>
            </Button>
            <Button variant="outline" asChild size="lg" className="w-full sm:w-auto">
              <Link to="/contact">Contact Us</Link>
            </Button>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default About;
