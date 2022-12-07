import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import type { Product } from "~/data.server";
import { getAllProducts } from "~/models/product.server";

type LoaderData = {
  products: Awaited<Product[]>;
};

export const loader: LoaderFunction = async ({ request }) => {
  const products = await getAllProducts();

  return json({ products });
};


// export const action: ActionFunction = async ({ request }) => {
//   const userId = await getUserId(request);
//   const formData = await request.formData();
//   const action = formData.get("action");
//   switch (action) {
//     case "addToCart": {
//       const productId = formData.get("productId");
//       await addToCart(userId, String(productId));
//       break;
//     }
//     default: {
//       throw new Response("Bad Request", { status: 400 });
//     }
//   }
//   return json({ success: true });
// };

export default function IndexProductRouter() {
  const { products } = useLoaderData<LoaderData>();
  return (
    <>
      {products?.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </>
  );
}

function ProductCard({ product }: { product: Product }) {
  const fetcher = useFetcher();

  return (
    <div className="items-border">
      <img
        className="h-48 max-h-48 object-contain"
        src={product.image}
        alt=""
      />
      <div className="items-content">
        <h4 className="items-name">
          {product.name}
        </h4>
        <p className="items-desc max-h-24">
          {product.description}
        </p>
      </div>
      <div className="items-footer">
        <fetcher.Form method="post">
          <input type="hidden" name="productId" value={product.id} />
          <button
            className="btn-add-cart rounded-full bg-blue-500 text-white"
            name="action"
            value="addToCart"
          >
            Add to cart
          </button>
        </fetcher.Form>
        <div className="text-xl font-bold text-gray-800">{product.currency}{product.price}</div>
      </div>
    </div>
  );
}
