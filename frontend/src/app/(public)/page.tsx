import { HeroSection } from "@/components/home/hero-section";
import { FeaturedCategories } from "@/components/home/featured-categories";
import { FeaturedProducts } from "@/components/home/featured-products";
import { NewArrivals } from "@/components/home/new-arrivals";
import { TestimonialsSection } from "@/components/home/testimonials-section";
import { BlogPreview } from "@/components/home/blog-preview";
import { RecentlyViewed } from "@/components/home/recently-viewed";
import { Newsletter } from "@/components/shared/newsletter";

export default function HomePage() {
  return (
    <div className="lg:pb-0 pb-20">
      <HeroSection />
      <FeaturedCategories />
      <FeaturedProducts />
      <NewArrivals />
      <TestimonialsSection />
      <BlogPreview />
      <RecentlyViewed />
      <Newsletter />
    </div>
  );
}
