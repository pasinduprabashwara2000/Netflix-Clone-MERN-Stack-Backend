import {Schema, model, Types} from "mongoose";

interface IContent {
    title : string
    description : string
    type : string
    genreId? : Types.ObjectId
    releaseYear : number
    maturityRating : string
    durationMins : string
    posterUrl? : string
    posterData? : Buffer
    posterType? : string
    bannerUrl? : string
    bannerData? : Buffer
    bannerType? : string
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

        // legacy / external poster link (used only when no uploaded poster exists)
        posterUrl : {
            type : String,
            default : ""
        },

        // uploaded poster stored as binary (blob) - never returned in list queries
        posterData : {
            type : Buffer,
            select : false
        },

        posterType : {
            type : String
        },

        // legacy / external banner link (used only when no uploaded banner exists)
        bannerUrl : {
            type : String,
            default : ""
        },

        // uploaded banner stored as binary (blob) - never returned in list queries
        bannerData : {
            type : Buffer,
            select : false
        },

        bannerType : {
            type : String
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
        timestamps : true,
        toJSON : {
            transform : (_doc, ret) => {
                const r = ret as unknown as Record<string, any>
                delete r.posterData
                delete r.bannerData

                // uploaded poster -> point posterUrl at the blob endpoint (?v= busts cache after re-upload)
                if (r.posterType) {
                    const v = r.updatedAt ? new Date(r.updatedAt).getTime() : Date.now()
                    r.posterUrl = `/api/content/${r._id}/poster?v=${v}`
                }
                delete r.posterType

                if (r.bannerType) {
                    const v = r.updatedAt ? new Date(r.updatedAt).getTime() : Date.now()
                    r.bannerUrl = `/api/content/${r._id}/banner?v=${v}`
                }
                delete r.bannerType
                return r
            }
        }
    }
)

const Content = model<IContent>("Content",contentSchema)
export default Content