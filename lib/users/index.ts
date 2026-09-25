import { prisma } from "@/lib/prisma";

export async function findUserByEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  return prisma.user.findUnique({
    where: { email: normalizedEmail },
  });
}

export async function findUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
  });
}

export async function createUser(email: string, passwordHash: string) {
  const normalizedEmail = email.trim().toLowerCase();
  return prisma.user.create({
    data: {
      email: normalizedEmail,
      passwordHash,
    },
  });
}
