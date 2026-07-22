import { prisma } from "@/lib/db";

const DEFAULT_CONFIG = {
  id: 1,
  nftContractAddress: null as string | null,
  chainId: 11155111,
  updatedAt: new Date(0),
};

export async function getGalleryConfig() {
  const config = await prisma.galleryConfig.findUnique({ where: { id: 1 } });
  return config ?? DEFAULT_CONFIG;
}

export async function setGalleryConfig(data: {
  nftContractAddress: string;
  chainId: number;
}) {
  return prisma.galleryConfig.upsert({
    where: { id: 1 },
    update: data,
    create: { id: 1, ...data },
  });
}

export async function getActiveQuestion() {
  return prisma.question.findFirst({
    where: { active: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function setActiveQuestion(text: string) {
  await prisma.question.updateMany({
    where: { active: true },
    data: { active: false },
  });
  return prisma.question.create({
    data: { text, active: true },
  });
}
