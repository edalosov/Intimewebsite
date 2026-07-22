-- CreateTable
CREATE TABLE "GalleryConfig" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "nftContractAddress" TEXT,
    "chainId" INTEGER NOT NULL DEFAULT 11155111,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GalleryConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Answer" (
    "id" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "tokenId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "answerText" TEXT NOT NULL,
    "signature" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Answer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Answer_walletAddress_tokenId_idx" ON "Answer"("walletAddress", "tokenId");

-- CreateIndex
CREATE UNIQUE INDEX "Answer_walletAddress_tokenId_questionId_key" ON "Answer"("walletAddress", "tokenId", "questionId");

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
