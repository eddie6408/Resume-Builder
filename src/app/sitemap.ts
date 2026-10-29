import type { MetadataRoute } from "next";
import { BRAND } from "@/lib/brand";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/translator", "/federal-resume", "/pricing", "/privacy", "/terms"].map((path) => ({
    url: `${BRAND.siteUrl}${path}`,
    changeFrequency: "monthly",
  }));
}
