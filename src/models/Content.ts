import {Schema, model} from "mongoose";

interface IContent {
    title : string
    description : string
    type : string
    releaseYear : number
    maturityRating : string
    durationMins : string
    posterUrl : string
    bannerUrl : string
    trailer : string
    videoUrl : string
    isFeatured : boolean
    avgRating : number
}

const contentSchema = new Schema<IContent>(
    {
        title : {
            type : String,
            required : true
        },

        description : {
            type : String,
            required : true
        },

        type : {
            type : String,
            required : true
        },

        releaseYear : {
            type : Number,
            required : true
        },

        maturityRating : {
            type : String,
            required : true
        },

        durationMins : {
            type : String,
            required : true
        },

        posterUrl : {
            type : String,
            required : true
        },

        bannerUrl : {
            type : String,
            required : true
        },

        trailer : {
            type : String,
            required : true
        },

        videoUrl : {
            type : String,
            required : true
        },

        isFeatured : {
            type : Boolean,
            required : true
        },

        avgRating : {
            type : Number,
            required : true
        }

    },

    {
        timestamps : true
    }
)

const Content = model<IContent>("Content",contentSchema)
export default Content