import { body, param, query } from "express-validator";
import Post from "../models/Post";

export class SeriesValidators{

    static addSeries() {
        // console.log(body);
        return [
            body('name', 'Series name is required').isString(),
            body('genre', 'Series genre is required').isString(),
            body('thumbnail', 'Series thumbnail is required').isString(),
            body('imdb_rating', 'Series imdb_rating is required').isNumeric(),
            body('year', 'Series year is required').isString(),
            body('language', 'Series language is required').isString(),
            body('no_of_episodes', 'Number of episodes is required').isNumeric(),
            body('rating', 'Series rating is required').isString(),
            body('description', 'Series description is required').isString(),
            body('trailer_url', 'Series trailer url is required').isString(),
        ];
    };

    static addEpisodes() {
        return [
            body('name', 'Episode name is required').isString(),
            param('id', 'Series id is required').isString(),
            body('thumbnail', 'Episode thumbnail is required').isString(),
            body('release_date', 'Episode release date is required').isDate(),
            body('language', 'Episode language is required').isString(),
            body('length', 'Length of episodes is required').isNumeric(),
            body('description', 'Episode description is required').isString(),
            body('episode_url', 'Episode trailer url is required').isString(),
        ];
    };
}