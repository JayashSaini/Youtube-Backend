import mongoose,{ Schema } from "mongoose"

const playlistSchema = new Schema(
    {
        name : {
            type : String,
            required : ture
        },
        description : {
            type : String,
            required : ture
        },
        owner : {
            type : Schema.Types.ObjectId,
            ref : "User"
        },
        video : [
            {
                type : Schema.Types.ObjectId,
                ref : "Video"
            }
        ]
    },
    { timestamps : true }
);

export const Playlist = mongoose.model("Playlist", playlistSchema);