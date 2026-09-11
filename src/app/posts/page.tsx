import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Not Found",
  description: "This page is not available on Lebanese Academic.",
  path: "/posts",
});

export default function PostsPage() {
  notFound();
}
