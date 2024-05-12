import { body, param } from "express-validator"
import Post from "../models/Post"

export class MoviesValidators {
  static addMovies() {
    return [
      body("name", "Movie name is required").isString(),
      body("rating", "Movie rating is required").isString(),
      body("trailer_url", "Movie trailer_url is required").isString(),
      // body('movie_url', 'Movie movie_url is required').isString(),
    ]
  }
  static updateMovies() {
    return [
      param("id", "Movie ID is required").isString(),
      body("name", "Movie name is required").isString(),
      body("genre", "Movie genre is required").isString(),
      body("imdb_rating", "Movie imdb_rating is required").isNumeric(),
      body("year", "Movie year is required").isNumeric(),
      body("language", "Movie language is required").isString(),
      body("length", "Movie length is required").isNumeric(),
      body("rating", "Movie rating is required").isString(),
      body("description", "Movie description is required").isString(),
      body("trailer_url", "Movie trailer_url is required").isString(),
      body("movie_url", "Movie movie_url is required").isString(),
    ]
  }
  static deleteMovies() {
    return [param("id", "Movie ID is required").isString()]
  }
}
