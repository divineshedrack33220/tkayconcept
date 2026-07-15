import { Heart, ShieldCheck, BadgeCheck, Globe, Lightbulb, Headphones } from "lucide-react";

const features = [
  { icon: Heart, title: "Faith Driven", desc: "Every product reflects our core values" },
  { icon: BadgeCheck, title: "Quality Products", desc: "Carefully crafted with premium materials" },
  { icon: ShieldCheck, title: "Secure Shopping", desc: "Safe and encrypted checkout" },
  { icon: Globe, title: "Worldwide Shipping", desc: "We deliver globally" },
  { icon: Lightbulb, title: "Creative Solutions", desc: "Custom printing for your vision" },
  { icon: Headphones, title: "Excellent Support", desc: "We are here to help you" },
];

export function WhyChooseUs() {
  return (
    <section className="section-padding bg-gray-50">
      <div className="container-custom">
        <div className="mb-12 text-center">
          <h2 className="heading-secondary">Why Choose TK Concepts</h2>
        </div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <f.icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-primary">{f.title}</h3>
                <p className="mt-1 text-sm text-gray-500">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
