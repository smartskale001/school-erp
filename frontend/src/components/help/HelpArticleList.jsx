import React from "react";
import HelpVideoCard from "./HelpVideoCard";

export default function HelpArticleList({ articles }) {
  if (!articles || articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-gray-500">
        <p>No guides available for this category.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {articles.map((article) => (
        <div key={article.id} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{article.title}</h3>
          <p className="text-sm text-gray-600 mb-4">{article.description}</p>
          {article.youtubeUrl && (
            <HelpVideoCard title={article.title} url={article.youtubeUrl} />
          )}
        </div>
      ))}
    </div>
  );
}
