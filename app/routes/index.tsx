import type { MetaFunction } from "@remix-run/node";

// https://remix.run/api/conventions#meta
export const meta: MetaFunction = () => {
  return {
    title: "Remix Product",
    description: "Welcome to remix product!",
  };
};

// https://remix.run/guides/routing#index-routes
export default function Index() {
  return (
    <div className="remix_homepage">
      <main>
        <h2>Welcome to Remix Product!</h2>
        <p>We're stoked that you're here. 🥳 2222</p>
      </main>
    </div>
  );
}
