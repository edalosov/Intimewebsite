-- Answer: stop overwriting answers to the same question, and snapshot the
-- artwork's name at submission time (keeps admin views Alchemy-independent).
DROP INDEX "Answer_walletAddress_tokenId_questionId_key";

ALTER TABLE "Answer" ADD COLUMN "tokenName" TEXT;
UPDATE "Answer" SET "tokenName" = '' WHERE "tokenName" IS NULL;
ALTER TABLE "Answer" ALTER COLUMN "tokenName" SET NOT NULL;

CREATE INDEX "Answer_questionId_idx" ON "Answer"("questionId");

-- Question: replace the manually-toggled `active` flag with an explicit
-- availability window. Backfill the existing row so it isn't orphaned:
-- starts when it was created, runs for one year from there.
ALTER TABLE "Question" ADD COLUMN "startsAt" TIMESTAMP(3);
ALTER TABLE "Question" ADD COLUMN "endsAt" TIMESTAMP(3);

UPDATE "Question"
SET "startsAt" = "createdAt",
    "endsAt" = "createdAt" + INTERVAL '1 year'
WHERE "startsAt" IS NULL;

ALTER TABLE "Question" ALTER COLUMN "startsAt" SET NOT NULL;
ALTER TABLE "Question" ALTER COLUMN "endsAt" SET NOT NULL;
ALTER TABLE "Question" DROP COLUMN "active";

CREATE INDEX "Question_startsAt_endsAt_idx" ON "Question"("startsAt", "endsAt");
