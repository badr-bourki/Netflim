const mongoose = require('mongoose')

const MyListItemSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    tmdbId: { type: Number, required: true },
    mediaType: { type: String, enum: ['movie', 'tv'], required: true },
    snapshot: {
      title: { type: String },
      posterPath: { type: String },
      backdropPath: { type: String },
      overview: { type: String },
      releaseDate: { type: String },
      voteAverage: { type: Number },
    },
  },
  { timestamps: true },
)

MyListItemSchema.index({ userId: 1, tmdbId: 1, mediaType: 1 }, { unique: true })

const MyListItem = mongoose.model('MyListItem', MyListItemSchema)

module.exports = { MyListItem }
