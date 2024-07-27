import express from "express";
import {
  createUser,
  getUsers,
  login,
  logout,
  getUserInfo,
  changePassword,
  getMovies,
  getMovieTypes,
  createMovie,
  createMovieType,
} from "./controllers";
import { authenticateToken } from "./middleware";

const router = express.Router();

// Public routes
router.post("/create-user", createUser);
router.post("/login", login);

// Authenticated routes
router.get("/users", authenticateToken, getUsers);
router.get("/user-info", authenticateToken, getUserInfo);
router.post("/change-password", authenticateToken, changePassword);
router.post("/logout", authenticateToken, logout);

router.get("/movies", getMovies);
router.post("/movies", createMovie);
router.get("/movie-types", getMovieTypes);
router.post("/movie-types", createMovieType);

export default router;
