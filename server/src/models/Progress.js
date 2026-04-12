const mongoose = require('mongoose')

const ProgressSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    tmdbId: { type: Number, required: true },
    mediaType: { type: String, enum: ['movie', 'tv'], required: true },
    progress: { type: Number, required: true, min: 0, max: 1 },
    season: { type: Number },
    episode: { type: Number },
  },
  { timestamps: true },
)

ProgressSchema.index({ userId: 1, tmdbId: 1, mediaType: 1 }, { unique: true })

const Progress = mongoose.model('Progress', ProgressSchema)

module.exports = { Progress }
