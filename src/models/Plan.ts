import {Schema, model} from "mongoose";

interface IPlan {
    name : string;
    price : number;
    maxStreams : number;
    videoQuality : string;
}

const planSchema = new Schema<IPlan>(
    {
        name : {
            type : String,
            required : true
        },

        price : {
            type : Number,
            required : true
        },

        maxStreams : {
            type : Number,
            required : true
        },

        videoQuality : {
            type : String,
            required : true
        }
    },
    {
        timestamps : true
    }
)

const Plan = model<IPlan>("Plan",planSchema);
export default Plan;