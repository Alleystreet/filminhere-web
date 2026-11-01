import { notFound } from "next/navigation";

// Route unmatched addresses through the application's branded missing-page boundary.
export default function UnmatchedPage() {
  notFound();
}
