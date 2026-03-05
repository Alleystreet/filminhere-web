import { redirect } from "next/navigation";

export default async function ListingAliasDetail({
  params,
}: {
  params: { slug: string } | Promise<{ slug: string }>;
}) {
  const p = await Promise.resolve(params);
  redirect(`/locations/${encodeURIComponent(p.slug)}`);
}
