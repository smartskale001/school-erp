import React from 'react';

export default function HomeworkSubmissionTable({ submissions, onReview }) {
  if (!submissions.length) return <p className="p-5 text-sm text-gray-500">No submissions yet.</p>;
  return <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-gray-50 text-left text-gray-500"><tr><th className="p-3">Student</th><th className="p-3">Submitted</th><th className="p-3">Status</th><th className="p-3" /></tr></thead><tbody>{submissions.map((item) => <tr key={item.id} className="border-t"><td className="p-3"><div className="font-medium">{item.studentName}</div><div className="text-xs text-gray-500">{item.studentCode}</div></td><td className="p-3">{new Date(item.updatedAt).toLocaleString()}</td><td className="p-3 capitalize">{item.status}</td><td className="p-3 text-right"><button onClick={() => onReview(item)} className="text-blue-600 font-medium">Review</button></td></tr>)}</tbody></table></div>;
}
