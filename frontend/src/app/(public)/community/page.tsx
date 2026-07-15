import type { Metadata } from "next";
import { Users, BookOpen, Heart, MessageCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Community",
  description: "Join the TK Concepts community - connect with like-minded believers.",
};

const features = [
  { icon: Users, title: "Connect", description: "Join a community of believers who are walking in faith and purpose." },
  { icon: BookOpen, title: "Learn", description: "Access devotionals, Bible studies, and faith-building resources." },
  { icon: Heart, title: "Serve", description: "Find opportunities to serve and make a difference in your community." },
  { icon: MessageCircle, title: "Share", description: "Share your story, testimony, and encourage others on their journey." },
];

export default function CommunityPage() {
  return (
    <div>
      <section className="bg-primary py-20 text-white">
        <div className="container-custom text-center">
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">Our Community</h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-300">
            A family of believers united by faith, purpose, and identity in Christ.
          </p>
        </div>
      </section>

      <section className="section-padding container-custom">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div key={feature.title} className="rounded-xl border border-gray-100 bg-white p-8 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
                <feature.icon className="h-7 w-7 text-accent" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-primary">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section-padding bg-gray-50 text-center">
        <div className="container-custom">
          <h2 className="heading-secondary mb-4">Join the Movement</h2>
          <p className="mx-auto mb-8 max-w-xl text-gray-600">
            Be part of a community that lives boldly for Christ. Sign up for our newsletter
            to stay connected and get exclusive content.
          </p>
          <a href="/" className="btn-primary">
            Subscribe to Newsletter
          </a>
        </div>
      </section>
    </div>
  );
}
