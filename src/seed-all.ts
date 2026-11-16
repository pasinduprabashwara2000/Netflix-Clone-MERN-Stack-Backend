/**
 * Full seed covering ALL 8 collections with real data:
 *   User (2), Profile (3), Plan (4), Subscription (2), Genre (14),
 *   Content (25 US movies + 16 K-dramas), Season (21), Episode (278).
 *
 * Self-contained: data + seeder in this one file. Put it in src/ next to server.ts.
 *
 * Usage (project root, MONGO_URI in .env):
 *   npx tsx src/seed-all.ts            -> upserts (safe to run many times, no duplicates)
 *   npx tsx src/seed-all.ts --fresh    -> deletes ALL 8 collections first, then inserts
 *   npx tsx src/seed-all.ts --dry      -> prints counts only, no DB connection
 *
 * Logins created:
 *   Admin : admin@hotflix.test  /  Admin@123
 *   User  : user@hotflix.test   /  User@123
 *
 * Posters/banners are placeholder images; video is a public sample; trailer is a YouTube
 * search link. Replace them from the admin panel when you have real URLs.
 */
import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import User from "./models/User";
import Profile from "./models/Profile";
import Plan from "./models/Plan";
import Subscription from "./models/Subscription";
import Genre from "./models/Genre";
import Content from "./models/Content";
import Season from "./models/Season";
import Episode from "./models/Episode";

/* ===================== USERS / PROFILES / PLANS ===================== */
const usersData = [
    {name: "Hotflix Admin", email: "admin@hotflix.test", password: "Admin@123", role: "Admin"},
    {name: "Pasindu Prabashwara", email: "user@hotflix.test", password: "User@123", role: "User"},
];

// userEmail -> profiles
const profilesData: Record<string, {name: string; isKids: boolean; language: string; maturityLevel: string}[]> = {
    "admin@hotflix.test": [
        {name: "Admin", isKids: false, language: "English", maturityLevel: "18+"},
    ],
    "user@hotflix.test": [
        {name: "Pasindu", isKids: false, language: "English", maturityLevel: "18+"},
        {name: "Kids", isKids: true, language: "English", maturityLevel: "7+"},
    ],
};

const plansData = [
    {name: "Mobile", price: 2.99, maxStreams: 1, videoQuality: "480p"},
    {name: "Basic", price: 6.99, maxStreams: 1, videoQuality: "720p"},
    {name: "Standard", price: 12.99, maxStreams: 2, videoQuality: "1080p"},
    {name: "Premium", price: 17.99, maxStreams: 4, videoQuality: "4K + HDR"},
];

// userEmail -> subscription
const subscriptionsData = [
    {email: "admin@hotflix.test", plan: "Premium", status: "Active", daysAgo: 5, months: 12, paymentRef: "PAY-2026-000001"},
    {email: "user@hotflix.test", plan: "Standard", status: "Active", daysAgo: 12, months: 1, paymentRef: "PAY-2026-000002"},
];

const genresData: [string, string][] = [
    ["Action", "High-energy stories driven by fights, chases and explosive set pieces."],
    ["Drama", "Character-driven stories with emotional depth."],
    ["Comedy", "Light-hearted titles built to make you laugh."],
    ["Romance", "Love stories and relationships."],
    ["Thriller", "Tense plots that keep you on the edge of your seat."],
    ["Crime", "Investigations, heists and the criminal underworld."],
    ["Sci-Fi", "Futuristic worlds, technology and space exploration."],
    ["Fantasy", "Magic, myth and imaginary worlds."],
    ["Horror", "Scary and suspenseful stories meant to unsettle."],
    ["Mystery", "Puzzles and whodunits to solve."],
    ["War", "Stories of conflict and survival."],
    ["Animation", "Animated films and series for all ages."],
    ["Biography", "Stories based on real people and events."],
    ["K-Drama", "Korean television dramas."],
];

/* ============================ DATA ============================ */

// [title, year, maturity, runtimeMins, avgRating, featured, description]
export type MovieRow = [string, number, string, number, number, boolean, string];

export const usMovies: MovieRow[] = [
    ["The Shawshank Redemption", 1994, "R", 142, 9.3, true, "A banker convicted of murder forms an unlikely friendship in prison and never gives up hope of freedom."],
    ["The Godfather", 1972, "R", 175, 9.2, true, "The aging patriarch of a New York crime dynasty hands control to his reluctant youngest son."],
    ["The Dark Knight", 2008, "PG-13", 152, 9.0, true, "Batman faces the Joker, a chaotic criminal mastermind who pushes Gotham to its breaking point."],
    ["Pulp Fiction", 1994, "R", 154, 8.9, false, "Interlocking stories of hitmen, a boxer and a gangster's wife unfold across Los Angeles."],
    ["Forrest Gump", 1994, "PG-13", 142, 8.8, false, "A kind-hearted man from Alabama drifts through decades of American history."],
    ["Inception", 2010, "PG-13", 148, 8.8, true, "A thief who steals secrets from dreams is offered a chance to plant an idea instead."],
    ["Fight Club", 1999, "R", 139, 8.8, false, "An insomniac office worker and a soap salesman start an underground fight club."],
    ["The Matrix", 1999, "R", 136, 8.7, false, "A hacker learns his reality is a simulation and joins a rebellion against its machine rulers."],
    ["Goodfellas", 1990, "R", 145, 8.7, false, "The rise and fall of Henry Hill inside the New York mafia."],
    ["Interstellar", 2014, "PG-13", 169, 8.7, true, "Astronauts travel through a wormhole in search of a new home for humanity."],
    ["Saving Private Ryan", 1998, "R", 169, 8.6, false, "A squad of soldiers is sent behind enemy lines to bring one paratrooper home."],
    ["Gladiator", 2000, "R", 155, 8.5, false, "A betrayed Roman general returns as a gladiator to take revenge on the emperor."],
    ["Back to the Future", 1985, "PG", 116, 8.5, false, "A teenager is accidentally sent to 1955 and must make sure his parents fall in love."],
    ["The Lion King", 1994, "G", 88, 8.5, false, "A young lion prince flees his kingdom, then returns to claim his place."],
    ["Django Unchained", 2012, "R", 165, 8.5, false, "A freed slave teams up with a bounty hunter to rescue his wife from a plantation owner."],
    ["Whiplash", 2014, "R", 106, 8.5, false, "A young jazz drummer is pushed to the limit by a ruthless instructor."],
    ["Spider-Man: Into the Spider-Verse", 2018, "PG", 117, 8.4, false, "Miles Morales becomes Spider-Man and meets heroes from other dimensions."],
    ["Avengers: Endgame", 2019, "PG-13", 181, 8.4, false, "The Avengers assemble one last time to undo the damage done by Thanos."],
    ["Joker", 2019, "R", 122, 8.4, false, "A struggling comedian in Gotham City slowly descends into madness and crime."],
    ["Oppenheimer", 2023, "R", 180, 8.3, true, "The story of J. Robert Oppenheimer and the creation of the atomic bomb."],
    ["Toy Story", 1995, "G", 81, 8.3, false, "A cowboy doll feels threatened when a new space ranger toy arrives in his owner's room."],
    ["Top Gun: Maverick", 2022, "PG-13", 130, 8.2, false, "After thirty years, Maverick trains a new generation of pilots for a near-impossible mission."],
    ["Jurassic Park", 1993, "PG-13", 127, 8.2, false, "A theme park of cloned dinosaurs turns deadly when the security systems fail."],
    ["The Social Network", 2010, "PG-13", 120, 7.8, false, "The founding of Facebook and the legal battles that followed."],
    ["Titanic", 1997, "PG-13", 194, 7.9, false, "A young couple from different worlds fall in love aboard the doomed ocean liner."],
];

// seasons: [seasonTitle, releaseYear, episodeCount]
export type DramaRow = {
    title: string;
    year: number;
    maturity: string;
    episodeMins: number;
    rating: number;
    featured: boolean;
    description: string;
    seasons: [string, number, number][];
};

export const kdramas: DramaRow[] = [
    {title: "Crash Landing on You", year: 2019, maturity: "TV-14", episodeMins: 75, rating: 8.7, featured: true,
        description: "A South Korean heiress paragliding accident drops her in North Korea, where an army officer hides her.",
        seasons: [["Season 1", 2019, 16]]},
    {title: "Squid Game", year: 2021, maturity: "TV-MA", episodeMins: 60, rating: 8.0, featured: true,
        description: "Hundreds of cash-strapped contestants risk their lives in deadly children's games for a huge prize.",
        seasons: [["Season 1", 2021, 9], ["Season 2", 2024, 7], ["Season 3", 2025, 6]]},
    {title: "Goblin", year: 2016, maturity: "TV-14", episodeMins: 75, rating: 8.6, featured: false,
        description: "An immortal goblin seeks a human bride who can end his endless life, and meets a grim reaper along the way.",
        seasons: [["Season 1", 2016, 16]]},
    {title: "Descendants of the Sun", year: 2016, maturity: "TV-14", episodeMins: 60, rating: 8.2, featured: false,
        description: "A soldier and a surgeon fall in love, then meet again on an overseas mission in a disaster zone.",
        seasons: [["Season 1", 2016, 16]]},
    {title: "It's Okay to Not Be Okay", year: 2020, maturity: "TV-14", episodeMins: 80, rating: 8.7, featured: false,
        description: "A caregiver at a psychiatric ward and a children's book author with an antisocial personality heal each other.",
        seasons: [["Season 1", 2020, 16]]},
    {title: "Reply 1988", year: 2015, maturity: "TV-14", episodeMins: 90, rating: 9.2, featured: false,
        description: "Five neighbourhood families and their teenage children share joys and hardships in Seoul in 1988.",
        seasons: [["Season 1", 2015, 20]]},
    {title: "Hospital Playlist", year: 2020, maturity: "TV-14", episodeMins: 90, rating: 8.7, featured: false,
        description: "Five doctors who have been friends since medical school balance work, love and music.",
        seasons: [["Season 1", 2020, 12], ["Season 2", 2021, 12]]},
    {title: "Itaewon Class", year: 2020, maturity: "TV-14", episodeMins: 70, rating: 8.2, featured: false,
        description: "An ex-convict opens a small restaurant in Itaewon to take revenge on a powerful food-service empire.",
        seasons: [["Season 1", 2020, 16]]},
    {title: "Vincenzo", year: 2021, maturity: "TV-MA", episodeMins: 80, rating: 8.4, featured: false,
        description: "A Korean-born Italian mafia lawyer returns to Seoul and fights a ruthless conglomerate.",
        seasons: [["Season 1", 2021, 20]]},
    {title: "Kingdom", year: 2019, maturity: "TV-MA", episodeMins: 50, rating: 8.3, featured: false,
        description: "A crown prince investigates a mysterious plague that turns the dead into flesh-hungry creatures.",
        seasons: [["Season 1", 2019, 6], ["Season 2", 2020, 6]]},
    {title: "Hotel del Luna", year: 2019, maturity: "TV-14", episodeMins: 70, rating: 8.0, featured: false,
        description: "A hotel in Seoul serves ghosts, run by a centuries-old owner and her new human manager.",
        seasons: [["Season 1", 2019, 16]]},
    {title: "My Mister", year: 2018, maturity: "TV-14", episodeMins: 80, rating: 8.6, featured: false,
        description: "A tired middle-aged engineer and a young woman weighed down by debt find comfort in each other.",
        seasons: [["Season 1", 2018, 16]]},
    {title: "The Glory", year: 2022, maturity: "TV-MA", episodeMins: 50, rating: 8.1, featured: true,
        description: "A woman who suffered brutal school bullying spends years planning her revenge.",
        seasons: [["Part 1", 2022, 8], ["Part 2", 2023, 8]]},
    {title: "Extraordinary Attorney Woo", year: 2022, maturity: "TV-14", episodeMins: 70, rating: 8.2, featured: false,
        description: "A brilliant young lawyer on the autism spectrum takes on her first cases at a top law firm.",
        seasons: [["Season 1", 2022, 16]]},
    {title: "Moving", year: 2023, maturity: "TV-MA", episodeMins: 50, rating: 8.4, featured: false,
        description: "Teenagers with superpowers and their parents, former secret agents, face a threat from the past.",
        seasons: [["Season 1", 2023, 20]]},
    {title: "Queen of Tears", year: 2024, maturity: "TV-14", episodeMins: 80, rating: 8.1, featured: false,
        description: "A department-store heiress and her husband rediscover their love as their marriage faces its biggest crisis.",
        seasons: [["Season 1", 2024, 16]]},
];

/* =========================== SEEDER =========================== */
const SAMPLE_VIDEO = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";
const poster = (t: string) => `https://placehold.co/400x600/141414/e50914?text=${encodeURIComponent(t)}`;
const banner = (t: string) => `https://placehold.co/1600x900/141414/e50914?text=${encodeURIComponent(t)}`;
const thumb = (t: string) => `https://placehold.co/640x360/141414/e50914?text=${encodeURIComponent(t)}`;
const trailer = (t: string) => `https://www.youtube.com/results?search_query=${encodeURIComponent(t + " official trailer")}`;
const avatar = (n: string) => `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(n)}`;
const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);
const addMonths = (d: Date, m: number) => { const r = new Date(d); r.setMonth(r.getMonth() + m); return r; };

async function main() {
    const dry = process.argv.includes("--dry");
    const fresh = process.argv.includes("--fresh");

    const episodeTotal = kdramas.reduce((n, d) => n + d.seasons.reduce((m, s) => m + s[2], 0), 0);
    const seasonTotal = kdramas.reduce((n, d) => n + d.seasons.length, 0);
    const profileTotal = Object.values(profilesData).reduce((n, p) => n + p.length, 0);
    console.log(
        `Prepared: ${usersData.length} users, ${profileTotal} profiles, ${plansData.length} plans, ` +
        `${subscriptionsData.length} subscriptions, ${genresData.length} genres, ` +
        `${usMovies.length + kdramas.length} content, ${seasonTotal} seasons, ${episodeTotal} episodes`,
    );
    if (dry) return;

    if (!process.env.MONGO_URI) throw new Error("MONGO_URI is not set in .env");
    await mongoose.connect(process.env.MONGO_URI);

    if (fresh) {
        await Promise.all([
            Episode, Season, Content, Genre, Subscription, Plan, Profile, User,
        ].map((m: any) => m.deleteMany({})));
        console.log("All 8 collections emptied (--fresh)");
    }

    // ---- Genres (by name)
    await Genre.bulkWrite(genresData.map(([name, description]) => ({
        updateOne: {filter: {name}, update: {$set: {name, description}}, upsert: true},
    })));

    // ---- Plans (by name)
    await Plan.bulkWrite(plansData.map((p) => ({
        updateOne: {filter: {name: p.name}, update: {$set: p}, upsert: true},
    })));
    const plans = await Plan.find({name: {$in: plansData.map((p) => p.name)}});
    const planId = new Map(plans.map((p) => [p.name, p._id]));

    // ---- Users (by email)
    const userId = new Map<string, any>();
    for (const u of usersData) {
        const doc = await User.findOneAndUpdate(
            {email: u.email},
            {$set: {name: u.name, email: u.email, hashedPassword: bcrypt.hashSync(u.password, 10), role: u.role, isActive: true}},
            {upsert: true, new: true},
        );
        userId.set(u.email, doc._id);
    }

    // ---- Profiles (by userId + name)
    for (const [email, list] of Object.entries(profilesData)) {
        const uid = userId.get(email);
        for (const p of list) {
            await Profile.findOneAndUpdate(
                {userId: uid, name: p.name},
                {$set: {userId: uid, avatarUrl: avatar(p.name + email), ...p}},
                {upsert: true},
            );
        }
    }

    // ---- Subscriptions (by paymentRef)
    for (const s of subscriptionsData) {
        const start = daysAgo(s.daysAgo);
        await Subscription.findOneAndUpdate(
            {paymentRef: s.paymentRef},
            {$set: {
                    userId: userId.get(s.email), planId: planId.get(s.plan), status: s.status,
                    startDate: start, endDate: addMonths(start, s.months), paymentRef: s.paymentRef,
                }},
            {upsert: true},
        );
    }

    // ---- Content (by title + type)
    const contentDocs = [
        ...usMovies.map(([title, year, maturity, mins, rating, featured, description]) => ({
            title, description, type: "Movie", releaseYear: year, maturityRating: maturity,
            durationMins: String(mins), posterUrl: poster(title), bannerUrl: banner(title),
            trailer: trailer(title), videoUrl: SAMPLE_VIDEO, isFeatured: featured, avgRating: rating,
        })),
        ...kdramas.map((d) => ({
            title: d.title, description: d.description, type: "Series", releaseYear: d.year,
            maturityRating: d.maturity, durationMins: String(d.episodeMins),
            posterUrl: poster(d.title), bannerUrl: banner(d.title), trailer: trailer(d.title),
            videoUrl: SAMPLE_VIDEO, isFeatured: d.featured, avgRating: d.rating,
        })),
    ];
    await Content.bulkWrite(contentDocs.map((doc) => ({
        updateOne: {filter: {title: doc.title, type: doc.type}, update: {$set: doc}, upsert: true},
    })));

    const savedSeries = await Content.find({type: "Series", title: {$in: kdramas.map((d) => d.title)}});
    const contentIdByTitle = new Map(savedSeries.map((c) => [c.title, c._id]));

    // ---- Seasons (by contentId + seasonNumber) and Episodes (by seasonId + episodeNumber)
    let seasons = 0, episodes = 0;
    for (const d of kdramas) {
        const contentId = contentIdByTitle.get(d.title);
        if (!contentId) continue;

        for (let i = 0; i < d.seasons.length; i++) {
            const [seasonTitle, seasonYear, epCount] = d.seasons[i];
            const seasonNumber = i + 1;
            const season = await Season.findOneAndUpdate(
                {contentId, seasonNumber},
                {$set: {contentId, seasonNumber, title: `${d.title} - ${seasonTitle}`, releaseYear: seasonYear}},
                {upsert: true, new: true},
            );
            seasons++;

            await Episode.bulkWrite(Array.from({length: epCount}, (_, k) => {
                const n = k + 1;
                const doc = {
                    seasonId: season._id, episodeNumber: n, title: `Episode ${n}`,
                    description: `${d.title} - ${seasonTitle}, episode ${n} of ${epCount}.`,
                    durationMinis: d.episodeMins, videoUrl: SAMPLE_VIDEO,
                    thumbnailUrl: thumb(`${d.title} E${n}`),
                };
                return {updateOne: {filter: {seasonId: season._id, episodeNumber: n}, update: {$set: doc}, upsert: true}};
            }));
            episodes += epCount;
        }
    }

    console.log(
        `Done: ${usersData.length} users, ${profileTotal} profiles, ${plansData.length} plans, ` +
        `${subscriptionsData.length} subscriptions, ${genresData.length} genres, ` +
        `${contentDocs.length} content, ${seasons} seasons, ${episodes} episodes`,
    );
    await mongoose.disconnect();
}

main().catch(async (err) => {
    console.error(err);
    await mongoose.disconnect();
    process.exit(1);
});