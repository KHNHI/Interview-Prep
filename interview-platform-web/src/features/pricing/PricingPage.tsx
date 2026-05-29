export function Component() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Pricing</h1>
      <div className="grid grid-cols-3 gap-6 max-w-4xl">
        {[
          { name: "Free", price: "0₫", features: ["10 answers/day", "5 quizzes/day", "Activity streak"] },
          { name: "Pro", price: "99,000₫/mo", features: ["Unlimited Q&A", "All quiz modes", "SM-2 spaced repetition", "AI feedback (10/mo)", "Skill radar chart"] },
          { name: "Team", price: "199,000₫/mo", features: ["Everything in Pro", "Up to 10 members", "Shared leaderboard", "Custom roadmaps"] },
        ].map((tier) => (
          <div key={tier.name} className="bg-white border rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-bold">{tier.name}</h2>
            <p className="text-2xl font-bold text-indigo-600">{tier.price}</p>
            <ul className="space-y-2">
              {tier.features.map((f) => (
                <li key={f} className="text-sm text-gray-600 flex gap-2">
                  <span className="text-green-500">✓</span>{f}
                </li>
              ))}
            </ul>
            <button className="w-full bg-indigo-600 text-white py-2 rounded-md text-sm font-medium hover:bg-indigo-700">
              Get started
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
