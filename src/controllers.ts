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

// Get all movies
export const getMovies = async (req: Request, res: Response) => {
  try {
    const movies = await prisma.movie.findMany({
      include: {
        type: true,
      },
    });
    res.json(formatResponse("Movies retrieved successfully", movies));
  } catch (error) {
    console.error(error);
    res.status(500).json(formatResponse("Internal server error"));
  }
};

// Get all movie types
export const getMovieTypes = async (req: Request, res: Response) => {
  try {
    const movieTypes = await prisma.movieType.findMany();
    res.json(formatResponse("Movie types retrieved successfully", movieTypes));
  } catch (error) {
    console.error(error);
    res.status(500).json(formatResponse("Internal server error"));
  }
};

// Create a movie type
export const createMovieType = async (req: Request, res: Response) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json(formatResponse("Name is required"));
  }

  try {
    // Check if a movie type with the same name already exists
    const existingMovieType = await prisma.movieType.findUnique({
      where: { name },
    });

    if (existingMovieType) {
      return res.status(400).json(formatResponse("Movie type already exists"));
    }

    // Create new movie type
    const movieType = await prisma.movieType.create({
      data: { name },
    });

    res.json(formatResponse("Movie type created successfully", movieType));
  } catch (error) {
    console.error(error);
    res.status(500).json(formatResponse("Internal server error"));
  }
};

// Get a movie type by ID
export const getMovieTypeById = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  try {
    const movieType = await prisma.movieType.findUnique({
      where: { id },
    });

    if (!movieType) {
      return res.status(404).json(formatResponse("Movie type not found"));
    }

    res.json(formatResponse("Movie type retrieved successfully", movieType));
  } catch (error) {
    console.error(error);
    res.status(500).json(formatResponse("Internal server error"));
  }
};

// Create a movie
export const createMovie = async (req: Request, res: Response) => {
  const {
    title,
    description,
    releaseDate,
    rating,
    genre,
    director,
    duration,
    language,
    country,
    posterUrl,
    typeId,
  } = req.body;

  // Check required fields
  if (!title || !releaseDate || !typeId) {
    return res
      .status(400)
      .json(formatResponse("Title, release date, and type are required"));
  }

  try {
    // Verify if the movie type exists
    const movieType = await prisma.movieType.findUnique({
      where: { id: typeId },
    });

    if (!movieType) {
      return res.status(400).json(formatResponse("Invalid movie type"));
    }

    // Create the movie
    const movie = await prisma.movie.create({
      data: {
        title,
        description,
        releaseDate: new Date(releaseDate),
        rating,
        genre,
        director,
        duration,
        language,
        country,
        posterUrl,
        type: { connect: { id: typeId } }, // Connect the movie to the type
      },
      select: {
        id: true,
        title: true,
        description: true,
        releaseDate: true,
        rating: true,
        genre: true,
        director: true,
        duration: true,
        language: true,
        country: true,
        posterUrl: true,
        type: {
          select: {
            id: true,
            name: true,
          },
        },
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
