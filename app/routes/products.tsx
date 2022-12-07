import { Outlet } from "@remix-run/react";

// https://remix.run/guides/routing#index-routes
export default function ProductIndex() {
  return (
    <main className="remix__page">
      <Outlet />
    </main>
  );
}
