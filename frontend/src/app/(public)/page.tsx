import { HeroSection } from "@/components/home/hero-section";
import { FeaturedCategories } from "@/components/home/featured-categories";
import { FeaturedProducts } from "@/components/home/featured-products";
import { TestimonialsSection } from "@/components/home/testimonials-section";
import { BlogPreview } from "@/components/home/blog-preview";
import { RecentlyViewed } from "@/components/home/recently-viewed";
import { Newsletter } from "@/components/shared/newsletter";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturedCategories />
      <FeaturedProducts />
      <TestimonialsSection />
      <BlogPreview />
      <RecentlyViewed />
      <Newsletter />
    </>
  );
}
