-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "subscription_status" TEXT NOT NULL DEFAULT 'trial',
    "trial_start_date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "trial_end_date" DATETIME NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'ko',
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Seoul',
    "active_card_theme_id" TEXT,
    "stripe_customer_id" TEXT,
    "stripe_subscription_id" TEXT,
    "total_sessions" INTEGER NOT NULL DEFAULT 0,
    "last_active" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "users_active_card_theme_id_fkey" FOREIGN KEY ("active_card_theme_id") REFERENCES "card_themes" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "daily_tarot_sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "cards" TEXT NOT NULL,
    "memos" TEXT NOT NULL DEFAULT '{}',
    "insights" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "daily_tarot_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "spread_readings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "spread_type" TEXT NOT NULL,
    "spread_name" TEXT NOT NULL,
    "spread_name_en" TEXT NOT NULL,
    "positions" TEXT NOT NULL,
    "insights" TEXT,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "spread_readings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "card_themes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "name_kr" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "name_ja" TEXT,
    "description" TEXT NOT NULL,
    "description_kr" TEXT NOT NULL,
    "description_en" TEXT NOT NULL,
    "description_ja" TEXT,
    "price" REAL NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "style" TEXT NOT NULL,
    "cardAssets" TEXT NOT NULL,
    "thumbnail_url" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "user_theme_ownership" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "card_theme_id" TEXT NOT NULL,
    "purchased_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "purchase_price" REAL NOT NULL,
    "stripe_payment_intent_id" TEXT,
    CONSTRAINT "user_theme_ownership_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_theme_ownership_card_theme_id_fkey" FOREIGN KEY ("card_theme_id") REFERENCES "card_themes" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "stripe_subscription_id" TEXT NOT NULL,
    "stripe_price_id" TEXT NOT NULL,
    "stripe_customer_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "current_period_start" DATETIME NOT NULL,
    "current_period_end" DATETIME NOT NULL,
    "plan" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "canceled_at" DATETIME
);

-- CreateTable
CREATE TABLE "user_analytics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_hash" TEXT NOT NULL,
    "user_id" TEXT,
    "event_type" TEXT NOT NULL,
    "eventData" TEXT NOT NULL DEFAULT '{}',
    "session_id" TEXT,
    "user_agent" TEXT,
    "language" TEXT NOT NULL DEFAULT 'ko',
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Seoul',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_analytics_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ad_impressions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "ad_placement" TEXT NOT NULL,
    "ad_network" TEXT,
    "revenue" REAL NOT NULL DEFAULT 0.0,
    "displayed_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ad_impressions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "system_config" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_stripe_customer_id_key" ON "users"("stripe_customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_stripe_subscription_id_key" ON "users"("stripe_subscription_id");

-- CreateIndex
CREATE UNIQUE INDEX "daily_tarot_sessions_user_id_date_key" ON "daily_tarot_sessions"("user_id", "date");

-- CreateIndex
CREATE INDEX "spread_readings_user_id_created_at_idx" ON "spread_readings"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "spread_readings_spread_type_idx" ON "spread_readings"("spread_type");

-- CreateIndex
CREATE UNIQUE INDEX "user_theme_ownership_user_id_card_theme_id_key" ON "user_theme_ownership"("user_id", "card_theme_id");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_user_id_key" ON "subscriptions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_stripe_subscription_id_key" ON "subscriptions"("stripe_subscription_id");

-- CreateIndex
CREATE INDEX "user_analytics_created_at_idx" ON "user_analytics"("created_at");

-- CreateIndex
CREATE INDEX "user_analytics_event_type_idx" ON "user_analytics"("event_type");

-- CreateIndex
CREATE INDEX "ad_impressions_user_id_displayed_at_idx" ON "ad_impressions"("user_id", "displayed_at");

-- CreateIndex
CREATE UNIQUE INDEX "system_config_key_key" ON "system_config"("key");
