import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Cleaning up testing data (Keeping user accounts safe)...");

  await prisma.payment.deleteMany({});
  console.log("✔ Deleted all Payments");

  await prisma.orderItem.deleteMany({});
  console.log("✔ Deleted all Order Items");

  await prisma.order.deleteMany({});
  console.log("✔ Deleted all Orders");

  await prisma.address.deleteMany({});
  console.log("✔ Deleted all Saved Addresses");

  await prisma.supportTicket.deleteMany({});
  console.log("✔ Deleted all Support Tickets");

  await prisma.coupon.deleteMany({});
  console.log("✔ Deleted all Coupons");

  console.log("🎉 Database cleanup complete! All test orders and addresses removed, user logins remain safe.");
}

main()
  .catch((e) => {
    console.error("Error during cleanup:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });