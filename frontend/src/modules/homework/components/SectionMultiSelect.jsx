import React from 'react';

export default function SectionMultiSelect({ sections = [], value = [], onChange }) {
  const toggle = (section) => onChange(value.includes(section) ? value.filter((item) => item !== section) : [...value, section]);
  return (
    <div className="flex flex-wrap gap-2">
      {sections.map((section) => (
        <button key={section} type="button" onClick={() => toggle(section)} className={`px-3 py-1.5 rounded-lg border text-sm font-medium ${value.includes(section) ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300'}`}>
          Section {section}
        </button>
      ))}
      {!sections.length && <span className="text-sm text-gray-500">Select a class and subject first.</span>}
    </div>
  );
}
