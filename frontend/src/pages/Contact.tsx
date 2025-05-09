import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock
} from "lucide-react";

const Contact = () => {
  const contactInfo = [
    {
      icon: <Phone size={24} className="text-blue-600" />,
      title: "Phone",
      details: [
        "+94 11 234 5678",
        "+94 77 123 4567"
      ]
    },
    {
      icon: <Mail size={24} className="text-blue-600" />,
      title: "Email",
      details: [
        "info@eventhub.lk",
        "support@eventhub.lk"
      ]
    },
    {
      icon: <MapPin size={24} className="text-blue-600" />,
      title: "Address",
      details: [
        "123 Event Street, Colombo 03",
        "Sri Lanka"
      ]
    },
    {
      icon: <Clock size={24} className="text-blue-600" />,
      title: "Hours",
      details: [
        "Monday - Friday: 9am - 6pm",
        "Saturday: 10am - 2pm"
      ]
    }
  ];

  const faqs = [
    {
      question: "How do I book a service provider?",
      answer: "You can book a service provider by browsing our listings, selecting the one that meets your needs, and clicking the 'Book Now' button on their profile page. Follow the prompts to complete your booking."
    },
    {
      question: "Can I cancel my booking?",
      answer: "Yes, you can cancel bookings up to two weeks before your event date. Please note that cancellations made less than two weeks before the event may be subject to cancellation fees as per our policy."
    },
    {
      question: "How are service providers verified?",
      answer: "All service providers undergo a verification process that includes checking their business registration, past work portfolio, client reviews, and in some cases, in-person visits to their premises."
    },
    {
      question: "Do I need to pay a deposit?",
      answer: "Most bookings require a 25% deposit to confirm your reservation. The remaining balance is typically due one week before the event date, but this may vary by service provider."
    }
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-blue-900 mb-3 sm:mb-4">Contact Us</h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
            Have questions about our services? Need assistance with your booking? 
            Our team is here to help you make your event perfect.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10 sm:mb-16">
          {contactInfo.map((item, index) => (
            <Card key={index} className="h-full">
              <CardContent className="p-4 sm:p-6 flex flex-col items-center text-center">
                <div className="bg-blue-100 p-3 rounded-full mb-4">
                  {item.icon}
                </div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                {item.details.map((detail, idx) => (
                  <p key={idx} className="text-gray-600">{detail}</p>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mb-10 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-blue-900 mb-6 text-center">Social Media</h2>
          <div className="flex justify-center space-x-6">
            <a href="#" className="bg-blue-100 hover:bg-blue-200 text-blue-600 p-3 rounded-full transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
            </a>
            <a href="#" className="bg-blue-100 hover:bg-blue-200 text-blue-600 p-3 rounded-full transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>
            <a href="#" className="bg-blue-100 hover:bg-blue-200 text-blue-600 p-3 rounded-full transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
            </a>
            <a href="#" className="bg-blue-100 hover:bg-blue-200 text-blue-600 p-3 rounded-full transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
            </a>
          </div>
        </div>

        <div className="mb-10 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-blue-900 mb-4 sm:mb-6 text-center">Our Location</h2>
          <div className="aspect-video w-full rounded-lg overflow-hidden shadow-lg">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63371.80385478991!2d79.82118635689706!3d6.921833369213144!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae253d10f7a7003%3A0x320b2e4d32d3838d!2sColombo!5e0!3m2!1sen!2slk!4v1649517789899!5m2!1sen!2slk" 
              width="100%" 
              height="100%" 
              style={{border: 0}} 
              allowFullScreen 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>

        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-blue-900 mb-4 sm:mb-6 text-center">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="h-full">
                <CardContent className="p-4 sm:p-6">
                  <h3 className="font-semibold text-lg mb-2">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Contact;
