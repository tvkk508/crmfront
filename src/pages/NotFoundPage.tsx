import { Link } from "react-router-dom";
import { Button } from "../ui/kit";

export function NotFoundPage() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="rounded-12 bg-surface p-6 shadow-soft">
        <div className="text-14 font-semibold">Page not found</div>
        <div className="mt-2 text-13 text-muted">
          The requested page does not exist.
        </div>
        <div className="mt-4">
          <Button asChild>
            <Link to="/">Back to pipeline</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
