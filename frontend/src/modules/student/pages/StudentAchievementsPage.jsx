import React, { useState } from 'react';
import { Trophy, Award, Medal, Star, Download, Share2, Search, Filter } from 'lucide-react';

const achievements = [
  {
    id: 1,
    title: "First Rank in Mathematics Olympiad",
    category: "Academic",
    date: "25 May 2026",
    description: "Achieved first position in inter-school Mathematics Olympiad competition.",
    level: "Inter School",
    badge: "Gold Medal"
  },
  {
    id: 2,
    title: "Best Discipline Award",
    category: "School",
    date: "18 May 2026",
    description: "Recognized for excellent discipline and conduct throughout the academic session.",
    level: "School",
    badge: "Excellence"
  },
  {
    id: 3,
    title: "Science Exhibition Winner",
    category: "Science",
    date: "10 May 2026",
    description: "Won first prize for innovative solar energy project.",
    level: "District",
    badge: "Winner"
  },
  {
    id: 4,
    title: "Debate Competition Runner-Up",
    category: "Competition",
    date: "2 May 2026",
    description: "Secured runner-up position in English debate competition.",
    level: "Inter School",
    badge: "Silver Medal"
  },
  {
    id: 5,
    title: "Perfect Attendance Certificate",
    category: "Attendance",
    date: "28 April 2026",
    description: "Maintained 100% attendance for the entire academic year.",
    level: "School",
    badge: "Attendance Star"
  }
];

const categoryColors = {
  Academic: 'bg-blue-100 text-blue-700',
  Sports: 'bg-orange-100 text-orange-700',
  Science: 'bg-purple-100 text-purple-700',
  Attendance: 'bg-green-100 text-green-700',
  Competition: 'bg-red-100 text-red-700',
  School: 'bg-indigo-100 text-indigo-700'
};

const getCategoryColor = (cat) => categoryColors[cat] || 'bg-gray-100 text-gray-700';

export default function StudentAchievementsPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  
  const filteredAchievements = achievements.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase()) || a.description.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'All' || a.category === filter;
    return matchesSearch && matchesFilter;
  });

  const featured = achievements[0]; // Just picking the first one as featured

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Achievements</h1>
        <p className="text-gray-500 text-sm mt-1">Track your academic and extracurricular accomplishments</p>
      </div>

      {/* Top Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Achievements', value: achievements.length, icon: Trophy, color: 'text-yellow-600' },
          { label: 'Academic Awards', value: achievements.filter(a=>a.category==='Academic').length, icon: Award, color: 'text-blue-600' },
          { label: 'Competition Wins', value: achievements.filter(a=>a.category==='Competition').length, icon: Medal, color: 'text-red-600' },
          { label: 'Certificates Earned', value: achievements.filter(a=>['Attendance', 'School', 'Science'].includes(a.category)).length, icon: Star, color: 'text-green-600' }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-gray-50 ${stat.color}`}>
              <stat.icon size={20} />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-xs text-gray-500 font-medium">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Featured Achievement */}
      {featured && (
        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-2xl p-6 border border-yellow-100 relative overflow-hidden shadow-sm">
          <div className="absolute -right-10 -top-10 text-yellow-200/50">
            <Trophy size={200} />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start md:items-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-white shadow-lg shrink-0">
              <Trophy size={32} />
            </div>
            <div className="flex-1">
              <div className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">Featured Achievement</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">{featured.title}</h2>
              <p className="text-gray-600 text-sm max-w-2xl">{featured.description}</p>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <Share2 size={16} />
                Share
              </button>
              <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-colors shadow-sm shadow-amber-200">
                <Download size={16} />
                Certificate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          {['All', 'Academic', 'Competition', 'Attendance', 'Sports', 'Science'].map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filter === cat ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text"
            placeholder="Search achievements..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Achievements Timeline/List */}
      <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
        {filteredAchievements.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100 shadow-sm">
            <Trophy size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No achievements found</h3>
            <p className="text-gray-500 text-sm mt-1">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          filteredAchievements.map((item, index) => (
            <div key={item.id} className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active`}>
              {/* Timeline dot */}
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-blue-100 text-blue-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                <Medal size={16} />
              </div>
              
              {/* Card */}
              <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getCategoryColor(item.category)}`}>
                      {item.category}
                    </span>
                    <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-md">{item.level}</span>
                  </div>
                  <div className="text-xs font-medium text-gray-500">{item.date}</div>
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{item.description}</p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                  <div className="flex items-center gap-2">
                    <Star size={14} className="text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-semibold text-gray-700">{item.badge}</span>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 transition-colors">
                    View
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
