import React, { useState, useMemo } from 'react';
import { Mail, Search, AlertCircle, Calendar } from 'lucide-react';

const mockMails = [
  {
    id: 1,
    sender: "Principal Office",
    subject: "Welcome to New Academic Session",
    message: "We welcome all students to the new academic session 2026-2027. Wishing you success and growth.",
    date: "29 May 2026",
    unread: true,
    type: "Announcement"
  },
  {
    id: 2,
    sender: "Examination Department",
    subject: "Unit Test Guidelines",
    message: "Please carry your ID cards during unit tests. Reporting time is 8:30 AM.",
    date: "28 May 2026",
    unread: true,
    type: "Exam"
  },
  {
    id: 3,
    sender: "Sports Department",
    subject: "Sports Day Participation",
    message: "Students interested in athletics can register before June 5.",
    date: "27 May 2026",
    unread: false,
    type: "Sports"
  },
  {
    id: 4,
    sender: "Library",
    subject: "Library Book Return Reminder",
    message: "Please return overdue books before Friday to avoid penalties.",
    date: "25 May 2026",
    unread: false,
    type: "Library"
  },
  {
    id: 5,
    sender: "Accounts Office",
    subject: "Fee Reminder",
    message: "Kindly clear pending fees before the due date.",
    date: "24 May 2026",
    unread: false,
    type: "Fees"
  }
];

export default function StudentMailboxPage() {
  const [mails, setMails] = useState(mockMails);
  const [selectedMail, setSelectedMail] = useState(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All'); // 'All' | 'Unread'

  const filteredMails = useMemo(() => {
    return mails.filter((m) => {
      const matchQuery = m.subject.toLowerCase().includes(query.toLowerCase()) || 
                         m.sender.toLowerCase().includes(query.toLowerCase()) ||
                         m.message.toLowerCase().includes(query.toLowerCase());
      const matchFilter = filter === 'All' || (filter === 'Unread' && m.unread);
      return matchQuery && matchFilter;
    });
  }, [mails, query, filter]);

  const handleSelectMail = (mail) => {
    setSelectedMail(mail);
    if (mail.unread) {
      setMails((prev) => 
        prev.map((m) => m.id === mail.id ? { ...m, unread: false } : m)
      );
    }
  };

  const unreadCount = mails.filter(m => m.unread).length;

  return (
    <div className="max-w-6xl mx-auto space-y-6 flex flex-col h-[calc(100vh-100px)]">
      {/* Header */}
      <div className="flex items-start gap-4 flex-shrink-0">
        <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
          <Mail size={24} className="text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Mailbox</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            View important messages and notices from the school
          </p>
        </div>
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden min-h-0">
        {/* Left Sidebar - Mail List */}
        <div className="w-1/3 flex flex-col bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden min-w-[300px]">
          <div className="p-4 border-b border-gray-100 space-y-3 bg-white z-10 relative">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search mailbox..."
                className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setFilter('All')} 
                className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all ${filter === 'All' ? 'bg-blue-100 text-blue-700' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
              >
                All
              </button>
              <button 
                onClick={() => setFilter('Unread')} 
                className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all flex items-center gap-1.5 ${filter === 'Unread' ? 'bg-blue-100 text-blue-700' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
              >
                Unread {unreadCount > 0 && <span className="bg-blue-600 text-white px-1.5 rounded-full text-[10px]">{unreadCount}</span>}
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {filteredMails.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">
                No messages found.
              </div>
            ) : (
              <div className="flex flex-col">
                {filteredMails.map((mail) => (
                  <button
                    key={mail.id}
                    onClick={() => handleSelectMail(mail)}
                    className={`w-full text-left p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors flex gap-3 ${selectedMail?.id === mail.id ? 'bg-blue-50/50' : ''} ${mail.unread ? 'bg-blue-50/20' : ''}`}
                  >
                    <div className="pt-1">
                      {mail.unread ? (
                        <div className="w-2 h-2 bg-blue-600 rounded-full" />
                      ) : (
                        <div className="w-2 h-2 bg-transparent rounded-full" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs truncate ${mail.unread ? 'font-bold text-gray-900' : 'font-medium text-gray-600'}`}>{mail.sender}</span>
                        <span className="text-[10px] text-gray-400 shrink-0">{mail.date}</span>
                      </div>
                      <h3 className={`text-sm truncate mb-1 ${mail.unread ? 'font-bold text-gray-900' : 'font-medium text-gray-800'}`}>{mail.subject}</h3>
                      <p className="text-xs text-gray-500 truncate">{mail.message}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Mail Details Preview */}
        <div className="flex-1 bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
          {selectedMail ? (
            <div className="flex flex-col h-full">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">{selectedMail.subject}</h2>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                        {selectedMail.sender.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{selectedMail.sender}</div>
                        <div className="text-xs text-gray-500">to me</div>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 flex items-center gap-1.5">
                    <Calendar size={14} />
                    {selectedMail.date}
                  </div>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                  <AlertCircle size={12} />
                  {selectedMail.type}
                </div>
              </div>
              <div className="p-6 flex-1 overflow-y-auto">
                <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">
                  {selectedMail.message}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 text-center">
              <Mail size={48} className="mb-4 text-gray-200" />
              <p className="text-lg font-medium text-gray-500">No message selected</p>
              <p className="text-sm mt-1">Select a message from the list to view its contents</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
