-- CreateTable
CREATE TABLE "Employee" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "dept" TEXT NOT NULL,
    "date_of_birth" TIMESTAMP(3) NOT NULL,
    "gender" TEXT NOT NULL,
    "salary" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);
