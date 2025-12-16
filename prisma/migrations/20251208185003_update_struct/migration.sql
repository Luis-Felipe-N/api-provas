-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "externalId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "acronym" TEXT,
    "sphere" TEXT,
    "state" TEXT,
    "slug" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "boards" (
    "id" TEXT NOT NULL,
    "externalId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "acronym" TEXT,
    "isOab" BOOLEAN NOT NULL DEFAULT false,
    "slug" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "boards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "positions" (
    "id" TEXT NOT NULL,
    "externalId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "slug" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "positions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notices" (
    "id" TEXT NOT NULL,
    "externalId" INTEGER NOT NULL,
    "slug" TEXT,
    "enrollmentStart" TIMESTAMP(3),
    "enrollmentEnd" TIMESTAMP(3),
    "plannedApplication" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "careers" (
    "id" TEXT NOT NULL,
    "externalId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "careers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "areas" (
    "id" TEXT NOT NULL,
    "externalId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "areas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_records" (
    "id" TEXT NOT NULL,
    "externalId" INTEGER NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "level" TEXT NOT NULL,
    "questionCount" INTEGER NOT NULL,
    "durationMinutes" INTEGER,
    "reviewed" BOOLEAN NOT NULL DEFAULT false,
    "hasPendencies" BOOLEAN NOT NULL DEFAULT false,
    "available" BOOLEAN NOT NULL DEFAULT false,
    "observations" TEXT,
    "otherData" TEXT,
    "timestamp" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "applicationDate" TIMESTAMP(3),
    "examFileKey" TEXT,
    "answerKeyFileKey" TEXT,
    "organizationId" TEXT NOT NULL,
    "boardId" TEXT NOT NULL,
    "positionId" TEXT NOT NULL,
    "noticeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exam_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_record_careers" (
    "id" TEXT NOT NULL,
    "examRecordId" TEXT NOT NULL,
    "careerId" TEXT NOT NULL,

    CONSTRAINT "exam_record_careers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_record_areas" (
    "id" TEXT NOT NULL,
    "examRecordId" TEXT NOT NULL,
    "areaId" TEXT NOT NULL,

    CONSTRAINT "exam_record_areas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_record_parts" (
    "id" TEXT NOT NULL,
    "examRecordId" TEXT NOT NULL,
    "externalId" INTEGER,
    "description" TEXT NOT NULL,

    CONSTRAINT "exam_record_parts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "organizations_externalId_key" ON "organizations"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "boards_externalId_key" ON "boards"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "positions_externalId_key" ON "positions"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "notices_externalId_key" ON "notices"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "careers_externalId_key" ON "careers"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "areas_externalId_key" ON "areas"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "exam_records_externalId_key" ON "exam_records"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "exam_records_slug_key" ON "exam_records"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "exam_record_careers_examRecordId_careerId_key" ON "exam_record_careers"("examRecordId", "careerId");

-- CreateIndex
CREATE UNIQUE INDEX "exam_record_areas_examRecordId_areaId_key" ON "exam_record_areas"("examRecordId", "areaId");

-- AddForeignKey
ALTER TABLE "exam_records" ADD CONSTRAINT "exam_records_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_records" ADD CONSTRAINT "exam_records_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "boards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_records" ADD CONSTRAINT "exam_records_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "positions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_records" ADD CONSTRAINT "exam_records_noticeId_fkey" FOREIGN KEY ("noticeId") REFERENCES "notices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_record_careers" ADD CONSTRAINT "exam_record_careers_examRecordId_fkey" FOREIGN KEY ("examRecordId") REFERENCES "exam_records"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_record_careers" ADD CONSTRAINT "exam_record_careers_careerId_fkey" FOREIGN KEY ("careerId") REFERENCES "careers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_record_areas" ADD CONSTRAINT "exam_record_areas_examRecordId_fkey" FOREIGN KEY ("examRecordId") REFERENCES "exam_records"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_record_areas" ADD CONSTRAINT "exam_record_areas_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "areas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_record_parts" ADD CONSTRAINT "exam_record_parts_examRecordId_fkey" FOREIGN KEY ("examRecordId") REFERENCES "exam_records"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
