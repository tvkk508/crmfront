import { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { cn } from "../ui/cn";
import { AppShell, MainContent, Sidebar } from "../ui/layout";
import { getDriveboxUnreadCount } from "../api/api";
import { useAuth } from "../auth/AuthProvider";
import { SystemSettingsModal } from "../features/settings/SystemSettingsModal";

export function AppLayout() {
  const [driveboxUnreadCount, setDriveboxUnreadCount] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { user, logout } = useAuth();
  const userId = user?.id;

  useEffect(() => {
    const loadUnreadCount = async () => {
      try {
        if (!userId) {
          return;
        }
        const result = await getDriveboxUnreadCount();
        setDriveboxUnreadCount(result.unread_count);
      } catch (err) {
        console.error("Failed to load Drivebox unread count", err);
      }
    };
    if (userId) {
      loadUnreadCount();
    }
    const interval = setInterval(loadUnreadCount, 30000); // Обновляем каждые 30 секунд
    return () => clearInterval(interval);
  }, [userId]);

  useEffect(() => {
    const handleUnreadEvent = (event: Event) => {
      const detail = (event as CustomEvent<{ unreadCount?: number }>).detail;
      if (detail && typeof detail.unreadCount === "number") {
        setDriveboxUnreadCount(detail.unreadCount);
      }
    };

    window.addEventListener("drivebox:unread-count", handleUnreadEvent);
    return () => window.removeEventListener("drivebox:unread-count", handleUnreadEvent);
  }, []);

  return (
    <AppShell>
      <Sidebar>
        <div className="amo-sidebar__brand">CRM</div>
        <nav className="amo-sidebar__nav">
          <NavLink
            to="/me"
            className={({ isActive }) =>
              cn("amo-sidebar__item", isActive && "is-active")
            }
          >
            <span className="amo-sidebar__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <circle cx="12" cy="7" r="4" />
                <path d="M5 21a7 7 0 0 1 14 0" />
              </svg>
            </span>
            <span>Кабинет</span>
          </NavLink>
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              cn("amo-sidebar__item", isActive && "is-active")
            }
          >
            <span className="amo-sidebar__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="8" height="8" rx="2" fill="currentColor" opacity=".9" />
                <rect x="13" y="3" width="8" height="8" rx="2" fill="currentColor" opacity=".5" />
                <rect x="3" y="13" width="8" height="8" rx="2" fill="currentColor" opacity=".5" />
                <rect x="13" y="13" width="8" height="8" rx="2" fill="currentColor" opacity=".25" />
              </svg>
            </span>
            <span>Dashboard</span>
          </NavLink>
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              cn("amo-sidebar__item", isActive && "is-active")
            }
          >
            <span className="amo-sidebar__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <rect x="3" y="4" width="6" height="16" rx="1.5" fill="currentColor" />
                <rect x="10" y="7" width="6" height="13" rx="1.5" fill="currentColor" />
                <rect x="17" y="10" width="4" height="10" rx="1.5" fill="currentColor" />
              </svg>
            </span>
            <span>Сделки</span>
          </NavLink>
          <NavLink
            to="/drivebox"
            className={({ isActive }) =>
              cn("amo-sidebar__item", isActive && "is-active")
            }
          >
            <span className="amo-sidebar__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </span>
            <span>Drivebox</span>
            {driveboxUnreadCount > 0 && (
              <span className="amo-sidebar__badge">{driveboxUnreadCount}</span>
            )}
          </NavLink>
          <NavLink
            to="/tasks"
            className={({ isActive }) =>
              cn("amo-sidebar__item", isActive && "is-active")
            }
          >
            <span className="amo-sidebar__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                <rect x="9" y="3" width="6" height="4" rx="1" />
                <path d="M9 12h6M9 16h6" />
              </svg>
            </span>
            <span>Задачи</span>
          </NavLink>
          {user?.role === "admin" ? (
            <NavLink
              to="/admin/users"
              className={({ isActive }) =>
                cn("amo-sidebar__item", isActive && "is-active")
              }
            >
              <span className="amo-sidebar__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M16 11a4 4 0 1 1-8 0 4 4 0 0 1 8 0z" />
                  <path d="M6 20a6 6 0 0 1 12 0" />
                </svg>
              </span>
              <span>Пользователи</span>
            </NavLink>
          ) : null}
        </nav>
        <div className="mt-auto flex w-full flex-col gap-ui-1 px-ui-2 pb-ui-2">
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="flex w-full items-center justify-center rounded-ui-md border border-white/20 p-ui-2 text-white/70 transition-colors duration-ui-fast hover:border-white/40 hover:text-white"
            aria-label="Настройки"
            title="Системные настройки"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => void logout()}
            className="flex w-full items-center justify-center rounded-ui-md border border-white/20 p-ui-2 text-white/70 transition-colors duration-ui-fast hover:border-white/40 hover:text-white"
            aria-label="Выйти"
            title="Выйти"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </button>
        </div>
        <SystemSettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
      </Sidebar>
      <MainContent>
        <Outlet />
      </MainContent>
    </AppShell>
  );
}
