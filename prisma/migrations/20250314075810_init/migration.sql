/*
  Warnings:

  - Added the required column `roleId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "KepTitleType" AS ENUM ('Trader', 'Tradesmen');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "roleId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "subject" TEXT NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "desc" TEXT,
    "slogan" TEXT,
    "logo" TEXT,
    "favicon" TEXT,
    "about" TEXT,
    "phone" TEXT,
    "faxPhone" TEXT,
    "email" TEXT,
    "physicalAddress" TEXT,
    "etbisQrImage" TEXT,
    "etbisLink" TEXT,
    "shipmentPrice" DOUBLE PRECISION,
    "defaultProductImage" TEXT,
    "defaultCategoryImage" TEXT,
    "defaultCategoryIcon" TEXT,
    "defaultBrandImage" TEXT,
    "defaultUserAvatarImage" TEXT,
    "defaultLogoImage" TEXT,
    "defaultCampaignImage" TEXT,
    "defaultSliderImage" TEXT,
    "defaultTestimonialImage" TEXT,
    "kepTitleType" "KepTitleType",
    "kepEmailAddress" TEXT,
    "kepPhoneNo" TEXT,
    "kepBusinnesFullName" TEXT,
    "kepChamberOfMemberShip" TEXT,
    "kepChamberAddress" TEXT,
    "kepTradeTitle" TEXT,
    "kepMersisNo" TEXT,
    "kepHeadquartersAddress" TEXT,
    "kepFullLegalName" TEXT,
    "kepFullLegalSurname" TEXT,
    "kepTaxIdentificationNumber" TEXT,
    "socialInstagram" TEXT,
    "socialInstagramBroadcastChannel" TEXT,
    "socialFacebook" TEXT,
    "socialFacebookGroup" TEXT,
    "socialFacebookPage" TEXT,
    "socialYoutube" TEXT,
    "socialTiktok" TEXT,
    "socialLinkedin" TEXT,
    "socialX" TEXT,
    "socialWhatsappTelNo" TEXT,
    "socialWhatsappGroup" TEXT,
    "socialWhatsappChannel" TEXT,
    "socialTelegramUsername" TEXT,
    "socialTelegramGroup" TEXT,
    "socialTelegramChannel" TEXT,
    "socialReddit" TEXT,
    "socialRedditCommunity" TEXT,
    "googleMapsEmbed" TEXT,
    "yandexMaps" TEXT,
    "appleMaps" TEXT,
    "wazeMaps" TEXT,
    "openStreetMaps" TEXT,
    "transactionGuide" TEXT,
    "privacyPolicy" TEXT,
    "termsAndConditions" TEXT,
    "shippingPolicy" TEXT,
    "returningPolicy" TEXT,
    "primaryLang" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PermissionToRole" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PermissionToRole_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE INDEX "_PermissionToRole_B_index" ON "_PermissionToRole"("B");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PermissionToRole" ADD CONSTRAINT "_PermissionToRole_A_fkey" FOREIGN KEY ("A") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PermissionToRole" ADD CONSTRAINT "_PermissionToRole_B_fkey" FOREIGN KEY ("B") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;
