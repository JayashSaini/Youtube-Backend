import mongoose, { Schema } from "mongoose";
import AggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
  {
    videoFile: {
      type: Object, // Cloudinary Meta deta about video
      required: true,
    },
    thumbnail: {
      type: Object, // Cloudinary Meta deta about thumbnail
      required: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
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

videoSchema.plugin(AggregatePaginate);

export const Video = mongoose.model("Video", videoSchema);
