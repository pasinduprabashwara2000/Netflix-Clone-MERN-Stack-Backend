import {Schema, model, Types} from "mongoose";

interface IProfile {
    userId : Types.ObjectId;
    name : string;
    avatarUrl : string;
    isKids : boolean;
    language : string;
    maturityLevel : string
}

const profileSchema = new Schema<IProfile>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        name: {
            type: String,
            required: true
        },

        avatarUrl: {
            type: String,
            required: true
        },

        isKids: {
            type: Boolean,
            required: true
        },

        language: {
            type: String,
            required: true
        },

        maturityLevel: {
            type: String,
            required: true
        }
    },

    {
        timestamps : true
    }
)

const Profile = model<IProfile>("Profile", profileSchema)
export default Profile