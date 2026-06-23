import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { apiRequest } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';
import { useAuth } from '@/core/context/AuthContext';
import defaultClassesData from '@/data/classes.json';

const STORAGE_KEY = 'erp_classes';

function loadClasses() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : defaultClassesData;
    }
  } catch {}
  return defaultClassesData;
}

function persist(classes) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(classes));
}

// Drop the local timetable grids tied to a class/section so removed
// classes don't leave orphaned schedules behind.
function dropTimetable(className, sections) {
  try {
    const timetable = JSON.parse(localStorage.getItem('erp_timetable') || '{}');
    sections.forEach((s) => delete timetable[`${className}-${s}`]);
    localStorage.setItem('erp_timetable', JSON.stringify(timetable));
  } catch {}
}

const ClassesContext = createContext(null);

export function ClassesProvider({ children }) {
  const { user } = useAuth();
  const [classes, setClasses] = useState(loadClasses);

  const applyClasses = useCallback((next) => {
    setClasses(next);
    persist(next);
  }, []);

  useEffect(() => {
    if (!user) return;
    apiRequest(API_ENDPOINTS.classes.list)
      .then((list) => {
        if (!list?.length) return;
        const fromApi = list.map((c) => ({ id: c.id, class: c.name, sections: c.sections || [] }));
        applyClasses(fromApi);
      })
      .catch(() => {});
  }, [user, applyClasses]);

  const addClass = useCallback(async (className, sections) => {
    if (classes.find((c) => c.class === className)) return;
    // Optimistic add; reconcile with the server-issued id on success.
    const optimistic = [...classes, { id: null, class: className, sections }];
    applyClasses(optimistic);
    try {
      const saved = await apiRequest(API_ENDPOINTS.classes.create, {
        method: 'POST',
        body: JSON.stringify({ name: className, sections }),
      });
      applyClasses(
        optimistic.map((c) =>
          c.class === className ? { id: saved.id, class: saved.name, sections: saved.sections || [] } : c,
        ),
      );
    } catch {
      applyClasses(classes); // revert
    }
  }, [classes, applyClasses]);

  const removeClass = useCallback(async (className) => {
    const target = classes.find((c) => c.class === className);
    if (!target) return;
    const next = classes.filter((c) => c.class !== className);
    applyClasses(next);
    dropTimetable(className, target.sections || []);
    if (!target.id) return; // local-only (unpersisted default) — nothing to delete
    try {
      await apiRequest(API_ENDPOINTS.classes.remove(target.id), { method: 'DELETE' });
    } catch {
      applyClasses(classes); // revert
    }
  }, [classes, applyClasses]);

  const addSection = useCallback(async (className, section) => {
    const target = classes.find((c) => c.class === className);
    if (!target || target.sections.includes(section)) return;
    const newSections = [...target.sections, section];
    const next = classes.map((c) => (c.class === className ? { ...c, sections: newSections } : c));
    applyClasses(next);
    if (!target.id) return;
    try {
      await apiRequest(API_ENDPOINTS.classes.update(target.id), {
        method: 'PATCH',
        body: JSON.stringify({ sections: newSections }),
      });
    } catch {
      applyClasses(classes); // revert
    }
  }, [classes, applyClasses]);

  const removeSection = useCallback(async (className, section) => {
    const target = classes.find((c) => c.class === className);
    if (!target) return;
    const newSections = target.sections.filter((s) => s !== section);
    const next = classes.map((c) => (c.class === className ? { ...c, sections: newSections } : c));
    applyClasses(next);
    dropTimetable(className, [section]);
    if (!target.id) return;
    try {
      await apiRequest(API_ENDPOINTS.classes.update(target.id), {
        method: 'PATCH',
        body: JSON.stringify({ sections: newSections }),
      });
    } catch {
      applyClasses(classes); // revert
    }
  }, [classes, applyClasses]);

  // Flat list of { value: "Class 1-A", label: "Class 1 - A" }
  const classOptions = Array.isArray(classes)
    ? classes.flatMap((c) =>
        (c?.sections || []).map((s) => ({ value: `${c.class}-${s}`, label: `${c.class} - ${s}` }))
      )
    : [];

  return (
    <ClassesContext.Provider value={{ classes, classOptions, addClass, removeClass, addSection, removeSection }}>
      {children}
    </ClassesContext.Provider>
  );
}

export function useClasses() {
  const ctx = useContext(ClassesContext);
  if (!ctx) throw new Error('useClasses must be used inside ClassesProvider');
  return ctx;
}
