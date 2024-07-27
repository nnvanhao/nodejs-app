/*
  Warnings:

  - Added the required column `movieType` to the `Movie` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MovieTypeEnum" AS ENUM ('MOVIE', 'SERIES');

-- AlterTable
ALTER TABLE "Movie" ADD COLUMN     "awards" TEXT,
ADD COLUMN     "boxOfficeGross" DOUBLE PRECISION,
ADD COLUMN     "budget" DOUBLE PRECISION,
ADD COLUMN     "cast" TEXT,
ADD COLUMN     "durationUnit" TEXT,
ADD COLUMN     "imdbRating" DOUBLE PRECISION,
ADD COLUMN     "languageCode" TEXT,
ADD COLUMN     "movieType" "MovieTypeEnum" NOT NULL,
ADD COLUMN     "originalTitle" TEXT,
ADD COLUMN     "productionCompanies" TEXT,
ADD COLUMN     "releaseStatus" TEXT,
ADD COLUMN     "releaseYear" INTEGER,
ADD COLUMN     "revenue" DOUBLE PRECISION,
ADD COLUMN     "runtime" INTEGER,
ADD COLUMN     "synopsis" TEXT,
ADD COLUMN     "tagline" TEXT,
ADD COLUMN     "trailerUrl" TEXT;

-- CreateTable
CREATE TABLE "MovieLink" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "movieId" INTEGER NOT NULL,

    CONSTRAINT "MovieLink_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MovieLink" ADD CONSTRAINT "MovieLink_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
