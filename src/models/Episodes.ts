import * as mongoose from 'mongoose';
import {model} from 'mongoose';

interface IPost {
    name: string;
    series: string;
    thumbnail: string;
    release_date: Date;
    language: string[];
    length: number;
    description: string[];
    episode_url: string;
}

const episodesSchema = new mongoose.Schema({
  name: {type: String,required: true,},
  series: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Series',
    required: true,
  },
  thumbnail: {type: String, required: true},
  release_date: {type: Date, required: true},
  language: [{type: String, required: true}],
  length: {type: Number, required: true},
  description: [{type: String, required: true}],
  episode_url: {type: String, required: true}
});

const Episodes = mongoose.model('Episodes', episodesSchema);

module.exports = Episodes;