import { FaTrash, FaMinusCircle, FaPlusCircle } from "react-icons/fa";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { commitSession, getSession } from "~/session.server";
import { getCartItems, CartItem, addToCart, removeFromCart, applyVoucher, getVoucherCode } from "~/utils/cart";

type LoaderData = {
  cartItems: Awaited<CartItem[]>;
  voucherCode: Awaited<string>;
};

export const loader: LoaderFunction = async ({ request }) => {
  const session = await getSession(request.headers.get('Cookie'));

  const cartItems = await getCartItems(session);
  const voucherCode = await getVoucherCode(session);
  return json(
    { cartItems, voucherCode },
    { headers: { 'Set-Cookie': await commitSession(session) }}
  );
};

export const action: ActionFunction = async ({ request }) => {
  const session = await getSession(request.headers.get('Cookie'));

  const formData = await request.formData();
  const action = formData.get("action");
  const productId = (formData.get("productId") || "").toString();

  switch (action) {
    case "increaseQuantity":
    case "decreaseQuantity": {
      const quantity = action === "increaseQuantity" ? 1 : -1;
      await addToCart(session, productId, quantity);
      break;
    }
    case "removeFromCart": {
      await removeFromCart(session, productId);
      break;
    }
    case "applyVoucher": {
      await applyVoucher(session, (formData.get("voucherCode") || "").toString(), null);
      break;
    }
    default: {
      throw new Response("Bad Request", { status: 400 });
    }
  }
  return json(
    { success: true },
    { headers: { 'Set-Cookie': await commitSession(session) }}
  );
};

function CartItemHeader() {
  return (
    <div className="display-flex items-start gap-1 font-bold" style={{ borderBottom: "1px solid" }}>
      <div className="basis-32">Image</div>
      <div className="basis-64">Name</div>
      <div className="basis-32 text-center">Quantity</div>
      <div className="basis-32 text-right">Price</div>
      <div className="basis-32 text-right">Total Price</div>
    </div>
  );
}

function CartItemRow({
  cartItem,
}: {
  cartItem: CartItem;
}) {
  const fetcher = useFetcher();
  return (
    <div className="display-flex max-h-32 items-start gap-1">
      <img
        className="max-w-32 max-h-32 w-32 basis-32"
        src={cartItem.image!}
        alt=""
      />
      <div className="basis-64">
        <div className="font-bold">{cartItem.name}</div>
        <div className="">Size: {cartItem.size}</div>
      </div>
      <div className="display-flex basis-32 flex-col items-center gap-1">
        <div className="display-flex">
          <fetcher.Form method="post">
            <input type="hidden" name="productId" value={cartItem.productId} />
            <button
              name="action"
              value="decreaseQuantity"
              className="cart-btn disabled"
              disabled={cartItem.quantity === 0}
            >
              <FaMinusCircle style={{width: "1.2rem", height: "1.2rem"}} />
            </button>
          </fetcher.Form>
          <span className="text-line-through"> {cartItem.quantity} </span> / <span className="text-red"> {cartItem.promotionQuantity} </span>
          <fetcher.Form method="post">
            <input type="hidden" name="productId" value={cartItem.productId} />
            <button name="action" value="increaseQuantity" className="cart-btn">
              <FaPlusCircle style={{width: "1.2rem", height: "1.2rem"}} />
            </button>
          </fetcher.Form>
        </div>
        <div className="">
          <fetcher.Form method="post">
            <input type="hidden" name="productId" value={cartItem.productId} />
            <button
              className="inline-flex items-center cart-btn"
              name="action"
              value="removeFromCart"
            >
              <FaTrash style={{width: "1.2rem", height: "1.2rem"}} />{" "}
              <span className="">Remove</span>
            </button>
          </fetcher.Form>
        </div>
      </div>
      <div className="basis-32 text-right">
        <span className="text-line-through">${cartItem.price}</span><br />
        <span className="text-red">${cartItem.promotionPrice}</span>
      </div>
      <div className="basis-32 text-right font-bold">
        <span className="text-line-through">${cartItem.totalPrice}</span><br />
        <span className="text-red">${cartItem.promotionTotalPrice}</span>
      </div>
    </div>
  );
}

function GrandTotalRow({
  totalItemCount,
  grandTotal,
  promotionTotalItemCount,
  promotionGrandTotal,
  voucherCode,
}: {
  totalItemCount: number;
  grandTotal: number;
  promotionTotalItemCount: number;
  promotionGrandTotal: number;
  voucherCode: string;
}) {
  const fetcher = useFetcher();

  return (
    <div className="display-flex items-start gap-1" style={{ borderTop: "1px solid", paddingTop: "10px" }}>
      <div className="basis-32">&nbsp;</div>
      <div className="basis-64">
        <fetcher.Form method="post">
          <span>Voucher Code: </span><input className="voucherCode" type="text" name="voucherCode" placeholder="Company Name" autoComplete="off" defaultValue={voucherCode} />
          <button
            className="inline-flex cart-btn-checkout"
            name="action"
            value="applyVoucher"
          >
            Apply
          </button>
        </fetcher.Form>
      </div>
      <div className="basis-32 text-center font-bold">
        <span className="text-line-through"> {totalItemCount} </span>/
        <span className="text-red"> {promotionTotalItemCount} </span>
      </div>
      <div className="basis-32 text-right font-bold">
        Total:
      </div>
      <div className="basis-32 text-right font-bold">
        <span className="text-line-through">${grandTotal}</span><br />
        <span className="text-red">${promotionGrandTotal}</span>
      </div>
    </div>
  );
}

export default function IndexCartRouter() {
  const { cartItems, voucherCode = '' } = useLoaderData<LoaderData>();
  const totalItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0) ?? 0;
  const grandTotal = cartItems.reduce(
    (acc: number, item: CartItem) => acc + Number(item.totalPrice),
    0
  ) ?? 0;

  const promotionTotalItemCount = cartItems.reduce((acc, item) => acc + item.promotionQuantity, 0) ?? 0;
  const promotionGrandTotal = cartItems.reduce(
    (acc: number, item: CartItem) => acc + Number(item.promotionTotalPrice),
    0
  ) ?? 0;

  return (
    <>
      <div className="flex-col">
        <div className="display-flex flex-col gap-1">
          <CartItemHeader />
          {cartItems.map((cartItem) => (
            <CartItemRow key={cartItem.productId} cartItem={cartItem} />
          ))}
          <GrandTotalRow
            totalItemCount={totalItemCount}
            grandTotal={Number(grandTotal.toFixed(2))}
            promotionTotalItemCount={promotionTotalItemCount}
            promotionGrandTotal={Number(promotionGrandTotal.toFixed(2))}
            voucherCode={voucherCode}
          />
        </div>
      </div>
    </>
  );
}
