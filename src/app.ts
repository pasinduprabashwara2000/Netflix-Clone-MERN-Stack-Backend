import "dotenv/config";
import express from "express";
import cors from "cors";
import userRoutes from "./routes/UserRoutes";
import planRoutes from "./routes/PlanRoutes";
import subscriptionRoutes from "./routes/SubscriptionRoutes";
import profileRoutes from "./routes/ProfileRoutes";
import genreRoutes from "./routes/GenreRoutes";
import seasonRoutes from "./routes/SeasonRoutes";
import episodeRoutes from "./routes/EpisodeRoutes";
import contentRoutes from "./routes/ContentRoutes";
import authRoutes from "./routes/AuthRoutes";
import historyRoutes from "./routes/HistoryRoutes";
import aiRoutes from "./routes/AiRoutes";

const app = express();

// CLIENT_URL can hold several origins separated by commas (no trailing slash)
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
    .split(",")
    .map((o) => o.trim().replace(/\/+$/, ""))
    .filter(Boolean);

app.set("trust proxy", 1);

app.use(
    cors({
        origin: allowedOrigins,
    })
);

app.use(express.json({ limit: "1mb" }));

app.get(["/", "/api"], (_req, res) => {
    res.json({ message: "Netflix Clone API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/plan", planRoutes);
app.use("/api/subscription", subscriptionRoutes);
app.use("/api/profile", profileRoutes)
app.use("/api/genre", genreRoutes)
app.use("/api/season", seasonRoutes)
app.use("/api/episode", episodeRoutes)
app.use("/api/content", contentRoutes)
app.use("/api/history", historyRoutes)
app.use("/api/ai", aiRoutes)

export default app;
