"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMovie = exports.getMovieTypeById = exports.createMovieType = exports.getMovieTypes = exports.getMovies = exports.changePassword = exports.getUserInfo = exports.logout = exports.login = exports.createUser = exports.getUsers = void 0;
const index_1 = require("./index");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const responseFormatter_1 = require("./utils/responseFormatter");
const SECRET_KEY = "your-secret-key"; // Replace with your actual secret key
const getUsers = async (req, res) => {
    try {
        const users = await index_1.prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        res.json((0, responseFormatter_1.formatResponse)("Users retrieved successfully", users));
    }
    catch (error) {
        console.error(error);
        res.status(500).json((0, responseFormatter_1.formatResponse)("Internal server error"));
    }
};
exports.getUsers = getUsers;
const createUser = async (req, res) => {
    const { email, name, password } = req.body;
    if (!email || !name || !password) {
        return res
            .status(400)
            .json((0, responseFormatter_1.formatResponse)("Email, name, and password are required"));
    }
    try {
        // Check if a user with the same email already exists
        const existingUser = await index_1.prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            return res
                .status(400)
                .json((0, responseFormatter_1.formatResponse)("User with this email already exists"));
        }
        // Hash the password and create the new user
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = await index_1.prisma.user.create({
            data: { email, name, password: hashedPassword },
            select: {
                id: true,
                email: true,
            },
        });
        res.json((0, responseFormatter_1.formatResponse)("User created successfully", user));
    }
    catch (error) {
        console.error(error);
        res.status(500).json((0, responseFormatter_1.formatResponse)("Internal server error"));
    }
};
exports.createUser = createUser;
const login = async (req, res) => {
    const { email, password } = req.body;
    const user = await index_1.prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcryptjs_1.default.compare(password, user.password))) {
        return res.status(401).json((0, responseFormatter_1.formatResponse)("Invalid email or password"));
    }
    const token = jsonwebtoken_1.default.sign({ userId: user.id }, SECRET_KEY, { expiresIn: "1h" });
    res.json((0, responseFormatter_1.formatResponse)("Login successful", { token }));
};
exports.login = login;
const logout = async (req, res) => {
    // In a real-world application, you might handle token blacklisting here
    res.json((0, responseFormatter_1.formatResponse)("Logged out successfully"));
};
exports.logout = logout;
const getUserInfo = async (req, res) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json((0, responseFormatter_1.formatResponse)("No token provided"));
    }
    let decoded;
    try {
        decoded = jsonwebtoken_1.default.verify(token, SECRET_KEY);
    }
    catch (err) {
        return res.status(403).json((0, responseFormatter_1.formatResponse)("Failed to authenticate token"));
    }
    const userId = decoded.userId;
    const user = await index_1.prisma.user.findUnique({
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
        return res.status(404).json((0, responseFormatter_1.formatResponse)("User not found"));
    }
    res.json((0, responseFormatter_1.formatResponse)("User information retrieved successfully", user));
};
exports.getUserInfo = getUserInfo;
const changePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json((0, responseFormatter_1.formatResponse)("No token provided"));
    }
    let decoded;
    try {
        decoded = jsonwebtoken_1.default.verify(token, SECRET_KEY);
    }
    catch (err) {
        return res.status(403).json((0, responseFormatter_1.formatResponse)("Failed to authenticate token"));
    }
    const userId = decoded.userId;
    try {
        // Find the user by ID
        const user = await index_1.prisma.user.findUnique({ where: { id: userId } });
        if (!user || !(await bcryptjs_1.default.compare(oldPassword, user.password))) {
            return res.status(401).json((0, responseFormatter_1.formatResponse)("Invalid old password"));
        }
        // Hash the new password
        const hashedNewPassword = await bcryptjs_1.default.hash(newPassword, 10);
        // Update the user's password
        await index_1.prisma.user.update({
            where: { id: userId },
            data: { password: hashedNewPassword },
        });
        res.json((0, responseFormatter_1.formatResponse)("Password updated successfully"));
    }
    catch (error) {
        console.error(error);
        res.status(500).json((0, responseFormatter_1.formatResponse)("Internal server error"));
    }
};
exports.changePassword = changePassword;
// Get all movies
const getMovies = async (req, res) => {
    try {
        const movies = await index_1.prisma.movie.findMany({
            include: {
                type: true,
            },
        });
        res.json((0, responseFormatter_1.formatResponse)("Movies retrieved successfully", movies));
    }
    catch (error) {
        console.error(error);
        res.status(500).json((0, responseFormatter_1.formatResponse)("Internal server error"));
    }
};
exports.getMovies = getMovies;
// Get all movie types
const getMovieTypes = async (req, res) => {
    try {
        const movieTypes = await index_1.prisma.movieType.findMany();
        res.json((0, responseFormatter_1.formatResponse)("Movie types retrieved successfully", movieTypes));
    }
    catch (error) {
        console.error(error);
        res.status(500).json((0, responseFormatter_1.formatResponse)("Internal server error"));
    }
};
exports.getMovieTypes = getMovieTypes;
// Create a movie type
const createMovieType = async (req, res) => {
    const { name } = req.body;
    if (!name) {
        return res.status(400).json((0, responseFormatter_1.formatResponse)("Name is required"));
    }
    try {
        // Check if a movie type with the same name already exists
        const existingMovieType = await index_1.prisma.movieType.findUnique({
            where: { name },
        });
        if (existingMovieType) {
            return res.status(400).json((0, responseFormatter_1.formatResponse)("Movie type already exists"));
        }
        // Create new movie type
        const movieType = await index_1.prisma.movieType.create({
            data: { name },
        });
        res.json((0, responseFormatter_1.formatResponse)("Movie type created successfully", movieType));
    }
    catch (error) {
        console.error(error);
        res.status(500).json((0, responseFormatter_1.formatResponse)("Internal server error"));
    }
};
exports.createMovieType = createMovieType;
// Get a movie type by ID
const getMovieTypeById = async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const movieType = await index_1.prisma.movieType.findUnique({
            where: { id },
        });
        if (!movieType) {
            return res.status(404).json((0, responseFormatter_1.formatResponse)("Movie type not found"));
        }
        res.json((0, responseFormatter_1.formatResponse)("Movie type retrieved successfully", movieType));
    }
    catch (error) {
        console.error(error);
        res.status(500).json((0, responseFormatter_1.formatResponse)("Internal server error"));
    }
};
exports.getMovieTypeById = getMovieTypeById;
// Create a movie
const createMovie = async (req, res) => {
    const { title, description, releaseDate, rating, genre, director, duration, language, country, posterUrl, typeId, } = req.body;
    // Check required fields
    if (!title || !releaseDate || !typeId) {
        return res
            .status(400)
            .json((0, responseFormatter_1.formatResponse)("Title, release date, and type are required"));
    }
    try {
        // Verify if the movie type exists
        const movieType = await index_1.prisma.movieType.findUnique({
            where: { id: typeId },
        });
        if (!movieType) {
            return res.status(400).json((0, responseFormatter_1.formatResponse)("Invalid movie type"));
        }
        // Create the movie
        const movie = await index_1.prisma.movie.create({
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
        res.json((0, responseFormatter_1.formatResponse)("Movie created successfully", movie));
    }
    catch (error) {
        console.error(error);
        res.status(500).json((0, responseFormatter_1.formatResponse)("Internal server error"));
    }
};
exports.createMovie = createMovie;
