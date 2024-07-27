/*
  Warnings:

  - You are about to drop the `MovieType` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Movie" DROP CONSTRAINT "Movie_typeId_fkey";

-- DropTable
DROP TABLE "MovieType";
