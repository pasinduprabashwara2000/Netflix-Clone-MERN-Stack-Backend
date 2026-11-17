import crypto from "crypto";
import Content from "../models/Content";
import Genre from "../models/Genre";
import WatchHistory from "../models/WatchHistory";
import {getOpenAI, CHAT_MODEL} from "../config/openai";
import {toAiError} from "./AiService";

export interface Insights {
    totals : {
        views : number;
        viewsLast7Days : number;
        activeProfiles7Days : number;
        titles : number;
        indexedTitles : number;
    };
    viewsByDay : { date : string; views : number }[];
    topTitles : { id : string; title : string; type : string; views : number }[];
    topGenres : { name : string; views : number }[];
}

const DAY_MS = 24 * 60 * 60 * 1000;

// watch analytics for the admin dashboard (one history row = one profile watched one title)
export async function getInsights() : Promise<Insights> {
    const since = new Date(Date.now() - 6 * DAY_MS);
    since.setUTCHours(0, 0, 0, 0);

    const contentCollection = Content.collection.name;
    const genreCollection = Genre.collection.name;

    const [views, viewsLast7Days, activeProfiles, titles, indexedTitles, byDay, topTitles, topGenres] =
        await Promise.all([
            WatchHistory.countDocuments(),
            WatchHistory.countDocuments({ watchedAt : { $gte : since } }),
            WatchHistory.distinct("profileId", { watchedAt : { $gte : since } }),
            Content.countDocuments(),
            Content.countDocuments({ "embedding.0" : { $exists : true } }),

            WatchHistory.aggregate([
                { $match : { watchedAt : { $gte : since } } },
                { $group : {
                    _id : { $dateToString : { format : "%Y-%m-%d", date : "$watchedAt", timezone : "UTC" } },
                    views : { $sum : 1 }
                } }
            ]),

            WatchHistory.aggregate([
                { $group : { _id : "$contentId", views : { $sum : 1 } } },
                { $sort : { views : -1 } },
                { $limit : 5 },
                { $lookup : { from : contentCollection, localField : "_id", foreignField : "_id", as : "c" } },
                { $unwind : "$c" },
                { $project : { _id : 0, id : { $toString : "$_id" }, title : "$c.title", type : "$c.type", views : 1 } }
            ]),

            WatchHistory.aggregate([
                { $group : { _id : "$contentId", views : { $sum : 1 } } },
                { $lookup : { from : contentCollection, localField : "_id", foreignField : "_id", as : "c" } },
                { $unwind : "$c" },
                { $group : { _id : "$c.genreId", views : { $sum : "$views" } } },
                { $lookup : { from : genreCollection, localField : "_id", foreignField : "_id", as : "g" } },
                { $unwind : { path : "$g", preserveNullAndEmptyArrays : true } },
                { $project : { _id : 0, name : { $ifNull : ["$g.name", "Unknown"] }, views : 1 } },
                { $sort : { views : -1 } },
                { $limit : 6 }
            ])
        ]);

    // one entry for each of the last 7 days, including days with no views
    const counts = new Map<string, number>(byDay.map((d : any) => [d._id as string, d.views as number]));
    const viewsByDay = Array.from({ length : 7 }, (_, i) => {
        const date = new Date(since.getTime() + i * DAY_MS).toISOString().slice(0, 10);
        return { date, views : counts.get(date) ?? 0 };
    });

    return {
        totals : {
            views,
            viewsLast7Days,
            activeProfiles7Days : activeProfiles.length,
            titles,
            indexedTitles
        },
        viewsByDay,
        topTitles,
        topGenres
    };
}

// ---------- AI written summary (cached so repeated clicks don't cost tokens) ----------

const SUMMARY_TTL_MS = 10 * 60 * 1000;
let summaryCache : { key : string; text : string; at : number } | null = null;

export async function summarize(insights : Insights) : Promise<string> {
    const payload = JSON.stringify(insights);
    const key = crypto.createHash("sha1").update(payload).digest("hex");

    if (summaryCache && summaryCache.key === key && Date.now() - summaryCache.at < SUMMARY_TTL_MS) {
        return summaryCache.text;
    }

    try {
        const completion = await getOpenAI().chat.completions.create({
            model : CHAT_MODEL,
            max_completion_tokens : 400,
            messages : [
                {
                    role : "system",
                    content :
                        "You are an analyst for a streaming service admin. Using ONLY the JSON statistics provided, " +
                        "write 3 short sentences describing what viewers watch, then exactly 2 bullet suggestions " +
                        "(lines starting with '- ') for the catalog or marketing team. Do not invent numbers. " +
                        "If the data is empty, say there is not enough viewing data yet."
                },
                { role : "user", content : payload }
            ]
        });

        const text = completion.choices[0]?.message?.content?.trim() || "No summary was generated.";
        summaryCache = { key, text, at : Date.now() };
        return text;
    } catch (error) {
        throw toAiError(error);
    }
}
