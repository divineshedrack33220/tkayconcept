import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
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
        <Header />
        <main className="min-h-screen pb-16 lg:pb-0">{children}</main>
        <Footer />
        <MobileBottomNav />
        <FirstPurchasePopup />
      </I18nProvider>
    </Providers>
  );
}
