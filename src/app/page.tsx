import { Feed } from "@/content/home/Feed";
import { SiteLayout } from "@/lib/layout";

/** Лента из БД — без этого главная остаётся «замороженной» после `next build`. */
export const dynamic = "force-dynamic";

export default async function Home() {
  return (
    <SiteLayout>
      <Feed />
    </SiteLayout>
  );
}
