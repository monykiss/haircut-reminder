import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...\n");

  // Create admin user
  const passwordHash = await hash("Demo1234!", 12);
  const admin = await prisma.adminUser.upsert({
    where: { email: "admin@demo.com" },
    update: { passwordHash },
    create: {
      email: "admin@demo.com",
      passwordHash,
    },
  });
  console.log(`✅ Admin: ${admin.email} / Demo1234!`);

  // Create sample clients
  const clientsData = [
    {
      name: "Carlos Rivera",
      phone: "+17875551001",
      reminderDay: 1,
      notes: "Prefers skin fade. Comes every 3 weeks.",
    },
    {
      name: "Marcus Johnson",
      phone: "+17875551002",
      reminderDay: 8,
      notes: "Taper with beard trim.",
    },
    {
      name: "David Chen",
      phone: "+17875551003",
      reminderDay: 15,
      notes: "Classic pompadour style.",
    },
    {
      name: "James Wilson",
      phone: "+17875551004",
      reminderDay: 22,
      notes: "Buzz cut, quick appointment.",
    },
    {
      name: "Miguel Santos",
      phone: "+17875551005",
      reminderDay: 28,
      notes: null,
    },
  ];

  const clients = [];
  for (const data of clientsData) {
    const client = await prisma.client.upsert({
      where: { phone: data.phone },
      update: data,
      create: data,
    });
    clients.push(client);
    console.log(`✅ Client: ${client.name} (Day ${client.reminderDay})`);
  }

  // Create sample SMS logs
  const statuses = ["sent", "sent", "sent", "demo", "sent", "sent", "demo", "sent", "failed", "sent"];
  const messages = [
    "Hey Carlos! 💈 Time for your monthly cut. Give us a call or book online. Reply STOP to opt out.",
    "Hey Marcus! 💈 Time for your monthly cut. Give us a call or book online. Reply STOP to opt out.",
    "Hey David! 💈 Time for your monthly cut. Give us a call or book online. Reply STOP to opt out.",
    "Hey James! 💈 Time for your monthly cut. Give us a call or book online. Reply STOP to opt out.",
    "Hey Miguel! 💈 Time for your monthly cut. Give us a call or book online. Reply STOP to opt out.",
    "Hey Carlos! 💈 Time for your monthly cut. Give us a call or book online. Reply STOP to opt out.",
    "Hey Marcus! 💈 Time for your monthly cut. Give us a call or book online. Reply STOP to opt out.",
    "Hey David! 💈 Time for your monthly cut. Give us a call or book online. Reply STOP to opt out.",
    "Hey James! 💈 Time for your monthly cut. Give us a call or book online. Reply STOP to opt out.",
    "Hey Miguel! 💈 Time for your monthly cut. Give us a call or book online. Reply STOP to opt out.",
  ];

  for (let i = 0; i < 10; i++) {
    const client = clients[i % clients.length];
    const daysAgo = (10 - i) * 3;
    const sentAt = new Date();
    sentAt.setDate(sentAt.getDate() - daysAgo);

    await prisma.smsLog.create({
      data: {
        clientId: client.id,
        message: messages[i],
        status: statuses[i],
        twilioSid: statuses[i] === "sent" ? `SM${Date.now()}${i}` : null,
        sentAt,
      },
    });
  }
  console.log(`✅ Created 10 SMS logs\n`);

  console.log("🎉 Seed complete!");
  console.log("   Login: admin@demo.com / Demo1234!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
