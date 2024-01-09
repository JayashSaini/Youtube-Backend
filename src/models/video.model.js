import mongoose, { Schema, Model } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate";

const videoSchema = new Schema(
  {
    videoFile: {
      type: String, // Cloudinary url
      required: true,
    },
    thumbnail: {
      type: String, // Cloudinary url
      required: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    duration: {
      type: Number, // the video file data
      required: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

videoSchema.plugin(mongooseAggregatePaginate);

export const Video = Model("Video", videoSchema);
