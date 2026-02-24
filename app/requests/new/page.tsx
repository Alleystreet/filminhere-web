import { Suspense } from "react";
import NewRequestClient from "./NewRequestClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function Page({
  searchParams,
}: {
  searchParams?: { listing?: string };
}) {
  const listingSlug =
    typeof searchParams?.listing === "string" ? searchParams.listing : "";

  return (
    <Suspense fallback={<div />}>
      <NewRequestClient listingSlug={listingSlug} />
    </Suspense>
  );
}
