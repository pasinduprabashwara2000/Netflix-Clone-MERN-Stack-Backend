import "dotenv/config";
import connectDB from "./config/db";
import app from "./app";

const PORT = Number(process.env.PORT) || 5000;

async function startServer(): Promise<void> {
    if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
        throw new Error("MONGO_URI and JWT_SECRET must be configured");
    }

    await connectDB();

    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
}

startServer().catch((error: unknown) => {
    console.error("Server startup failed:", error);
    process.exit(1);
});
