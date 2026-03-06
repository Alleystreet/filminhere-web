import { redirect } from "next/navigation";

export default async function Page({
  params,
}: {
  params: { id: string } | Promise<{ id: string }>;
}) {
  const p = await Promise.resolve(params);
  redirect(`/me/requests/${encodeURIComponent(p.id)}`);
}
