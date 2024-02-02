import { Model, Schema } from "mongoose";

const tweetSchema = new Schema(
  {
    content: {
      type: String,
      required: ture,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Tweet = Model("Tweet", tweetSchema);
