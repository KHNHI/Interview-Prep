import { useQuery } from "@tanstack/react-query";
import { questionsApi } from "../../api/questions.api";
import { useState } from "react";

export function Component() {
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["questions", category, difficulty],
    queryFn: () => questionsApi.getAll({ category: category || undefined, difficulty: difficulty || undefined }),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Interview Questions</h1>
      <div className="flex gap-3 mb-6">
        <select value={category} onChange={(e) => setCategory(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm">
          <option value="">All categories</option>
          <option value="dsa">DSA</option>
          <option value="system-design">System Design</option>
          <option value="language">Language</option>
          <option value="networking">Networking</option>
          <option value="cloud">Cloud</option>
          <option value="database">Database</option>
        </select>
        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm">
          <option value="">All difficulties</option>
          <option value="newbie">Newbie</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>

      {isLoading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="space-y-3">
          {data?.data.data.map((q) => (
            <div key={q.id} className="bg-white p-4 rounded-lg border hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-medium text-gray-900">{q.title}</h3>
                <div className="flex gap-2 shrink-0">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{q.difficulty}</span>
                  {q.isPro && <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">Pro</span>}
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-1">{q.category}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
