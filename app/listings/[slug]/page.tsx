import { redirect } from "next/navigation";

export default function ListingAliasDetail({
  params,
}: {
  params: { slug: string };
}) {
  redirect(`/locations/${params.slug}`);
}
