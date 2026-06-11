import React, { useState, useEffect } from 'react';
import { Book, Search, Plus, Edit, CheckCircle, Circle, Layers } from 'lucide-react';
import { Card } from '@/core/components/Card';
import { SectionHeader } from '@/core/components/SectionHeader';
import { syllabusService } from '../services/syllabusService';

export default function TeacherSyllabusPage() {
  const [syllabusList, setSyllabusList] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showChapterModal, setShowChapterModal] = useState(false);
  const [activeSyllabus, setActiveSyllabus] = useState(null);
  
  const [syllabusForm, setSyllabusForm] = useState({ classId: '', className: '', subjectId: '', subjectName: '' });
  const [chapterForm, setChapterForm] = useState({ chapterName: '', chapterNumber: '' });

  const loadSyllabus = async () => {
    try {
      const data = await syllabusService.getTeacherSyllabus();
      setSyllabusList(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadSyllabus();
  }, []);

  const handleCreateSyllabus = async (e) => {
    e.preventDefault();
    try {
      await syllabusService.createSyllabus({
        ...syllabusForm,
        classId: syllabusForm.className, // Dummy logic to ensure IDs exist
        subjectId: syllabusForm.subjectName
      });
      setShowCreateModal(false);
      setSyllabusForm({ classId: '', className: '', subjectId: '', subjectName: '' });
      loadSyllabus();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddChapter = async (e) => {
    e.preventDefault();
    try {
      await syllabusService.addChapter(activeSyllabus.id, {
        chapterName: chapterForm.chapterName,
        chapterNumber: Number(chapterForm.chapterNumber)
      });
      setShowChapterModal(false);
      setChapterForm({ chapterName: '', chapterNumber: '' });
      loadSyllabus();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleChapterStatus = async (chapter) => {
    const newStatus = chapter.status === 'completed' ? 'pending' : 'completed';
    try {
      await syllabusService.updateChapter(chapter.id, { status: newStatus });
      loadSyllabus();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <SectionHeader 
        title="Syllabus Management"
        description="Track class syllabus and update chapter progress"
        action={
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} />
            Create Syllabus
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {syllabusList.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-xl border border-gray-200 border-dashed">
            <Book size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-lg font-medium">No syllabus found.</p>
          </div>
        ) : (
          syllabusList.map((syllabus) => (
            <Card key={syllabus.id} className="p-5 bg-white shadow-sm flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{syllabus.subjectName}</h3>
                  <p className="text-sm text-gray-500">Class: {syllabus.className}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">{syllabus.completionPercentage}%</div>
                  <div className="text-xs text-gray-500 font-medium">Completed</div>
                </div>
              </div>

              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${syllabus.completionPercentage}%` }}></div>
              </div>

              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-1.5 text-gray-600">
                  <Layers size={16} />
                  <span>{syllabus.completedChapters} / {syllabus.totalChapters} Chapters</span>
                </div>
                <button 
                  onClick={() => {
                    setActiveSyllabus(syllabus);
                    setChapterForm({ chapterName: '', chapterNumber: syllabus.chapters.length + 1 });
                    setShowChapterModal(true);
                  }}
                  className="text-blue-600 font-medium hover:text-blue-700"
                >
                  + Add Chapter
                </button>
              </div>

              <div className="mt-2 space-y-2 max-h-60 overflow-y-auto pr-2">
                {syllabus.chapters?.map((chapter) => (
                  <div key={chapter.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex items-center gap-3">
                      <button onClick={() => toggleChapterStatus(chapter)} className="text-gray-400 hover:text-green-500 transition-colors">
                        {chapter.status === 'completed' ? <CheckCircle size={20} className="text-green-500" /> : <Circle size={20} />}
                      </button>
                      <div>
                        <div className={`text-sm font-medium ${chapter.status === 'completed' ? 'text-gray-900 line-through opacity-70' : 'text-gray-900'}`}>
                          {chapter.chapterNumber}. {chapter.chapterName}
                        </div>
                      </div>
                    </div>
                    {chapter.status === 'completed' && (
                      <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded">Completed</span>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          ))
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold mb-4">Create Syllabus</h2>
            <form onSubmit={handleCreateSyllabus} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject Name</label>
                <input required type="text" value={syllabusForm.subjectName} onChange={(e) => setSyllabusForm({...syllabusForm, subjectName: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Class Name</label>
                <input required type="text" value={syllabusForm.className} onChange={(e) => setSyllabusForm({...syllabusForm, className: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showChapterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold mb-4">Add Chapter to {activeSyllabus?.subjectName}</h2>
            <form onSubmit={handleAddChapter} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chapter Number</label>
                <input required type="number" value={chapterForm.chapterNumber} onChange={(e) => setChapterForm({...chapterForm, chapterNumber: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chapter Name</label>
                <input required type="text" value={chapterForm.chapterName} onChange={(e) => setChapterForm({...chapterForm, chapterName: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowChapterModal(false)} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg">Add Chapter</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
