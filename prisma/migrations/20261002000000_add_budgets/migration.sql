-- CreateTable
CREATE TABLE "budgets" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "month_year" VARCHAR(7) NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "budgets_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "budgets_amount_positive" CHECK ("amount" > 0)
);

-- CreateIndex
CREATE UNIQUE INDEX "budgets_user_id_month_year_key" ON "budgets"("user_id", "month_year");

-- CreateIndex
CREATE INDEX "budgets_user_id_month_year_idx" ON "budgets"("user_id", "month_year");

-- AddForeignKey
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
