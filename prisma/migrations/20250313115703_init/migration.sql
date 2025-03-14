-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "userName" VARCHAR(50) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "emailVerifiedAt" TIMESTAMP(3),
    "password" VARCHAR(255) NOT NULL,
    "surname" VARCHAR(100) NOT NULL,
    "identityNo" VARCHAR(20),
    "avatarImage" VARCHAR(255),
    "socialInstagram" VARCHAR(100),
    "socialInstagramBroadcastChannel" VARCHAR(100),
    "socialFacebook" VARCHAR(100),
    "socialFacebookGroup" VARCHAR(100),
    "socialFacebookPage" VARCHAR(100),
    "socialYoutube" VARCHAR(100),
    "socialTiktok" VARCHAR(100),
    "socialLinkedin" VARCHAR(100),
    "socialX" VARCHAR(100),
    "socialWhatsappTelNo" VARCHAR(20),
    "socialWhatsappGroup" VARCHAR(100),
    "socialWhatsappChannel" VARCHAR(100),
    "socialTelegramUsername" VARCHAR(100),
    "socialTelegramGroup" VARCHAR(100),
    "socialTelegramChannel" VARCHAR(100),
    "socialReddit" VARCHAR(100),
    "socialRedditCommunity" VARCHAR(100),
    "phoneNo" VARCHAR(20),
    "githubId" VARCHAR(100),
    "googleId" VARCHAR(100),
    "facebookId" VARCHAR(100),
    "instagramId" VARCHAR(100),
    "registerIp" VARCHAR(45),
    "lastLoggedInIp" VARCHAR(45),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_userName_key" ON "User"("userName");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_userName_idx" ON "User"("userName");
