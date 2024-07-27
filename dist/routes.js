"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controllers_1 = require("./controllers");
const middleware_1 = require("./middleware");
const router = express_1.default.Router();
// Public routes
router.post("/create-user", controllers_1.createUser);
router.post("/login", controllers_1.login);
// Authenticated routes
router.get("/users", middleware_1.authenticateToken, controllers_1.getUsers);
router.get("/user-info", middleware_1.authenticateToken, controllers_1.getUserInfo);
router.post("/change-password", middleware_1.authenticateToken, controllers_1.changePassword);
router.post("/logout", middleware_1.authenticateToken, controllers_1.logout);
router.get("/movies", controllers_1.getMovies);
router.post("/movies", controllers_1.createMovie);
router.get("/movie-types", controllers_1.getMovieTypes);
router.post("/movie-types", controllers_1.createMovieType);
exports.default = router;
