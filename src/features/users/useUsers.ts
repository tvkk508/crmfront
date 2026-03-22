import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchUsers, fetchPublicUsers, resetUserPassword, updateUserRole } from "../../api/api";
import type { AuthUser } from "../../api/types";

export function useUsersQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const result = await fetchUsers();
      return result.users as AuthUser[];
    },
    enabled: options?.enabled ?? true,
  });
}

export function usePublicUsersQuery() {
  return useQuery({
    queryKey: ["users", "public"],
    queryFn: async () => {
      const result = await fetchPublicUsers();
      return result.users;
    },
  });
}

export function useUpdateUserRoleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: number; role: "admin" | "user" }) =>
      updateUserRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useResetUserPasswordMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, password }: { id: number; password: string }) =>
      resetUserPassword(id, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
