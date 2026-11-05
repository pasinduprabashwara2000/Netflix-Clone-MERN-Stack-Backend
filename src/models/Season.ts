import {Schema, model, Types} from "mongoose";

interface ISeason{
    contentId : Types.ObjectId
    seasonNumber : number
    title : string
    releaseYear : number
}

const seasonSchema = new Schema<ISeason>(
    {
        contentId : {
            type : Schema.Types.ObjectId,
            ref : "Content",
            required : true
        },

        seasonNumber : {
            type : Number,
            required : true
        },

        title : {
            type : String,
            required : true
        },

        releaseYear : {
            type : Number,
            required : true
        }

    },

    {
        timestamps : true
    }

)

const Season = model<ISeason>("Season", seasonSchema)
export default Season