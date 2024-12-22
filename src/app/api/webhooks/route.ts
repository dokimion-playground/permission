import { clerkClient, WebhookEvent } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { Webhook } from "svix";

export async function POST(req: Request) {
  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return (
      new Response("error"),
      {
        status: 400,
      }
    );
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET as string);
  let event: WebhookEvent;

  try {
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("error verifying", err);
    return new Response("error", {
      status: 400,
    });
  }

  const clerk = await clerkClient();
  switch (event.type) {
    case "user.created": {
      await clerk.users.updateUser(event.data.id, {
        publicMetadata: {
          roles: ["user"],
        },
      });
      break;
    }
  }

  return new Response("", { status: 200 });
}
