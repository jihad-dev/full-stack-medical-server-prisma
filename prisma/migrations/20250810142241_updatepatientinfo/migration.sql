-- AlterTable
ALTER TABLE "PatientHealthData" ALTER COLUMN "hasAllergies" DROP NOT NULL,
ALTER COLUMN "hasDiabetes" DROP NOT NULL,
ALTER COLUMN "smokingStatus" DROP NOT NULL,
ALTER COLUMN "dietaryPreferences" DROP NOT NULL,
ALTER COLUMN "pregnancyStatus" DROP NOT NULL,
ALTER COLUMN "mentalHealthHistory" DROP NOT NULL,
ALTER COLUMN "immunizationStatus" DROP NOT NULL,
ALTER COLUMN "hasPastSurgeries" DROP NOT NULL,
ALTER COLUMN "recentAnxiety" DROP NOT NULL,
ALTER COLUMN "recentDepression" DROP NOT NULL;
