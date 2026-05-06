import SpendForm from "@/components/SpendForm";

export default function Home() {
  return (
    <main className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-2">SpendLens</h1>
          <p className="text-muted-foreground text-lg">
            Find out exactly where your AI budget is leaking — in 2 minutes.
          </p>
        </div>
        <SpendForm />
      </div>
    </main>
  );
}