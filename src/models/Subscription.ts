import {Schema, model, Types} from "mongoose";

interface ISubscription {
    userId : Types.ObjectId
    planId : Types.ObjectId
    status : string
    startDate : Date
    endDate : Date
    paymentRef : string
}

const subscriptionSchema = new Schema<ISubscription>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        planId: {
            type: Schema.Types.ObjectId,
            ref: "Plan",
            required: true
        },

        status: {
            type: String,
            required: true
        },

        startDate: {
            type: Date,
            required: true
        },

        endDate: {
            type: Date,
            required: true
        },

        paymentRef: {
            type: String,
            required: true
        }
    },

    {
        timestamps : true
    }

)

const Subscription = model<ISubscription>("Subscription", subscriptionSchema);
export default Subscription;