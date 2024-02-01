import { Schema, Model } from "mongoose";
import { User } from "./user.model";

const subscriptionSchema = new Schema(
  {
    subscriber: {
      type: Schema.Types.ObjectId,
      ref: User,
    },
    channel: {
      type: Schema.Types.ObjectId,
      ref: User,
    },
  },
  {
    timestamps: true,
  }
);

export const Subscription = Model("Subscription", subscriptionSchema);
