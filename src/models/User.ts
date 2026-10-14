import {Schema, model} from "mongoose";

interface IUser {
    name : string,
    email : string,
    hashedPassword : string,
    role : string,
    isActive : boolean,
    createdAt : Date
}

const userSchema = new Schema<IUser>(
    {
        name : {
            type : String,
            required : true
        },

        email : {
            type : String,
            unique : true,
            required : true
        },

        hashedPassword : {
            type : String,
            required : true
        },

        role : {
            type : String,
            enum : ["Admin","User"],
            default : "User",
            required : true
        },

        isActive : {
            type : Boolean,
            required : true,
            default : true
        }
    },
    {
        timestamps : true
    }
)

const User = model<IUser>("User",userSchema)
export default User