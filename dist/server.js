"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
const PORT = process.env.PORT || 3000;
index_1.app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
// Ensure to disconnect Prisma client when the application terminates
process.on('SIGINT', async () => {
    await index_1.prisma.$disconnect();
    process.exit(0);
});
