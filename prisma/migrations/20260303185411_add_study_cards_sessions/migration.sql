-- CreateEnum
CREATE TYPE "CardSource" AS ENUM ('NOTE', 'ASSIGNMENT', 'MANUAL');

-- CreateEnum
CREATE TYPE "SessionType" AS ENUM ('REVIEW', 'LEARN', 'CRAM');

-- CreateTable
CREATE TABLE "StudyCard" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT,
    "noteId" TEXT,
    "front" TEXT NOT NULL,
    "back" TEXT NOT NULL,
    "source" "CardSource" NOT NULL DEFAULT 'MANUAL',
    "easeFactor" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "interval" INTEGER NOT NULL DEFAULT 0,
    "repetitions" INTEGER NOT NULL DEFAULT 0,
    "nextReviewAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastReviewAt" TIMESTAMP(3),

    CONSTRAINT "StudyCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudyCardReview" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "studyCardId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "quality" INTEGER NOT NULL,
    "easeFactor" DOUBLE PRECISION NOT NULL,
    "interval" INTEGER NOT NULL,

    CONSTRAINT "StudyCardReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudySession" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "courseId" TEXT,
    "type" "SessionType" NOT NULL DEFAULT 'REVIEW',
    "cardsStudied" INTEGER NOT NULL DEFAULT 0,
    "correctCount" INTEGER NOT NULL DEFAULT 0,
    "durationSecs" INTEGER,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "StudySession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StudyCard_userId_nextReviewAt_idx" ON "StudyCard"("userId", "nextReviewAt");

-- CreateIndex
CREATE INDEX "StudyCard_userId_courseId_idx" ON "StudyCard"("userId", "courseId");

-- CreateIndex
CREATE INDEX "StudySession_userId_createdAt_idx" ON "StudySession"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "StudyCard" ADD CONSTRAINT "StudyCard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyCard" ADD CONSTRAINT "StudyCard_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyCard" ADD CONSTRAINT "StudyCard_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "Note"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyCardReview" ADD CONSTRAINT "StudyCardReview_studyCardId_fkey" FOREIGN KEY ("studyCardId") REFERENCES "StudyCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyCardReview" ADD CONSTRAINT "StudyCardReview_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "StudySession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudySession" ADD CONSTRAINT "StudySession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudySession" ADD CONSTRAINT "StudySession_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;
