import Link from "next/link";

export default function ProducerPage() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold">Producer</h1>
      <p className="mt-2 text-gray-600">
        Producer intake / tools.
      </p>

      <div className="mt-6">
        <Link href="/producer/intake" className="underline">
          Go to Producer Intake →
        </Link>
      </div>
    </main>
  );
}
