import {Schema, model, Types} from "mongoose";

interface IContent {
    title : string
    description : string
    type : string
    genreId? : Types.ObjectId
    releaseYear : number
    maturityRating : string
    durationMins : string
    posterUrl : string
    bannerUrl : string
    trailer : string
    videoUrl : string
    isFeatured : boolean
    avgRating : number
    embedding? : number[]
    embeddingHash? : string
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

        genreId : {
            type : Schema.Types.ObjectId,
            ref : "Genre"
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
        },

        // AI search / recommendations (hidden from normal queries)
        embedding : {
            type : [Number],
            select : false
        },

        embeddingHash : {
            type : String,
            select : false
        }

    },

    {
        timestamps : true
    }
)

const Content = model<IContent>("Content",contentSchema)
export default Content
