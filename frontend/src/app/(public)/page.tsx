import { HeroSection } from "@/components/home/hero-section";
import { FeaturedCategories } from "@/components/home/featured-categories";
import { MissionSection } from "@/components/home/mission-section";
import { WhyChooseUs } from "@/components/home/why-choose-us";
import { FeaturedProducts } from "@/components/home/featured-products";
import { TestimonialsSection } from "@/components/home/testimonials-section";
import { BlogPreview } from "@/components/home/blog-preview";
import { Newsletter } from "@/components/shared/newsletter";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturedCategories />
      <MissionSection />
      <WhyChooseUs />
      <FeaturedProducts />
      <TestimonialsSection />
      <BlogPreview />
      <Newsletter />
    </>
  );
}
