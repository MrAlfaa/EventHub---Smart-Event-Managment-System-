
import { Search, Calendar, CreditCard, CheckSquare } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      icon: Search,
      title: "Search Providers",
      description: "Browse through our curated list of service providers or use our advanced search filters to find exactly what you need.",
      color: "bg-blue-100 text-blue-600",
    },
    {
      icon: Calendar,
      title: "Compare & Select",
      description: "View detailed profiles, compare packages, check availability, and read authentic reviews to make an informed decision.",
      color: "bg-green-100 text-green-600",
    },
    {
      icon: CreditCard,
      title: "Book & Pay",
      description: "Choose your preferred service providers, customize your requirements, and secure your booking with easy payment options.",
      color: "bg-purple-100 text-purple-600",
    },
    {
      icon: CheckSquare,
      title: "Enjoy Your Event",
      description: "Relax and enjoy your event while our vetted service providers deliver exceptional experiences for you and your guests.",
      color: "bg-orange-100 text-orange-600",
    },
  ];

  return (
    <section className="bg-white py-16">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-bold text-blue-900">How It Works</h2>
          <p className="text-gray-600">
            Simple steps to find and book the perfect service providers for your event
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <div className={`mb-4 rounded-full ${step.color} p-5`}>
                <step.icon size={32} />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-blue-900">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
              
              {index < steps.length - 1 && (
                <div className="mt-6 hidden h-0.5 w-full bg-gray-200 lg:block"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
