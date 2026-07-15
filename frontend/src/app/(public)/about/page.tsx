import type { Metadata } from "next";
import { Heart, Target, Users, Gamepad2, Puzzle, BookCopy, BookMarked } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about TK Concepts - our mission, values, and the story behind our faith-driven creative company.",
};

const values = [
  {
    icon: Heart,
    title: "Faith-Driven",
    description: "Every product we create is rooted in biblical principles and designed to strengthen your walk with God.",
  },
  {
    icon: Target,
    title: "Purpose-Focused",
    description: "We believe everyone has a God-given purpose. Our products help you discover and walk in that purpose.",
  },
  {
    icon: Users,
    title: "Community-Building",
    description: "We're building more than a brand — we're building a community of people who live boldly for Christ.",
  },
];

const whatWeDo = [
  { icon: Gamepad2, title: "Games", description: "Fun, educational games for the whole family." },
  { icon: Puzzle, title: "Puzzles", description: "Challenging puzzles that sharpen the mind and strengthen faith." },
  { icon: BookCopy, title: "Storybooks", description: "Inspiring stories and coloring books for all ages." },
  { icon: Heart, title: "Devotionals", description: "Daily devotionals to deepen your spiritual journey." },
  { icon: BookMarked, title: "Ebooks", description: "Digital reads for faith-driven growth on the go." },
];

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-primary py-20 text-white">
        <div className="container-custom text-center">
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">About TK Concepts</h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-300">
            A faith-driven creative company dedicated to producing products that
            inspire people to live boldly and purposefully.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="section-padding container-custom">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="heading-secondary mb-6">Our Mission</h2>
          <p className="mb-4 text-lg leading-relaxed text-gray-600">
            TK Concepts was born from a deep conviction that faith, purpose, and
            identity are the foundations of a life well-lived. We create products that
            remind you of who you are in Christ and empower you to walk in your calling.
          </p>
          <p className="text-lg leading-relaxed text-gray-600">
            From games that bring families together, to puzzles that sharpen the mind, to
            devotionals that deepen your walk with God — everything we do points back to one
            truth: you are created for a purpose.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <h2 className="heading-secondary mb-12 text-center">Our Values</h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {values.map((value) => (
              <div key={value.title} className="rounded-xl bg-white p-8 text-center shadow-sm">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
                  <value.icon className="h-7 w-7 text-accent" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-primary">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section className="section-padding container-custom">
        <h2 className="heading-secondary mb-12 text-center">What We Do</h2>
        <div className="grid gap-8 md:grid-cols-3">
          {whatWeDo.map((item) => (
            <div key={item.title} className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/5">
                <item.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-primary">{item.title}</h3>
              <p className="text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Our Collections */}
      <section className="section-padding bg-accent/5">
        <div className="container-custom text-center">
          <h2 className="heading-secondary mb-4">Our Collections</h2>
          <p className="mx-auto mb-6 max-w-2xl text-gray-600">
            From games and puzzles to devotionals and storybooks — explore products
            that celebrate faith, culture, and purposeful living.
          </p>
          <a href="/shop" className="btn-primary">
            Explore All Products
          </a>
        </div>
      </section>
    </div>
  );
}
