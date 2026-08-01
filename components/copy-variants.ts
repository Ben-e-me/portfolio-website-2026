/* Five headline/subline directions for the W1 copy loop.
   Grounded in content/landing-message-spine.md: level-free H1, "Senior" carried
   in the subline, product-anchored, brand dialled down. */

export type CopyVariant = {
  id: string;
  name: string;
  note: string;
  headline: { lead: string; rest: string; arrow: boolean };
  subline: { text: string; bold: string[] };
};

export const COPY_VARIANTS: CopyVariant[] = [
  {
    id: "stage",
    name: "Stage anchor",
    note: "Current draft. Keyword-strong for job ads, but claims a stage rather than a range.",
    headline: { lead: "0", rest: "1 Product Design", arrow: true },
    subline: {
      text: "I’m Benjamin. End-to-end hands-on IC, AI-native, at home in B2C SaaS and regulated, high-complexity markets",
      bold: ["Benjamin", "AI-native", "B2C SaaS", "high-complexity markets"],
    },
  },
  {
    id: "compounded",
    name: "What compounded",
    note: "Names the disruption everyone feels and makes 20 years the answer. Does the AI positioning without saying AI in the headline.",
    headline: { lead: "", rest: "Tools change. Judgment compounds.", arrow: false },
    subline: {
      text: "I’m Benjamin, a Senior Product Designer with 20 years end-to-end. AI-native in how I work, at home in regulated, high-complexity markets",
      bold: ["Benjamin", "Senior Product Designer", "20 years", "AI-native"],
    },
  },
  {
    id: "coherence",
    name: "Coherence",
    note: "The USP stated plainly: things that hold together as they grow. Product-anchored, no brand-design claim.",
    headline: { lead: "", rest: "Products that hold together", arrow: false },
    subline: {
      text: "I’m Benjamin. 20 years end-to-end, AI-native, keeping product coherent as it scales — in B2C SaaS and regulated, high-complexity markets",
      bold: ["Benjamin", "20 years end-to-end", "AI-native", "coherent as it scales"],
    },
  },
  {
    id: "ic",
    name: "AI-enabled IC",
    note: "The overlap that sells to both doors: the AI-enabled end-to-end IC that job ads now ask for.",
    headline: { lead: "", rest: "AI-enabled end-to-end design", arrow: false },
    subline: {
      text: "I’m Benjamin, a Senior Product Designer of 20 years. Hands-on from problem to shipped, at home in B2C SaaS and regulated, high-complexity markets",
      bold: ["Benjamin", "Senior Product Designer", "problem to shipped"],
    },
  },
  {
    id: "cleanup",
    name: "Squeeze-resistant",
    note: "Leans on the thing AI does worst — coherence over time. Sharpest for founders, riskier for a cold recruiter scan.",
    headline: { lead: "", rest: "Speed makes messes. I make sense.", arrow: false },
    subline: {
      text: "I’m Benjamin, a Senior Product Designer with 20 years end-to-end. I make fast-moving products hold together — across every touchpoint, as they grow",
      bold: ["Benjamin", "Senior Product Designer", "hold together"],
    },
  },
];
