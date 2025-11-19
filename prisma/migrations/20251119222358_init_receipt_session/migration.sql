-- CreateTable
CREATE TABLE "reciept_sessions" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "purchasedItems" JSONB,
    "recallMatches" JSONB,
    "ocrError" TEXT,
    "llmError" TEXT,

    CONSTRAINT "reciept_sessions_pkey" PRIMARY KEY ("id")
);
