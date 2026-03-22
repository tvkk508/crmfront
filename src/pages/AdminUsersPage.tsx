import { useState } from "react";
import {
  Button,
  Card,
  DataTable,
  DataTableScrollArea,
  Input,
  Table,
  TableBody,
  TableCell,
  TableEmptyState,
  TableHead,
  TableRow,
  TableSkeleton,
  TableToolbar,
} from "../ui/kit";
import { useUsersQuery, useUpdateUserRoleMutation, useResetUserPasswordMutation } from "../features/users/useUsers";

export function AdminUsersPage() {
  const { data: users, isLoading, error } = useUsersQuery();
  const updateRole = useUpdateUserRoleMutation();
  const resetPassword = useResetUserPasswordMutation();
  const [passwordDrafts, setPasswordDrafts] = useState<Record<number, string>>({});

  const handleRoleChange = (id: number, role: "admin" | "user") => {
    updateRole.mutate({ id, role });
  };

  const handlePasswordChange = (id: number, value: string) => {
    setPasswordDrafts((prev) => ({ ...prev, [id]: value }));
  };

  const handleResetPassword = (id: number) => {
    const password = passwordDrafts[id] ?? "";
    if (password.trim().length < 6) {
      return;
    }
    resetPassword.mutate(
      { id, password },
      {
        onSuccess: () => {
          setPasswordDrafts((prev) => ({ ...prev, [id]: "" }));
        },
      }
    );
  };

  const colSpan = 4;

  return (
    <div className="page-enter flex h-full min-h-0 w-full flex-col bg-ui-background">
      <div className="sticky top-0 z-10 shrink-0 border-b border-ui-border bg-ui-surface px-ui-4 py-ui-3">
        <div className="flex min-w-0 items-center justify-between gap-ui-3">
          <div className="min-w-0">
            <h1 className="truncate text-ui-section-title text-text-primary">Пользователи</h1>
            <p className="mt-ui-1 text-ui-caption text-text-tertiary">
              Управление ролями и паролями
            </p>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 p-ui-4">
        <Card className="flex min-h-0 min-w-0 flex-col overflow-hidden p-ui-4">
          {error ? (
            <div className="text-ui-caption text-ui-danger">Не удалось загрузить пользователей</div>
          ) : (
            <DataTable className="min-h-0" density="default">
              <TableToolbar className="shrink-0 text-ui-caption text-ui-text-muted">
                Список учётных записей — на узком экране таблица прокручивается горизонтально
              </TableToolbar>
              <DataTableScrollArea>
                <Table className="table-fixed min-w-[720px] w-full">
                  <TableHead>
                    <TableRow className="border-0 hover:bg-transparent">
                      <TableCell as="th" overflow="wrap" className="w-[24%]">
                        Пользователь
                      </TableCell>
                      <TableCell as="th" overflow="wrap" className="w-[14%]">
                        Роль
                      </TableCell>
                      <TableCell as="th" overflow="wrap" className="w-[38%]">
                        Новый пароль
                      </TableCell>
                      <TableCell as="th" overflow="wrap" className="w-[24%] text-right">
                        Действия
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {isLoading ? (
                      <TableSkeleton rows={6} columns={colSpan} />
                    ) : (users?.length ?? 0) === 0 ? (
                      <TableEmptyState
                        colSpan={colSpan}
                        title="Нет пользователей"
                        description="Добавьте пользователей через API или миграции."
                      />
                    ) : (
                      (users ?? []).map((user) => (
                        <TableRow key={user.id}>
                          <TableCell
                            overflow="truncate"
                            tooltipContent={`${user.name} @${user.login}`}
                          >
                            <div className="min-w-0 font-medium text-text-primary">{user.name}</div>
                            <div className="min-w-0 truncate text-ui-caption text-text-tertiary">
                              @{user.login}
                            </div>
                          </TableCell>
                          <TableCell overflow="wrap">
                            <select
                              className="h-8 w-full min-w-0 rounded-ui-md border border-ui-border bg-ui-surface px-ui-2 text-ui-caption text-ui-text"
                              value={user.role}
                              onChange={(event) =>
                                handleRoleChange(user.id, event.target.value as "admin" | "user")
                              }
                              disabled={updateRole.isPending}
                            >
                              <option value="admin">Админ</option>
                              <option value="user">Пользователь</option>
                            </select>
                          </TableCell>
                          <TableCell overflow="wrap">
                            <Input
                              type="password"
                              className="w-full min-w-0"
                              value={passwordDrafts[user.id] ?? ""}
                              onChange={(event) => handlePasswordChange(user.id, event.target.value)}
                              placeholder="Новый пароль (мин 6)"
                              size="small"
                            />
                          </TableCell>
                          <TableCell overflow="wrap" className="text-right">
                            <Button
                              size="small"
                              variant="secondary"
                              disabled={
                                resetPassword.isPending ||
                                (passwordDrafts[user.id] ?? "").trim().length < 6
                              }
                              onClick={() => handleResetPassword(user.id)}
                            >
                              Сбросить
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </DataTableScrollArea>
            </DataTable>
          )}
        </Card>
      </div>
    </div>
  );
}
