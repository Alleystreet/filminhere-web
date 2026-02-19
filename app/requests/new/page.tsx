import { Suspense } from "react";
import NewRequestClient from "./NewRequestClient";

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
