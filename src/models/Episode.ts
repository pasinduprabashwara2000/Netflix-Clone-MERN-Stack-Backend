import {Schema, model, Types} from 'mongoose'

interface IEpisode {
    seasonId : Types.ObjectId
    episodeNumber  : number
    title : string
    description : string
    durationMinis : number
    videoUrl : string
    thumbnailUrl : string
}

const episodeSchema = new Schema<IEpisode>(
    {
        seasonId : {
            type : Schema.Types.ObjectId,
            ref : 'Season',
            required : true
        },

        episodeNumber : {
            type : Number,
            required : true
        },

        title : {
            type : String,
            required : true
        },

        description : {
            type : String,
            required : true
        },

        durationMinis : {
            type : Number,
            required : true
        },

        videoUrl : {
            type : String,
            required : true
        },

        thumbnailUrl : {
            type : String,
            required : true
        }

    },

    {
        timestamps : true
    }
)

const Episode = model<IEpisode>("Episode", episodeSchema)
export default Episode