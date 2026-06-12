import React, { useState } from "react";
import { HelpCircle, X, ArrowLeft } from "lucide-react";
import HelpPersonaGrid from "./HelpPersonaGrid";
import HelpArticleList from "./HelpArticleList";
import { HELP_CONTENT } from "../../modules/help/helpContent";

export default function HelpDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [activePersona, setActivePersona] = useState(null); // null means root menu

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    // Reset state after animation finishes
    setTimeout(() => setActivePersona(null), 300);
  };

  const handleBack = () => {
    setActivePersona(null);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={handleOpen}
        className="fixed bottom-6 right-6 z-40 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 font-semibold text-sm"
      >
        <HelpCircle size={20} />
        Need Help?
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity"
          onClick={handleClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[400px] md:w-[35%] bg-gray-50 z-50 shadow-2xl transition-transform duration-300 ease-in-out transform flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
          <div className="flex items-center gap-3">
            {activePersona && (
              <button
                onClick={handleBack}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-900 -ml-2"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <h2 className="text-lg font-bold text-gray-900">
              {activePersona ? `${activePersona.charAt(0).toUpperCase() + activePersona.slice(1)} Guides` : "Help Center"}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-red-50 hover:text-red-600 rounded-full transition-colors text-gray-400"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {!activePersona ? (
            <HelpPersonaGrid onSelectPersona={setActivePersona} />
          ) : (
            <HelpArticleList articles={HELP_CONTENT[activePersona] || []} />
          )}
        </div>
      </div>
    </>
  );
}
