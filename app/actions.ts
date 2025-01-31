"use server";

import {
  AddressTo,
  LineItemBase,
  PrintifyOrderExistingProductRequest,
  PrintifyOrderResponse,
} from "@/interfaces/PrintifyTypes";
import { PRINTIFY_BASE_URL } from "./data/consts";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { log } from "../functions/log";
import { redirect } from "next/navigation";

export async function emailFormAction(formData: FormData) {
  const rawFormData = Object.fromEntries(formData.entries());
  const schema = z.object({
    email: z.string(),
  });
  const parsedFormData = schema.parse(rawFormData);
  const { email } = parsedFormData;
  log({ email });
  // ... send email
}

export async function processPersonalDetailsForm(formData: FormData) {
  const rawFormData = Object.fromEntries(formData.entries());
  const schema = z.object({
    first_name: z.string(),
    last_name: z.string(),
    email: z.string(),
    phone: z.string(),
    country: z.string(),
    region: z.string(),
    address1: z.string(),
    address2: z.string(),
    city: z.string(),
    zip: z.string(),
    productId: z.string(),
  });
  const parsedFormData = schema.parse(rawFormData);
  const {
    first_name,
    last_name,
    email,
    phone,
    country,
    region,
    address1,
    address2,
    city,
    zip,
    productId,
  } = parsedFormData;
  log({
    first_name,
    last_name,
    email,
    phone,
    country,
    region,
    address1,
    address2,
    city,
    zip,
    productId,
  });
  const address_to = {
    first_name,
    last_name,
    email,
    phone,
    country,
    region,
    address1,
    address2,
    city,
    zip,
  };

  log({ address_to });
  const line_items: LineItemBase[] = [
    {
      product_id: productId,
      variant_id: 12124, // make me dynamic
      quantity: 1,
    },
  ];
  const shipping_method = 1; // make me dynamic
  const orderId = await createPrintifyOrderForExistingProduct(
    line_items,
    shipping_method,
    address_to,
  );
  log({ orderId });
  redirect(`/payment/${orderId}`);
}

async function createPrintifyOrderForExistingProduct(
  line_items: LineItemBase[],
  shipping_method: number,
  address_to: AddressTo,
) {
  const endpoint = `${PRINTIFY_BASE_URL}/v1/shops/${process.env.SHOP_ID}/orders.json`;
  const body: PrintifyOrderExistingProductRequest = {
    external_id: uuidv4(),
    line_items,
    shipping_method,
    send_shipping_notification: true,
    address_to,
  };
  const options: RequestInit = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${process.env.PRINTIFY_API_TOKEN}`,
    },
    body: JSON.stringify(body),
  };
  log({ endpoint, options });
  const orderResponse = (await (
    await fetch(endpoint, options)
  ).json()) as PrintifyOrderResponse;
  log({ orderResponse });
  return orderResponse.id;
}
