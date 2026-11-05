import {Schema, model, Types} from "mongoose"

interface IWatchlist {
    profileId : Types.ObjectId,
    contentId : Types.ObjectId,
    addedAt : Date
}

const watchSchema = new Schema<IWatchlist>(
    {
        profileId : {
            type : Types.ObjectId,
            ref : "Profile",
            required : true
        },

        contentId : {
            type : Types.ObjectId,
            ref : "Content",
            required : true
        },

        addedAt : {
            type : Date,
            required : true
        }
    },

    {
        timestamps : true
    }
)

const watch = model<IWatchlist>("watchSchema", watchSchema)

export default watch

