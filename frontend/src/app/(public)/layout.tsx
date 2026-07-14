import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { BackToTop } from "@/components/ui/back-to-top";
import { FirstPurchasePopup } from "@/components/shared/first-purchase-popup";
import { I18nProvider } from "@/i18n";
import { Providers } from "@/providers";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <I18nProvider>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
        >
          Skip to content
        </a>
        <Header />
        <main id="main-content" className="min-h-screen pb-16 lg:pb-0" tabIndex={-1}>
          {children}
        </main>
        <Footer />
        <MobileBottomNav />
        <BackToTop />
        <FirstPurchasePopup />
      </I18nProvider>
    </Providers>
  );
}
