-- CreateEnum
CREATE TYPE "Frequency" AS ENUM ('Never', 'Sometimes', 'Often', 'Usually');

-- CreateEnum
CREATE TYPE "Interests" AS ENUM ('SelfCare', 'Calligraphy', 'Meditation', 'Sushi', 'Hockey', 'Basketball', 'HomeWorkout', 'Manga', 'Makeup', 'Aquarium', 'Instagram', 'MartialArts', 'Marvel', 'Jogging', 'Running', 'Travel', 'Languages', 'Movies', 'Gym', 'SocialNetworks', 'SkinCare', 'Cricket', 'Skateboard', 'Vegan', 'KPop', 'Photography', 'Reading', 'Vocals', 'Volleyball', 'Sports', 'Poetry', 'StandUp', 'Coffee', 'Dota2', 'Karaoke', 'Fortnite', 'Pubg', 'Diving', 'NFT', 'AlcoholicTrip', 'Baseball', 'Ballet', 'Feminism', 'Quests', 'Shopping', 'Food', 'Clothes', 'Memes', 'CountryMusic', 'Motorsports', 'Football', 'ACapella', 'Investment', 'GalleryOfArts', 'Hiking', 'Mountains', 'Bowing', 'Talkiiing', 'Fishing', 'IceCream', 'Skates', 'Parties', 'Skiing', 'Snowboarding', 'Pilates', 'Clubs', 'Broadway', 'Cheerleading', 'Choir', 'AutoRacing', 'BikeRacing', 'Content', 'Cybersports', 'Concerts', 'RockClimbing', 'Bakery', 'Camping', 'Blogging', 'Collecting', 'RussianRap', 'RussianRock', 'Automobiles', 'Startups', 'BubbleTea', 'Series', 'Songwriting', 'Tattoos', 'Drawing', 'SupSurfing', 'Surfing', 'Bambindon', 'Bowling', 'ActiveLifestyle', 'Fashion', 'Anime', 'Astrology', 'MBTI', 'Entrepreneurship', 'Cooking', 'Fencing', 'Soccer', 'Arts', 'DIY', 'Politics', 'Museums', 'OutdoorWorkouts', 'TikTok', 'Activism', 'Picnic', 'Twitch', 'Comedy', 'Music', 'Triathlon', 'Netflix', 'Disney', 'RealEstate', 'Podcasts', 'Rave', 'BBQ', 'BBC', 'CraftBeer', 'Swimming', 'Cryptocurrency', 'ColdTea', 'Drums', 'Tea', 'TableGames', 'Quiz', 'Volunteering', 'TableTennis', 'RollerSkating', 'Wine', 'Linux', 'DungeonsAndDragons', 'ElectronicMusic', 'Yoga', 'Boxing', 'Ramen');

-- CreateEnum
CREATE TYPE "LookingFor" AS ENUM ('Love', 'Friendship', 'LikeMinded');

-- CreateEnum
CREATE TYPE "MaritalStatus" AS ENUM ('Free', 'Friendship', 'Complicated', 'Busy');

-- CreateEnum
CREATE TYPE "Personality" AS ENUM ('Introvert', 'Ambivert', 'Extravert', 'INTJ', 'INTP', 'INFJ', 'INFP', 'ISTJ', 'ISTP', 'ISFJ', 'ISFP', 'ENTJ', 'ENTP', 'ENFJ', 'ENFP', 'ESTJ', 'ESTP', 'ESFJ', 'ESFP');

-- CreateEnum
CREATE TYPE "Sex" AS ENUM ('Male', 'Female', 'Helicopter');

-- CreateEnum
CREATE TYPE "SparkType" AS ENUM ('Like', 'Dislike');

-- CreateEnum
CREATE TYPE "Zodiac" AS ENUM ('Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces');

-- CreateTable
CREATE TABLE "RefreshTokenRecord" (
    "id" SERIAL NOT NULL,
    "accountId" INTEGER NOT NULL,
    "clientId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshTokenRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Work" (
    "id" SERIAL NOT NULL,
    "place" TEXT,
    "position" TEXT NOT NULL,
    "profileId" INTEGER NOT NULL,

    CONSTRAINT "Work_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Graduate" (
    "id" SERIAL NOT NULL,
    "place" TEXT,
    "speciality" TEXT NOT NULL,
    "profileId" INTEGER NOT NULL,

    CONSTRAINT "Graduate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contacts" (
    "id" SERIAL NOT NULL,
    "instagram" TEXT,
    "telegram" TEXT,
    "twitter" TEXT,
    "vk" TEXT,
    "profileId" INTEGER NOT NULL,

    CONSTRAINT "Contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" SERIAL NOT NULL,
    "accountId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "searchAgeBoundaries" INTEGER[],
    "sex" "Sex" NOT NULL,
    "height" INTEGER,
    "weight" INTEGER,
    "lookingFor" "LookingFor",
    "maritalStatus" "MaritalStatus",
    "smoking" "Frequency",
    "alcohol" "Frequency",
    "personality" "Personality",
    "zodiac" "Zodiac",
    "about" TEXT,
    "interests" "Interests"[],

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Spark" (
    "id" SERIAL NOT NULL,
    "initiatorId" INTEGER NOT NULL,
    "recipientId" INTEGER NOT NULL,
    "isSubmitted" BOOLEAN NOT NULL DEFAULT false,
    "sparkType" "SparkType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Spark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SparkNotification" (
    "id" SERIAL NOT NULL,
    "sparkId" INTEGER NOT NULL,
    "profileId" INTEGER NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SparkNotification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RefreshTokenRecord_token_key" ON "RefreshTokenRecord"("token");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshTokenRecord_accountId_clientId_key" ON "RefreshTokenRecord"("accountId", "clientId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_email_key" ON "Account"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Work_profileId_key" ON "Work"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "Graduate_profileId_key" ON "Graduate"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "Contacts_profileId_key" ON "Contacts"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_accountId_key" ON "Profile"("accountId");

-- AddForeignKey
ALTER TABLE "RefreshTokenRecord" ADD CONSTRAINT "RefreshTokenRecord_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Work" ADD CONSTRAINT "Work_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Graduate" ADD CONSTRAINT "Graduate_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contacts" ADD CONSTRAINT "Contacts_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Spark" ADD CONSTRAINT "Spark_initiatorId_fkey" FOREIGN KEY ("initiatorId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Spark" ADD CONSTRAINT "Spark_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SparkNotification" ADD CONSTRAINT "SparkNotification_sparkId_fkey" FOREIGN KEY ("sparkId") REFERENCES "Spark"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SparkNotification" ADD CONSTRAINT "SparkNotification_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
