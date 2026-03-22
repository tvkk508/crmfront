import { createBrowserRouter } from "react-router-dom";
import { TasksPage } from "../pages/TasksPage";
import { AppLayout } from "./App";
import { DealPage } from "../pages/DealPage";
import { DriveboxPage } from "../pages/DriveboxPage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { PipelinePage } from "../pages/PipelinePage";
import { LoginPage } from "../pages/LoginPage";
import { CabinetPage } from "../pages/CabinetPage";
import { AdminUsersPage } from "../pages/AdminUsersPage";
import { DashboardPage } from "../pages/DashboardPage";
import { RequireAdmin, RequireAuth } from "../auth/RequireAuth";

const routes = [
  { path: "/login", element: <LoginPage /> },
  {
    element: (
      <RequireAuth>
        <AppLayout />
      </RequireAuth>
    ),
    children: [
      { path: "/", element: <PipelinePage /> },
      { path: "/me", element: <CabinetPage /> },
      { path: "/dashboard", element: <DashboardPage /> },
      {
        path: "/admin/users",
        element: (
          <RequireAdmin>
            <AdminUsersPage />
          </RequireAdmin>
        ),
      },
      { path: "/drivebox", element: <DriveboxPage /> },
      { path: "/tasks", element: <TasksPage /> },
      { path: "/deal/:dealId", element: <DealPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
];

export const router = createBrowserRouter(routes);
