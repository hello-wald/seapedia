-- CreateTable
CREATE TABLE "SystemClock" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "offsetDays" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemClock_pkey" PRIMARY KEY ("id")
);
