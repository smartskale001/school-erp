import React, { useState, useEffect, useRef, useCallback } from "react";
import { Bell, CheckCheck, CalendarOff, ClipboardList, UserCheck } from "lucide-react";
import { useAuth } from "@/core/context/AuthContext";
import { getLeaveApplications, getProxyAssignments } from "@/modules/leave/services/leaveService";
import { getAllAssignmentsWithTasks } from "@/modules/tasks/services/tasksService";
import { useNavigate } from "react-router-dom";

import { notificationService } from "@/core/services/notificationService";
import { MessageSquare } from "lucide-react";

function useNotifications() {
  const { role, teacherId, canApproveLeave, canApproveProxy, canAssignProxy } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!role) return;
    const next = [];
    try {
      // 1. Fetch real notifications from DB
      const dbNotifications = await notificationService.getNotifications();
      dbNotifications.forEach((n) => {
        next.push({
          id: n.id,
          dbId: n.id, // mark as DB-backed
          icon: MessageSquare,
          color: n.isRead ? "text-gray-400" : "text-emerald-500",
          label: n.title,
          message: n.message,
          path: n.type === "task" ? "/tasks" : "/leave",
          isRead: n.isRead,
          createdAt: n.createdAt,
        });
      });

      // 2. Fetch system-generated alerts (Virtual)
      if (canApproveLeave || canAssignProxy || canApproveProxy) {
        const [leaves, proxies] = await Promise.all([getLeaveApplications(), getProxyAssignments()]);

        if (canApproveLeave) {
          const pending = leaves.filter((l) => l.status === "pending");
          if (pending.length) {
            next.push({
              id: "leaves-pending",
              icon: CalendarOff,
              color: "text-amber-500",
              label: `${pending.length} leave${pending.length > 1 ? "s" : ""} awaiting approval`,
              path: "/leave",
            });
          }
        }

        if (canAssignProxy) {
          const assignedLeaveIds = new Set(proxies.map((p) => p.leaveApplicationId).filter(Boolean));
          const needsProxy = leaves.filter((l) => l.status === "approved" && !assignedLeaveIds.has(l.id));
          if (needsProxy.length) {
            next.push({
              id: "proxy-needed",
              icon: UserCheck,
              color: "text-blue-500",
              label: `${needsProxy.length} approved leave${needsProxy.length > 1 ? "s" : ""} need proxy`,
              path: "/leave",
            });
          }
        }

        if (canApproveProxy) {
          const pendingProxies = proxies.filter((p) => p.status === "pending");
          if (pendingProxies.length) {
            next.push({
              id: "proxies-pending",
              icon: UserCheck,
              color: "text-purple-500",
              label: `${pendingProxies.length} proxy assignment${pendingProxies.length > 1 ? "s" : ""} to approve`,
              path: "/leave",
            });
          }
        }
      }

      // 3. Add existing virtual task alerts
      const assignments = await getAllAssignmentsWithTasks();
      const now = new Date();
      if (role === "teacher" && teacherId) {
        const myOverdue = assignments.filter(
          (a) =>
            a.assignedTo === teacherId &&
            a.status !== "completed" &&
            a.dueDate &&
            new Date(a.dueDate) < now
        );
        if (myOverdue.length) {
          next.push({
            id: "tasks-overdue-mine",
            icon: ClipboardList,
            color: "text-red-500",
            label: `${myOverdue.length} overdue task${myOverdue.length > 1 ? "s" : ""} assigned to you`,
            path: "/tasks",
          });
        }
      } else {
        const overdue = assignments.filter(
          (a) =>
            a.status !== "completed" &&
            a.dueDate &&
            new Date(a.dueDate) < now
        );
        if (overdue.length) {
          next.push({
            id: "tasks-overdue",
            icon: ClipboardList,
            color: "text-red-500",
            label: `${overdue.length} overdue task${overdue.length > 1 ? "s" : ""}`,
            path: "/tasks",
          });
        }
      }
    } catch (e) { console.error(e); }

    // Sort by date (DB notifications have createdAt, virtual ones don't, so put virtual on top)
    next.sort((a, b) => {
      if (!a.createdAt) return -1;
      if (!b.createdAt) return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    setItems(next);
    setLoading(false);
  }, [role, teacherId, canApproveLeave, canApproveProxy, canAssignProxy]);

  useEffect(() => {
    load();
    const timer = setInterval(load, 30_000);
    return () => clearInterval(timer);
  }, [load]);

  const markAsRead = async (id) => {
    await notificationService.markAsRead(id);
    load();
  };

  return { items, loading, refresh: load, markAsRead };
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { items, loading, markAsRead } = useNotifications();
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const count = items.length;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Notifications"
      >
        <Bell size={18} className="text-gray-500" />
        {count > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl border border-gray-200 shadow-lg z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-800">Notifications</span>
            {count > 0 && (
              <span className="text-xs bg-red-100 text-red-600 rounded-full px-2 py-0.5 font-medium">
                {count}
              </span>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
            {loading ? (
              <div className="px-4 py-6 text-center text-sm text-gray-400">Loading…</div>
            ) : count === 0 ? (
              <div className="px-4 py-8 flex flex-col items-center gap-2 text-gray-400">
                <CheckCheck size={24} />
                <span className="text-sm">All caught up!</span>
              </div>
            ) : (
              items.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={async () => {
                      setOpen(false);
                      if (item.dbId && !item.isRead) {
                        await markAsRead(item.dbId);
                      }
                      navigate(item.path);
                    }}
                    className={`w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left ${
                      item.dbId && !item.isRead ? "bg-emerald-50/30" : ""
                    }`}
                  >
                    <Icon size={16} className={`mt-0.5 shrink-0 ${item.color}`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-700">{item.label}</div>
                      {item.message && (
                        <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                          {item.message}
                        </div>
                      )}
                    </div>
                    {item.dbId && !item.isRead && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
