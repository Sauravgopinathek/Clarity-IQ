-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "domain" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Meeting" (
    "id" TEXT NOT NULL,
    "audioUrl" TEXT NOT NULL,
    "summaryJson" JSONB,
    "clientId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Meeting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MeetingValidation" (
    "id" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "validatedBy" TEXT NOT NULL,
    "sentimentAccurate" BOOLEAN,
    "bantAccurate" BOOLEAN,
    "momentumAccurate" BOOLEAN,
    "objectionsAccurate" BOOLEAN,
    "intentAccurate" BOOLEAN,
    "correctedValues" JSONB,
    "overallAccurate" BOOLEAN NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MeetingValidation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModelAccuracyMetric" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "modelName" TEXT NOT NULL,
    "modelType" TEXT NOT NULL,
    "metricName" TEXT NOT NULL,
    "totalValidations" INTEGER NOT NULL DEFAULT 0,
    "correctValidations" INTEGER NOT NULL DEFAULT 0,
    "accuracyPercentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgConfidenceScore" DOUBLE PRECISION,
    "lastCalculated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ModelAccuracyMetric_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "MeetingValidation_meetingId_idx" ON "MeetingValidation"("meetingId");

-- CreateIndex
CREATE INDEX "MeetingValidation_userId_idx" ON "MeetingValidation"("userId");

-- CreateIndex
CREATE INDEX "ModelAccuracyMetric_userId_idx" ON "ModelAccuracyMetric"("userId");

-- CreateIndex
CREATE INDEX "ModelAccuracyMetric_modelName_idx" ON "ModelAccuracyMetric"("modelName");

-- CreateIndex
CREATE UNIQUE INDEX "ModelAccuracyMetric_userId_modelName_metricName_key" ON "ModelAccuracyMetric"("userId", "modelName", "metricName");

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingValidation" ADD CONSTRAINT "MeetingValidation_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE CASCADE ON UPDATE CASCADE;
