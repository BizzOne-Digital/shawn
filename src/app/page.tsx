import { getHomepageData } from "@/lib/queries/business";
import { getPageContent, txt } from "@/lib/content/page-content";

export const dynamic = "force-dynamic";
import { HeroSection } from "@/components/home/hero-section";
import { NewsWeatherSection } from "@/components/home/news-weather-section";
import { PopularCategories } from "@/components/home/popular-categories";
import { BusinessSection } from "@/components/home/business-section";
import { HowItWorksSection } from "@/components/home/how-it-works";
import { StatsSection } from "@/components/home/stats-section";
import { BenefitsSection } from "@/components/home/benefits-section";
import { AdvertisingPromo } from "@/components/home/advertising-promo";
import { TestimonialsSection } from "@/components/home/testimonials-section";
import { NewsletterSection } from "@/components/home/newsletter-section";
import { CtaSection } from "@/components/home/cta-section";

export default async function HomePage() {
  const [homepageData, content] = await Promise.all([
    getHomepageData(),
    getPageContent("home"),
  ]);
  const { categories, sponsored, featured, recent, stats } = homepageData;

  return (
    <>
      <HeroSection content={content} />
      <NewsWeatherSection content={content} />
      <PopularCategories categories={categories} content={content} />
      <BusinessSection
        title={txt(content, "sponsored.title")}
        subtitle={txt(content, "sponsored.subtitle")}
        businesses={sponsored}
        showSponsoredLabel
        viewAllHref="/search"
      />
      <BusinessSection
        title={txt(content, "featured.title")}
        subtitle={txt(content, "featured.subtitle")}
        businesses={featured}
        viewAllHref="/directory?featured=true"
      />
      <BusinessSection
        title={txt(content, "recent.title")}
        subtitle={txt(content, "recent.subtitle")}
        businesses={recent}
        viewAllHref="/directory?sort=newest"
      />
      <HowItWorksSection content={content} />
      <StatsSection stats={stats} content={content} />
      <BenefitsSection content={content} />
      <AdvertisingPromo content={content} />
      <TestimonialsSection content={content} />
      <NewsletterSection content={content} />
      <CtaSection content={content} />
    </>
  );
}
