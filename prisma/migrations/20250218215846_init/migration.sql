-- CreateTable
CREATE TABLE "mail0_account" (
    "id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "access_token" TEXT,
    "refresh_token" TEXT,
    "id_token" TEXT,
    "access_token_expires_at" TIMESTAMP(6),
    "refresh_token_expires_at" TIMESTAMP(6),
    "scope" TEXT,
    "password" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "mail0_account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mail0_connection" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "picture" TEXT,
    "access_token" TEXT NOT NULL,
    "refresh_token" TEXT,
    "scope" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "expires_at" TIMESTAMP(6) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "mail0_connection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mail0_early_access" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "mail0_early_access_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mail0_session" (
    "id" TEXT NOT NULL,
    "expires_at" TIMESTAMP(6) NOT NULL,
    "token" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "mail0_session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mail0_user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "email_verified" BOOLEAN NOT NULL,
    "image" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "default_connection_id" TEXT,

    CONSTRAINT "mail0_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mail0_verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expires_at" TIMESTAMP(6) NOT NULL,
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),

    CONSTRAINT "mail0_verification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "mail0_connection_email_unique" ON "mail0_connection"("email");

-- CreateIndex
CREATE UNIQUE INDEX "mail0_early_access_email_unique" ON "mail0_early_access"("email");

-- CreateIndex
CREATE UNIQUE INDEX "mail0_session_token_unique" ON "mail0_session"("token");

-- CreateIndex
CREATE UNIQUE INDEX "mail0_user_email_unique" ON "mail0_user"("email");

-- AddForeignKey
ALTER TABLE "mail0_account" ADD CONSTRAINT "mail0_account_user_id_mail0_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "mail0_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "mail0_connection" ADD CONSTRAINT "mail0_connection_user_id_mail0_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "mail0_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "mail0_session" ADD CONSTRAINT "mail0_session_user_id_mail0_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "mail0_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
