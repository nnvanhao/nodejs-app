import { Request, Response } from "express";
import { prisma } from "./index";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { formatResponse } from "./utils/responseFormatter";

const SECRET_KEY = "your-secret-key"; // Replace with your actual secret key

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    res.json(formatResponse("Users retrieved successfully", users));
  } catch (error) {
    console.error(error);
    res.status(500).json(formatResponse("Internal server error"));
  }
};

export const createUser = async (req: Request, res: Response) => {
  const { email, name, password } = req.body;

  if (!email || !name || !password) {
    return res
      .status(400)
      .json(formatResponse("Email, name, and password are required"));
  }

  try {
    // Check if a user with the same email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res
        .status(400)
        .json(formatResponse("User with this email already exists"));
    }

    // Hash the password and create the new user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, name, password: hashedPassword },
      select: {
        id: true,
        email: true,
      },
    });

    res.json(formatResponse("User created successfully", user));
  } catch (error) {
    console.error(error);
    res.status(500).json(formatResponse("Internal server error"));
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json(formatResponse("Invalid email or password"));
  }

  const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: "1h" });
  res.json(formatResponse("Login successful", { token }));
};

export const logout = async (req: Request, res: Response) => {
  // In a real-world application, you might handle token blacklisting here
  res.json(formatResponse("Logged out successfully"));
};

interface TokenPayload {
  userId: number;
}

export const getUserInfo = async (req: Request, res: Response) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json(formatResponse("No token provided"));
  }

  let decoded: TokenPayload;
  try {
    decoded = jwt.verify(token, SECRET_KEY) as TokenPayload;
  } catch (err) {
    return res.status(403).json(formatResponse("Failed to authenticate token"));
  }

  const userId = decoded.userId;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    return res.status(404).json(formatResponse("User not found"));
  }

  res.json(formatResponse("User information retrieved successfully", user));
};

export const changePassword = async (req: Request, res: Response) => {
  const { oldPassword, newPassword } = req.body;
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json(formatResponse("No token provided"));
  }

  let decoded: TokenPayload;
  try {
    decoded = jwt.verify(token, SECRET_KEY) as TokenPayload;
  } catch (err) {
    return res.status(403).json(formatResponse("Failed to authenticate token"));
  }

  const userId = decoded.userId;

  try {
    // Find the user by ID
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user || !(await bcrypt.compare(oldPassword, user.password))) {
      return res.status(401).json(formatResponse("Invalid old password"));
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    res.json(formatResponse("Password updated successfully"));
  } catch (error) {
    console.error(error);
    res.status(500).json(formatResponse("Internal server error"));
  }
};

export const getMovies = async (req: Request, res: Response) => {
  try {
    const movies = await prisma.movie.findMany({
      include: {
        genres: true, // Include genres in the response
        links: true, // Updated from movieLinks to links to match schema
      },
    });
    res.json(formatResponse("Movies retrieved successfully", movies));
  } catch (error) {
    console.error(error);
    res.status(500).json(formatResponse("Internal server error"));
  }
};

export const createMovie = async (req: Request, res: Response) => {
  const {
    title,
    originalTitle,
    description,
    releaseDate,
    releaseYear,
    rating,
    tagline,
    runtime,
    duration,
    durationUnit,
    language,
    languageCode,
    country,
    posterUrl,
    cast,
    imdbRating,
    budget,
    revenue,
    boxOfficeGross,
    trailerUrl,
    releaseStatus,
    synopsis,
    awards,
    productionCompanies,
    movieType,
    typeId,
    links,
    genreIds, // Ensure this is included in the request body
  } = req.body;

  // Check required fields
  if (!title || !releaseDate || !typeId || !movieType || !genreIds) {
    return res
      .status(400)
      .json(
        formatResponse(
          "Title, release date, type, movieType, and genreIds are required"
        )
      );
  }

  try {
    // Verify if all genres exist
    const genresExist = await prisma.genre.findMany({
      where: {
        id: {
          in: genreIds,
        },
      },
    });

    if (genresExist.length !== genreIds.length) {
      return res
        .status(400)
        .json(formatResponse("One or more genres are invalid"));
    }

    // Create the movie
    const movie = await prisma.movie.create({
      data: {
        title,
        originalTitle,
        description,
        releaseDate: new Date(releaseDate),
        releaseYear,
        rating,
        tagline,
        runtime,
        duration,
        durationUnit,
        language,
        languageCode,
        country,
        posterUrl,
        cast,
        imdbRating,
        budget,
        revenue,
        boxOfficeGross,
        trailerUrl,
        releaseStatus,
        synopsis,
        awards,
        productionCompanies,
        movieType,
        links: {
          create: links || [], // Create movie links only if provided
        },
        genres: {
          connect: genreIds.map((id: number) => ({ id })), // Connect genres
        },
      },
      select: {
        id: true,
        title: true,
        originalTitle: true,
        description: true,
        releaseDate: true,
        releaseYear: true,
        rating: true,
        tagline: true,
        runtime: true,
        duration: true,
        durationUnit: true,
        language: true,
        languageCode: true,
        country: true,
        posterUrl: true,
        cast: true,
        imdbRating: true,
        budget: true,
        revenue: true,
        boxOfficeGross: true,
        trailerUrl: true,
        releaseStatus: true,
        synopsis: true,
        awards: true,
        productionCompanies: true,
        movieType: true,
        links: true,
        genres: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json(formatResponse("Movie created successfully", movie));
  } catch (error) {
    console.error(error);
    res.status(500).json(formatResponse("Internal server error"));
  }
};

export const getMovieById = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  try {
    const movie = await prisma.movie.findUnique({
      where: { id },
      include: {
        genres: true, // Include genres in the response
        links: true, // Updated from movieLinks to links to match schema
      },
    });

    if (!movie) {
      return res.status(404).json(formatResponse("Movie not found"));
    }

    res.json(formatResponse("Movie retrieved successfully", movie));
  } catch (error) {
    console.error(error);
    res.status(500).json(formatResponse("Internal server error"));
  }
};

export const updateMovie = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const {
    title,
    description,
    releaseDate,
    rating,
    duration,
    language,
    country,
    posterUrl,
    links,
    movieType,
    genreIds,
  } = req.body;

  try {
    // Verify if all genres exist
    if (genreIds) {
      const genresExist = await prisma.genre.findMany({
        where: {
          id: {
            in: genreIds,
          },
        },
      });

      if (genresExist.length !== genreIds.length) {
        return res
          .status(400)
          .json(formatResponse("One or more genres are invalid"));
      }
    }

    // Update the movie
    const updatedMovie = await prisma.movie.update({
      where: { id },
      data: {
        title,
        description,
        releaseDate: releaseDate ? new Date(releaseDate) : undefined,
        rating,
        duration,
        language,
        country,
        posterUrl,
        movieType, // Update the movieType
        genres: genreIds
          ? {
              set: genreIds.map((id: number) => ({ id })), // Update genres
            }
          : undefined,
      },
      select: {
        id: true,
        title: true,
        description: true,
        releaseDate: true,
        rating: true,
        duration: true,
        language: true,
        country: true,
        posterUrl: true,
        links: true, // Will be updated separately
        movieType: true,
        genres: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Handle links separately
    if (movieType === "SERIES") {
      if (links) {
        await prisma.movieLink.deleteMany({
          where: { movieId: id },
        });

        await prisma.movieLink.createMany({
          data: links.map((link: { url: string }) => ({
            url: link.url,
            movieId: id,
          })),
        });
      }
    }

    res.json(formatResponse("Movie updated successfully", updatedMovie));
  } catch (error) {
    console.error(error);
    res.status(500).json(formatResponse("Internal server error"));
  }
};

export const deleteMovie = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  try {
    await prisma.movie.delete({
      where: { id },
    });

    res.json(formatResponse("Movie deleted successfully"));
  } catch (error) {
    console.error(error);
    res.status(500).json(formatResponse("Internal server error"));
  }
};

// Function to create a genre
export const createGenre = async (req: Request, res: Response) => {
  const { name } = req.body;

  // Check required fields
  if (!name) {
    return res.status(400).json({ message: "Name is required" });
  }

  try {
    // Create the genre
    const genre = await prisma.genre.create({
      data: {
        name,
      },
    });

    res.status(201).json({ message: "Genre created successfully", genre });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
