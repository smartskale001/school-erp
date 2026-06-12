import React from "react";
import { ChevronRight } from "lucide-react";

export default function HelpPersonaCard({ title, subtitle, onClick, icon: Icon }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full bg-white border border-gray-100 hover:border-blue-200 hover:bg-blue-50 hover:shadow-md transition-all duration-200 rounded-xl p-5 flex items-center gap-4 text-left group"
    >
      {Icon && (
        <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
          <Icon size={24} />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-500 truncate">{subtitle}</p>
      </div>
      <ChevronRight className="text-gray-300 group-hover:text-blue-500 shrink-0 transition-colors" size={20} />
    </button>
  );
}
