-- CreateTable
CREATE TABLE "PendingCode" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "lang" TEXT NOT NULL DEFAULT 'ua',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PendingCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PendingCode_email_key" ON "PendingCode"("email");

-- CreateIndex
CREATE INDEX "PendingCode_email_idx" ON "PendingCode"("email");
