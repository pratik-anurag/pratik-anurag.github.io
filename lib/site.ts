import profile from "@/content/profile.json";
import type { Profile } from "@/lib/types";
import { absoluteUrl } from "@/lib/utils";

export const siteConfig = {
  ...(profile as Profile),
  siteUrl: absoluteUrl(),
  ogImage: absoluteUrl("/og-cover.svg")
};

export const navigation = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/blog", label: "Blog" },
  { href: "/notes", label: "Learning" }
];

export function createMetadata({
  title,
  description,
  path = ""
}: {
  title: string;
  description: string;
  path?: string;
}) {
  const canonical = absoluteUrl(path);

  return {
    title,
    description,
    metadataBase: new URL(siteConfig.siteUrl),
    alternates: {
      canonical
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: `${siteConfig.name} Portfolio`,
      images: [
        {
          url: siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: `${siteConfig.name} portfolio cover`
        }
      ],
      locale: "en_US",
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [siteConfig.ogImage]
    }
  };
}
