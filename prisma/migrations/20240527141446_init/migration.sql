-- CreateTable
CREATE TABLE "Engineers" (
    "id" TEXT NOT NULL,
    "work_year" TEXT NOT NULL,
    "experience_level" TEXT NOT NULL,
    "employment_type" TEXT NOT NULL,
    "job_title" TEXT NOT NULL,
    "salary" TEXT NOT NULL,
    "salary_currency" TEXT NOT NULL,
    "salary_in_usd" TEXT NOT NULL,
    "employee_residence" TEXT NOT NULL,
    "remote_ratio" TEXT NOT NULL,
    "company_location" TEXT NOT NULL,
    "company_size" TEXT NOT NULL,

    CONSTRAINT "Engineers_pkey" PRIMARY KEY ("id")
);
