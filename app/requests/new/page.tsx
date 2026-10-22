import { Suspense } from "react";
import NewRequestClient from "./NewRequestClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ listing?: string | string[] }>;
}) {
  const params = await searchParams;
  const listingSlug =
    typeof params.listing === "string" ? params.listing : "";

  return (
    <Suspense fallback={<div />}>
      <NewRequestClient listingSlug={listingSlug} />
    </Suspense>
  );
}
