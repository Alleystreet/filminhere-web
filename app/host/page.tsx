import Link from "next/link";

export default function HostPage() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold">Host</h1>
      <p className="mt-2 text-gray-600">
        Start the host intake flow.
      </p>

      <div className="mt-6">
        <Link href="/host/intake" className="underline">
          Go to Host Intake →
        </Link>
      </div>
    </main>
  );
}