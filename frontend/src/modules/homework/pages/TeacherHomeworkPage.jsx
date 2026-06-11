import React, { useState, useEffect, useMemo } from 'react';
import { BookOpen, Search, Plus, Edit, Trash2, Calendar, FileText, X } from 'lucide-react';
import { Card } from '@/core/components/Card';
import { SectionHeader } from '@/core/components/SectionHeader';
import { homeworkService } from '../services/homeworkService';

export default function TeacherHomeworkPage() {
  const [homeworkList, setHomeworkList] = useState([]);
  const [query, setQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', subjectId: '', subjectName: '', classId: '', className: '', assignedDate: '', dueDate: ''
  });

  const loadHomework = async () => {
    try {
      const data = await homeworkService.getTeacherHomework();
      setHomeworkList(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadHomework();
  }, []);

  const filteredHomework = useMemo(() => {
    return homeworkList.filter(hw => 
      hw.title.toLowerCase().includes(query.toLowerCase()) || 
      hw.subjectName.toLowerCase().includes(query.toLowerCase()) ||
      hw.className.toLowerCase().includes(query.toLowerCase())
    );
  }, [homeworkList, query]);

  const stats = useMemo(() => {
    return {
      total: homeworkList.length,
      active: homeworkList.filter(hw => hw.status === 'active').length,
      completed: homeworkList.filter(hw => hw.status === 'completed').length,
    };
  }, [homeworkList]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await homeworkService.createHomework(formData);
      setShowModal(false);
      setFormData({ title: '', description: '', subjectId: '', subjectName: '', classId: '', className: '', assignedDate: '', dueDate: '' });
      loadHomework();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this homework?')) {
      try {
        await homeworkService.deleteHomework(id);
        loadHomework();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <SectionHeader 
        title="Homework Management"
        description="Create and manage assignments for your classes"
        action={
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} />
            Assign Homework
          </button>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-white shadow-sm flex flex-col justify-between border-l-4 border-blue-500">
          <div className="text-gray-500 text-sm font-medium mb-1">Total Homework</div>
          <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
        </Card>
        
        <Card className="p-4 bg-white shadow-sm border-l-4 border-amber-500">
          <div className="text-gray-500 text-sm font-medium mb-1">Active</div>
          <div className="text-3xl font-bold text-amber-600">{stats.active}</div>
        </Card>
        
        <Card className="p-4 bg-white shadow-sm border-l-4 border-emerald-500">
          <div className="text-gray-500 text-sm font-medium mb-1">Completed</div>
          <div className="text-3xl font-bold text-emerald-600">{stats.completed}</div>
        </Card>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="relative w-full max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, subject or class..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Homework List */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Subject</th>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Class</th>
                <th className="px-6 py-4">Assigned Date</th>
                <th className="px-6 py-4">Due Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredHomework.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No homework found. Create your first assignment!
                  </td>
                </tr>
              ) : (
                filteredHomework.map((hw) => (
                  <tr key={hw.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 font-medium text-gray-900">
                        <BookOpen size={16} className="text-blue-500" />
                        {hw.subjectName}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{hw.title}</td>
                    <td className="px-6 py-4 text-gray-600">{hw.className}</td>
                    <td className="px-6 py-4 text-gray-500">{hw.assignedDate}</td>
                    <td className="px-6 py-4 font-medium text-gray-700">{hw.dueDate}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        hw.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {hw.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleDelete(hw.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Assign Homework</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Subject Name</label>
                  <input required type="text" value={formData.subjectName} onChange={(e) => setFormData({...formData, subjectName: e.target.value, subjectId: 'subj_01'})} className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="e.g. Mathematics" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Class Name</label>
                  <input required type="text" value={formData.className} onChange={(e) => setFormData({...formData, className: e.target.value, classId: 'cls_01'})} className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="e.g. Class 10A" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Homework Title</label>
                <input required type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="e.g. Algebra Practice" />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Description</label>
                <textarea required rows={3} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="Instructions for the students..."></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Assigned Date</label>
                  <input required type="date" value={formData.assignedDate} onChange={(e) => setFormData({...formData, assignedDate: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Due Date</label>
                  <input required type="date" value={formData.dueDate} onChange={(e) => setFormData({...formData, dueDate: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                  Save Homework
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
