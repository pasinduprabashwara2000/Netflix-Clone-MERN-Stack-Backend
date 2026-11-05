import {Schema, model} from "mongoose";

interface IGenre{
    name : string;
    description : string;
}

const genreSchema = new Schema<IGenre>(
    {
        name : {
            type : String,
            required : true
        },

        description : {
            type : String,
            required : true
        }
    },

    {
        timestamps : true
    }
)

const Genre = model<IGenre>("Genre", genreSchema);
export default Genre