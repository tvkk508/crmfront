import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Card, Input } from "../ui/kit";
import { useAuth } from "../auth/AuthProvider";

export function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loginValue, setLoginValue] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      navigate("/me", { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(loginValue, password);
      const target = (location.state as { from?: Location } | null)?.from?.pathname ?? "/me";
      navigate(target, { replace: true });
    } catch (err) {
      setError("Неверный логин или пароль");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg p-6">
      <Card className="w-full max-w-[420px] p-6 shadow-lg">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 h-10 w-10 rounded-xl bg-button-primary text-white flex items-center justify-center font-semibold">
            CRM
          </div>
          <h1 className="text-lg font-semibold text-text-primary">Вход в систему</h1>
          <p className="text-sm text-text-tertiary">Введите логин и пароль</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-text-secondary">Логин</label>
            <Input
              value={loginValue}
              onChange={(event) => setLoginValue(event.target.value)}
              placeholder="login"
              autoComplete="username"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-text-secondary">Пароль</label>
            <Input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>
          {error ? (
            <div className="rounded-md bg-danger/10 px-3 py-2 text-xs text-danger">{error}</div>
          ) : null}
          <Button type="submit" size="small" variant="primary" className="w-full" disabled={submitting}>
            {submitting ? "Вход..." : "Войти"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
