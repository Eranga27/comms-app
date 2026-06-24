import Link from "next/link";
import { notFound } from "next/navigation";
import ResultsClientPage from "./ResultsClientPage";

// Next.js App Router dynamic page
export default async function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // In production, use absolute URL to backend or relative if deployed together.
  // For MVP, using localhost directly from server-side fetch.
  // Wait, Next.js server components fetch at build/request time on server.
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
    const res = await fetch(`${apiUrl}/session/${id}`, { cache: 'no-store' });
    if (!res.ok) {
      if (res.status === 404) return notFound();
      throw new Error("Failed to fetch session");
    }
    
    const session = await res.json();
    let feedback = {
      overall_score: 0,
      feedback_summary: "No summary available.",
      strengths: [],
      weaknesses: [],
      tips: []
    };
    
    if (session.feedback_summary) {
        try {
            feedback = JSON.parse(session.feedback_summary);
        } catch (e) {
            console.error("Error parsing feedback summary JSON");
        }
    }

    return <ResultsClientPage session={session} feedback={feedback} id={id} />;
  } catch (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <div className="glass-panel p-8 text-center">
          <h2 className="text-2xl text-red-400 mb-4">Report Not Ready</h2>
          <p className="text-slate-400 mb-6">The session data might still be processing or could not be found.</p>
          <Link href="/dashboard" className="px-6 py-2 bg-primary-600 text-white rounded-full">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }
}
