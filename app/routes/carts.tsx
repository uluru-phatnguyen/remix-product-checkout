import { Outlet } from "@remix-run/react";

// https://remix.run/guides/routing#index-routes
export default function CartIndex() {

  return (
    <main className="remix__cart__page">
      <Outlet />
    </main>
  );
}
