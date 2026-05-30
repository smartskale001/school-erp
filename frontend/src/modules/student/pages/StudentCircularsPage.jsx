import { useState, useMemo } from 'react';
import { Megaphone, Calendar, Search, Tag, Bell } from 'lucide-react';

const CIRCULARS = [
  {
    id: 1,
    title: "Summer Vacation Notice",
    date: "29 May 2026",
    dateSort: "2026-05-29",
    category: "Holiday",
    description: "School will remain closed from June 1 to June 15 due to summer vacation. All students are advised to complete the holiday homework provided by their respective class teachers.",
  },
  {
    id: 2,
    title: "Unit Test Schedule Released",
    date: "28 May 2026",
    dateSort: "2026-05-28",
    category: "Examination",
    description: "Students can now check the upcoming unit test timetable. The exams will commence from June 20. Admit cards will be distributed in class.",
  },
  {
    id: 3,
    title: "Annual Sports Day Registration",
    date: "27 May 2026",
    dateSort: "2026-05-27",
    category: "Event",
    description: "Students interested in participating in Annual Sports Day events can register with their respective class teachers before June 5. Multiple categories available for all age groups.",
  },
  {
    id: 4,
    title: "School Fee Submission Reminder",
    date: "25 May 2026",
    dateSort: "2026-05-25",
    category: "Fees",
    description: "Please submit all pending fees before the due date of June 10 to avoid a late fee penalty. Payments can be made at the school office between 9 AM and 2 PM.",
  },
  {
    id: 5,
    title: "New Library Books Added",
    date: "24 May 2026",
    dateSort: "2026-05-24",
    category: "Library",
    description: "A new collection of science and literature books has been added to the school library. Students can borrow up to 2 books at a time for a period of 14 days.",
  },
  {
    id: 6,
    title: "Parent Teacher Meeting",
    date: "22 May 2026",
    dateSort: "2026-05-22",
    category: "Meeting",
    description: "The Parent Teacher Meeting will be conducted on Saturday, June 1 at 10 AM in the school auditorium. Parents are requested to attend without fail for student progress discussion.",
  },
];

const CATEGORY_COLORS = {
  Holiday:     { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   dot: 'bg-amber-400'   },
  Examination: { bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200',     dot: 'bg-red-400'     },
  Event:       { bg: 'bg-purple-50',  text: 'text-purple-700',  border: 'border-purple-200',  dot: 'bg-purple-400'  },
  Fees:        { bg: 'bg-orange-50',  text: 'text-orange-700',  border: 'border-orange-200',  dot: 'bg-orange-400'  },
  Library:     { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-400' },
  Meeting:     { bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200',    dot: 'bg-blue-400'    },
};

const ALL_CATEGORIES = ['All', ...Object.keys(CATEGORY_COLORS)];
const LATEST_COUNT = 2; // first N (sorted by date desc) get "New" badge

export default function StudentCircularsPage() {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const sorted = useMemo(
    () => [...CIRCULARS].sort((a, b) => b.dateSort.localeCompare(a.dateSort)),
    []
  );

  const latestIds = useMemo(() => sorted.slice(0, LATEST_COUNT).map((c) => c.id), [sorted]);

  const filtered = useMemo(() => {
    return sorted.filter((c) => {
      const matchesQuery =
        c.title.toLowerCase().includes(query.toLowerCase()) ||
        c.description.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = activeCategory === 'All' || c.category === activeCategory;
      return matchesQuery && matchesCategory;
    });
  }, [sorted, query, activeCategory]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
          <Megaphone size={24} className="text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Circulars & Announcements</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Important updates shared by the school administration
          </p>
        </div>
      </div>

      {/* Search + Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search circulars..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>

        {/* Category filter pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {ALL_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                activeCategory === cat
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Circular Count */}
      <p className="text-xs text-gray-400 font-medium">
        Showing {filtered.length} of {CIRCULARS.length} circulars
      </p>

      {/* Cards */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Bell size={40} className="mb-3 text-gray-200" />
            <p className="text-sm">No circulars found matching your filters.</p>
          </div>
        ) : (
          filtered.map((circular) => {
            const colors = CATEGORY_COLORS[circular.category] || CATEGORY_COLORS.Meeting;
            const isNew = latestIds.includes(circular.id);
            return (
              <div
                key={circular.id}
                className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-blue-100 transition-all duration-200 group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Top row: category + date */}
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colors.bg} ${colors.text} ${colors.border}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                        <Tag size={10} />
                        {circular.category}
                      </span>
                      {isNew && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-blue-600 text-white">
                          NEW
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-xs text-gray-400 ml-auto">
                        <Calendar size={12} />
                        {circular.date}
                      </span>
                    </div>

                    {/* Title */}
                    <h2 className="text-base font-semibold text-gray-900 group-hover:text-blue-700 transition-colors leading-snug mb-1.5">
                      {circular.title}
                    </h2>

                    {/* Description */}
                    <p className="text-sm text-gray-500 leading-relaxed">
                      {circular.description}
                    </p>
                  </div>

                  {/* Left accent bar */}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
