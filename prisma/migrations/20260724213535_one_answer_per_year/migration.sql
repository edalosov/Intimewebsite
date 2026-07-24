-- Enforce one answer per (wallet, token, question) going forward. Any
-- existing duplicates (from before this rule existed) are collapsed down
-- to the most recent submission per group before the constraint is added,
-- so the migration can't fail on pre-existing data.
DELETE FROM "Answer"
WHERE id IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (
      PARTITION BY "walletAddress", "tokenId", "questionId"
      ORDER BY "createdAt" DESC, id DESC
    ) AS rn
    FROM "Answer"
  ) ranked
  WHERE rn > 1
);

CREATE UNIQUE INDEX "Answer_walletAddress_tokenId_questionId_key" ON "Answer"("walletAddress", "tokenId", "questionId");
