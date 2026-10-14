import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./config/db";
import userRoutes from "./routes/UserRoutes";
import planRoutes from "./routes/PlanRoutes";
import subscriptionRoutes from "./routes/SubscriptionRoutes";

const app = express();

app.use(
    cors({
        origin: process.env.CLIENT_URL || "http://localhost:5173",
    })
);

app.use(express.json({ limit: "1mb" }));

app.get("/", (_req, res) => {
    res.json({ message: "Netflix Clone API is running" });
});

app.use("/api/user", userRoutes);
app.use("/api/plan", planRoutes);
app.use("/api/subscription", subscriptionRoutes);

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