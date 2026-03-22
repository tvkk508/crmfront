import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../ui/kit/Dialog";
import { getAiAgentSetting, setAiAgentSetting } from "../../api/api";
import { useAuth } from "../../auth/AuthProvider";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function SystemSettingsModal({ open, onOpenChange }: Props) {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const queryClient = useQueryClient();
  const [feedback, setFeedback] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["system-settings", "ai-agent"],
    queryFn: async () => {
      const res = await getAiAgentSetting();
      return res.enabled;
    },
    enabled: open,
  });

  const mutation = useMutation({
    mutationFn: setAiAgentSetting,
    onMutate: async (nextEnabled) => {
      await queryClient.cancelQueries({ queryKey: ["system-settings", "ai-agent"] });
      const prev = queryClient.getQueryData<boolean>(["system-settings", "ai-agent"]);
      queryClient.setQueryData(["system-settings", "ai-agent"], nextEnabled);
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev !== undefined) {
        queryClient.setQueryData(["system-settings", "ai-agent"], ctx.prev);
      }
      setFeedback({ type: "error", text: "Не удалось сохранить настройку" });
    },
    onSuccess: (res) => {
      queryClient.setQueryData(["system-settings", "ai-agent"], res.enabled);
      setFeedback({ type: "ok", text: res.enabled ? "AI агент включён" : "AI агент выключен" });
      setTimeout(() => setFeedback(null), 2500);
    },
  });

  const enabled = data ?? true;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Системные настройки</DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-medium text-gray-900">AI агент</div>
              <div className="text-xs text-gray-500 mt-0.5">
                Глобальное управление обработкой сообщений через AI. При выключении новые входящие сообщения Avito не передаются агенту.
              </div>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={enabled}
              disabled={!isAdmin || isLoading || mutation.isPending}
              onClick={() => {
                if (!isAdmin) return;
                setFeedback(null);
                mutation.mutate(!enabled);
              }}
              title={!isAdmin ? "Только администратор может изменить эту настройку" : undefined}
              className={[
                "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200",
                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                enabled ? "bg-blue-600" : "bg-gray-300",
                (!isAdmin || mutation.isPending) && "opacity-60 cursor-not-allowed",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <span
                className={[
                  "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200",
                  enabled ? "translate-x-5" : "translate-x-0",
                ]
                  .filter(Boolean)
                  .join(" ")}
              />
            </button>
          </div>

          {!isAdmin && (
            <p className="text-xs text-gray-400">
              Только администратор может изменять системные настройки.
            </p>
          )}

          {feedback && (
            <div
              className={[
                "text-xs px-3 py-2 rounded",
                feedback.type === "ok"
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700",
              ].join(" ")}
            >
              {feedback.text}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
