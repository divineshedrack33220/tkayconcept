import Link from "next/link";
import { BookOpen, Gamepad2, Palette, Printer } from "lucide-react";

const categories = [
  { name: "Books", href: "/shop/books", icon: BookOpen, description: "Inspiring reads for every season" },
  { name: "Games", href: "/shop/games", icon: Gamepad2, description: "Fun for the whole family" },
  { name: "Rooted Identity", href: "/rooted-identity", icon: Palette, description: "Wear your faith boldly" },
  { name: "Custom Printing", href: "/custom-printing", icon: Printer, description: "Bring your vision to life" },
];

export function FeaturedCategories() {
  return (
    <section className="section-padding bg-gray-50">
      <div className="container-custom">
        <div className="mb-12 text-center">
          <h2 className="heading-secondary">Explore Our Collections</h2>
          <p className="mt-3 text-gray-600">Discover products designed to inspire</p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((cat) => (
            <Link key={cat.name} href={cat.href}>
              <div className="group rounded-xl border border-gray-200 bg-white p-8 text-center transition-all hover:border-accent hover:shadow-lg">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-accent transition-colors group-hover:bg-accent group-hover:text-white">
                  <cat.icon className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-semibold text-primary">{cat.name}</h3>
                <p className="mt-2 text-sm text-gray-500">{cat.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
