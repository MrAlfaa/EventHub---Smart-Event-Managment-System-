
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

export function Testimonials() {
  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Bride",
      image: "/placeholder.svg",
      content: "EventifyPal made planning my wedding so much easier! I found the perfect venue, photographer, and caterer all in one place. The package option saved me tons of time and money.",
      rating: 5,
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "Corporate Event Manager",
      image: "/placeholder.svg",
      content: "As a corporate event manager, I need reliable vendors who can deliver quality service. This platform helped me find professional service providers who understood my requirements perfectly.",
      rating: 5,
    },
    {
      id: 3,
      name: "Priya Sharma",
      role: "Birthday Party Host",
      image: "/placeholder.svg",
      content: "The custom filters were incredibly helpful in finding vendors within my budget. I organized a surprise 50th birthday party and everything went flawlessly thanks to the vendors I found here.",
      rating: 4,
    },
  ];

  return (
    <section className="bg-blue-50 py-16">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-bold text-blue-900">What Our Users Say</h2>
          <p className="text-gray-600">
            Hear from people who found their perfect event vendors through our platform
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="h-full bg-white">
              <CardContent className="flex h-full flex-col p-6">
                <div className="mb-4 flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={i < testimonial.rating ? "text-yellow-500" : "text-gray-300"}
                      fill={i < testimonial.rating ? "currentColor" : "none"}
                    />
                  ))}
                </div>
                <p className="mb-6 flex-grow text-gray-600">{testimonial.content}</p>
                <div className="flex items-center">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="mr-4 h-12 w-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-semibold text-blue-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
