import * as mongoose from 'mongoose';
import {model} from 'mongoose';

interface IPost {
    name: string;
    genre: string[];
    thumbnail: string;
    imdb_rating: number;
    year: Date;
    language: string[];
    no_of_episodes: number;
    rating: string;
    description: string[];
    trailer_url: string;
}

const seriesSchema = new mongoose.Schema({
  name: {type: String,required: true,},
  genre: [{type: String, required: true}],
  thumbnail: {type: String, required: true},
  imdb_rating: {type: Number, required: true},
  year: {type: String, required: true},
  language: [{type: String, required: true}],
  no_of_episodes: {type: Number, required: true},
  rating: {type: String, required: true},
  description: [{type: String, required: true}],
  trailer_url: {type: String, required: true}
});

const Series = mongoose.model('Series', seriesSchema);

module.exports = Series;