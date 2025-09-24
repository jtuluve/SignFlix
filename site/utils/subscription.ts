"use server";

import { db, type Prisma } from "@/utils/prisma";

export async function getSubscriptions() {
  return await db.subscription.findMany({
    include: {
      subscriber: true,
      creator: true,
    },
  });
}

export async function getSubscription(id: string) {
  return await db.subscription.findUnique({
    where: { id },
    include: {
      subscriber: true,
      creator: true,
    },
  });
}

export async function getUserSubscriptions(subscriberId: string) {
  return await db.subscription.findMany({
    where: { subscriberId },
    include: {
      creator: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getUserSubscribers(creatorId: string) {
  return await db.subscription.findMany({
    where: { creatorId },
    include: {
      subscriber: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function checkSubscription(
  subscriberId: string,
  creatorId: string
) {
  return await db.subscription.findFirst({
    where: {
      subscriberId,
      creatorId,
    },
  });
}

export async function toggleSubscription(creatorId: string, subscriberId: string) {
  const existingSubscription = await checkSubscription(subscriberId, creatorId);

  if (existingSubscription) {
    // If already subscribed, unsubscribe
    await deleteSubscription(existingSubscription.id);
    return { subscribed: false };
  } else {
    // If not subscribed, subscribe
    await createSubscription({
      subscriber: { connect: { id: subscriberId } },
      creator: { connect: { id: creatorId } },
    });
    return { subscribed: true };
  }
}

export async function createSubscription(
  subscription: Prisma.SubscriptionCreateInput
) {
  const result = await db.$transaction(async (tx) => {
    const newSubscription = await tx.subscription.create({
      data: subscription,
      include: {
        subscriber: true,
        creator: true,
      },
    });


    await tx.user.update({
      where: { id: newSubscription.creatorId },
      data: { subscribersCount: { increment: 1 } },
    });

    return newSubscription;
  });

  return result;
}

export async function deleteSubscription(id: string) {
  return await db.$transaction(async (tx) => {
    const subscription = await tx.subscription.findUnique({ where: { id } });
    if (!subscription) throw new Error("Subscription not found");

    await tx.subscription.delete({ where: { id } });

    await tx.user.update({
      where: { id: subscription.creatorId },
      data: { subscribersCount: { decrement: 1 } },
    });

    return subscription;
  });
}