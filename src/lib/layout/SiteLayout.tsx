import type { ReactNode } from "react";

import { Footer } from "./Footer";
import { Header } from "./Header";

type SiteLayoutProps = {
  children?: ReactNode;
};

export function SiteLayout({ children }: SiteLayoutProps) {
  return (
    <div className="site-layout">
      <Header />
      <main className="site-layout__main">{children}</main>
      <Footer />
    </div>
  );
}
