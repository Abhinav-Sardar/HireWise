import Link from "next/link";

export default function HomePage() {
  return (
    <div className="max-w-4xl mt-20">
      <h1 className="text-5xl font-bold mb-6">
        Ace Every <br />
        Interview with <span className="text-[#8B5CF6]">AI</span>
      </h1>
      <p className="text-[#9CA3AF] text-lg mb-8 max-w-2xl">
        Practice real interview questions, get instant feedback, and build the
        confidence to land your dream job with real-time analytics.
      </p>
      <div className="flex gap-4">
        <Link
          href="/interview"
          className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-[0_0_15px_rgba(139,92,246,0.3)]"
        >
          Start Practicing Now →
        </Link>
        <button className="px-6 py-3 rounded-lg border border-gray-700 hover:bg-white/5 transition-colors flex items-center gap-2">
          Watch demo
        </button>
      </div>
    </div>
  );
}
