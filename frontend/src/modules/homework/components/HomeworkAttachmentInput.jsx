import React from 'react';

export default function HomeworkAttachmentInput({ file, onChange, label = 'Attachment (optional)' }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input type="file" accept=".pdf,.doc,.docx,image/jpeg,image/png,image/webp" onChange={(event) => onChange(event.target.files?.[0] || null)} className="block w-full text-sm text-gray-600 file:mr-3 file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-blue-700 file:font-medium" />
      {file && <p className="mt-1 text-xs text-gray-500">{file.name}</p>}
    </div>
  );
}
