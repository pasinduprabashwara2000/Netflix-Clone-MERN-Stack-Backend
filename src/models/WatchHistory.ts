import {Schema, model, Types} from "mongoose";

interface IWatchHistory {
    profileId : Types.ObjectId
    contentId : Types.ObjectId
    episodeId? : Types.ObjectId
    watchedAt : Date
}

const watchHistorySchema = new Schema<IWatchHistory>(
    {
        profileId : {
            type : Schema.Types.ObjectId,
            ref : "Profile",
            required : true
        },

        contentId : {
            type : Schema.Types.ObjectId,
            ref : "Content",
            required : true
        },

        // only for series: the last episode that was opened
        episodeId : {
            type : Schema.Types.ObjectId,
            ref : "Episode"
        },

        watchedAt : {
            type : Date,
            default : Date.now
        }
    },
    {
        timestamps : true
    }
)

// one row per profile + title (re-watching just moves it to the top)
watchHistorySchema.index({ profileId : 1, contentId : 1 }, { unique : true })

const WatchHistory = model<IWatchHistory>("WatchHistory", watchHistorySchema)
export default WatchHistory
