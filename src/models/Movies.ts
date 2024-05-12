import * as mongoose from "mongoose"
import { model } from "mongoose"
// import Comment from './Comment';
interface IPost {
  name: string
  genre: string[]
  thumbnail: string
  imdb_rating: number
  year: Date
  language: string[]
  length: number
  rating: string
  description: string[]
  trailer_url: string
  movie_url: string
  // movie_id: mongoose.Types.ObjectId[];
}

const movieSchema = new mongoose.Schema({
  name: { type: String, required: true },
  genre: { type: Array, required: true },
  thumbnail: { type: String, required: false },
  imdb_rating: { type: Number, required: true },
  release_date: { type: String, required: true },
  year: { type: String, required: true },
  language: { type: Array, required: true },
  length: { type: Number, required: true },
  rating: { type: String, required: true },
  description: { type: String, required: true },
  trailer_url: { type: String, required: true },
  movie_url: { type: String, required: false },
  poster: { type: Object, required: false },
  keywords: { type: Array, require: false },
  // movie_id: { type: String, require: false}
  movie_id: [{ type: mongoose.Types.ObjectId }],
})

export default model<IPost>("movies", movieSchema)
