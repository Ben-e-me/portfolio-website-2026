import type { Metadata } from "next";
import { HeroV2 } from "@/components/hero-v2";

export const metadata: Metadata = {
  title: "Benjamin Erxleben — Senior Product Designer",
  description:
    "Senior Product Designer, 20 years end-to-end across the full product lifecycle. At home in B2C SaaS and regulated, high-complexity markets.",
  robots: { index: false, follow: false },
};

export default function V2Page() {
  return (
    <main>
      <HeroV2 />
    </main>
  );
}
