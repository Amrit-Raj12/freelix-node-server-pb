import { error } from "console";
import User from "../models/User";
import Movies from "../models/Movies";
// const https = require('https');
const axios = require('axios');
const rangeParser = require('range-parser');


function getBaseURL(req) {
    return req.protocol + '://' + req.get('host') + req.originalUrl.split('/')[0]+'/'+req.originalUrl.split('/')[1]+'/'+req.originalUrl.split('/')[2];
}
function getGenreArrayByMood(mood){
    if (mood == "sad") {
        return ['comedy', 'romantic'];
    }else if(mood == "angry"){
        return ['comedy', 'romantic'];
    }else if(mood == "happy"){
        return ['comedy', 'romantic', 'thriller', 'horror', "suspance", "biography", "action", "animation"];
    } else {
        return false;
    }
}
async function getMovietopCredits(movie_id) {
    try {
        let data:any = Array();
        let i =0;
        const url = "https://api.themoviedb.org/3/movie/"+ movie_id+ "/credits";
        const api_key = '81b5b4686c1e75c52f202d91ab0f6eb9';
            const response1 = await axios.request({
              method: 'GET',
              url: url,
              params: { 
                api_key: api_key,
                // query: name,
                include_adult: 'false',
                language: 'en-US',
                page: 1
            },
              headers: {
                "accept": "application/json"
                // "Authorization": "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI4MWI1YjQ2ODZjMWU3NWM1MmYyMDJkOTFhYjBmNmViOSIsInN1YiI6IjY1ZDlhYjJmNjg4Y2QwMDE4NjExNzRjMyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.Vcl9EZT7VgxiyKtfmsPagYVWoZFUzEhNJv0sb_cnjCA"
              }
            });
            for ( const cast of response1.data.cast){
                let gender;
                const cast_image = cast.profile_path;
                if (cast.gender == 1) {
                    gender = 'female';
                }else if (cast.gender == 2) {
                    gender = 'male';
                }else{
                    gender = 'other';
                }
                data[i] = {
                    'cast_name': cast.name,
                    'character': cast.character,
                    'original_name': cast.original_name,
                    'gender': gender,
                    'popularity': cast.popularity,
                    'base_url': 'image.tmdb.org',
                    'image_path': '/t/p/w500',
                    'image': cast_image,
                    'image_url': 'https://image.tmdb.org/t/p/w500'+cast_image
                };
                i+=1;
                if (i==5) {
                    break;
                }
            };
        return data
    } catch (error) {
        return {
            cast_name: '',
            cast_base_url: '',
            cast_image: '',
            cast_url: ''
        }
    }
}
export class MovieController {


    static async getAllMovies(req, res, next) {
        if(!req.user.isAdmin){
            const page = parseInt(req.query.page) || 1;
            const perPage = 2;
            let currentPage = page;
            let prevPage = page === 1 ? null : page - 1;
            let pageToken = page + 1;
            let totalPages;

            try {
                const movieCount = await Movies.countDocuments();
                totalPages = Math.ceil(movieCount/perPage);
                if(totalPages === page || totalPages === 0){
                    pageToken = null;
                }
                if(page > totalPages) {
                    throw Error('No more movies to show')
                }
                let movies: any = await Movies.find({},{ __v:0, movie_url:0, keywords:0, movie_id:0 });
                for (let i = 0; i < movies.length; i++) {
                    movies[i].movie_url = getBaseURL(req) +'/stream-movie/'+movies[i]._id;
                }
                res.json({
                    movie: movies,
                    pageToken: pageToken,
                    totalPages: totalPages,
                    currentPage: currentPage,
                    prevPage: prevPage
                })
            } catch (e) {
                next(e)
            }
        }else{
            res.status(400).json({ message: 'Please login as Normal User'});
        }
    }

    static async getPreferedMovies(req, res, next) {
        if(!req.user.isAdmin){
            let content_type = "all";
            let mood = "happy";
            const page = parseInt(req.query.page) || 1;
            const perPage = 2;
            let currentPage = page;
            let prevPage = page === 1 ? null : page - 1;
            let pageToken = page + 1;
            let totalPages;
            
        
            try {
                const user = await User.find({ _id: req.user.user_id});
                mood = user[0].mood;
                content_type = user[0].content_type;
                let my_genre:any = getGenreArrayByMood(mood);
                let genreRegex = my_genre.map(genre => new RegExp(genre, 'i'));
                if ((content_type === 'movies') || (content_type == 'all')) {
                    let slider = await Movies.find({ genre: { $in: genreRegex }}, { __v:0, movie_url:0, keywords:0, movie_id:0  }).sort({ release_date: -1 }).limit(2);
                    // let i = 0;
                    // for await ( const item of slider ) {
                    //     slider[i]['movie_url'] = await getBaseURL(req) +'/stream-movie/'+item._id;
                    //     i += 1;
                    // }
                    let genre_array_movie = {};
                    for (const genre of genreRegex) {
                        // Find movies for each genre
                        let ccontent = await Movies.find({ genre: { '$in': genre} },{ __v:0, movie_url:0, keywords:0, movie_id:0 }).sort({ release_date: -1 }).exec();
                        // for (let i = 0; i < ccontent.length; i++) {
                        //     ccontent[i].movie_url = getBaseURL(req) +'/stream-movie/'+ccontent[i]._id;
                        // }
                        genre_array_movie[genre] = ccontent;
                    }
                        res.json({ success: true, slider: slider, result: genre_array_movie });
                } else {
                    res.status(400).json({ message: 'Please enter movies/series.' });
                }
            } catch (e) {
                next(e)
            }
        }else{
            res.status(400).json({ message: 'Please login as Normal User'});
        }
    }

    static async getMovie(req, res, next){
        if(!req.user.isAdmin){
            const movie_id = req.params.id;
            try {
                let content:any = await Movies.find({ _id : movie_id},{ __v:0, movie_url:0, keywords:0, movie_id:0 });
                let i = 0;
                for await ( const item of content ) {
                    content[i]['movie_url'] = await getBaseURL(req) +'/stream-movie/'+item._id;
                    i += 1;
                }
                const cast = await getMovietopCredits(content[0]['movie_id']);
                res.json({ success: true, content: content, cast: cast});
            } catch (e) {
                next(e);
            }
        }else{
            res.status(400).json({ message: 'Please login as Normal User'});
        }
    }
    static async searchMovie(req, res, next){
        if(!req.user.isAdmin){
            const search_query = new RegExp( req.params.query, 'i');
            try {
                let content:any = await Movies.find(
                    {
                        '$or':[
                            { 'name': search_query},
                            { 'keywords': { '$in': search_query}},
                            { 'genre': { '$in': search_query}},
                            { 'language': { '$in': search_query}},
                            { 'description': { '$in': search_query}},
                            { 'description': { '$in': search_query}}
                        ]
                    },
                    { __v:0, movie_url:0, keywords:0, movie_id:0}
                ).limit(10);
                res.json({ success: true, content: content});
            } catch (e) {
                next(e);
            }
        }else{
            res.status(400).json({ message: 'Please login as Normal User'});
        }
    }

    static async streamVideo(req, res, next){
        const movies:any = await Movies.find({ _id:req.params.id },{ __v:0, keywords:0, movie_id:0});
        let videoUrl = movies[0].movie_url;
        try {
            if(videoUrl.split('/')[2] == 'res.cloudinary.com'){
                // Fetch video metadata (headers)
                const { headers } = await axios.head(videoUrl);
                // Set content type to video type
                res.setHeader('Content-Type', headers['content-type']);
                // Parse the start time from query parameters
                let startTime = parseInt(req.query.startTime) || 0;
                // Calculate byte range corresponding to the start time
                const a = headers['server-timing'];
                const duRegex = /du=([\d.]+)/;
                const match = a.match(duRegex);
                let duValue;
                let startByte;
                if (match) {
                    duValue = parseFloat(match[1]);
                    startByte = startTime * headers['content-length'] / duValue; 
                } else {
                    startTime = 0;
                    startByte = 0;
                }
     
                startByte = Math.floor(startByte);    
                // Ensure startByte is within the range of the content
                if (startByte >= headers['content-length']) {
                    // If startByte exceeds content length, set it to 0
                    startByte = 0;
                }
                
                // Set headers for partial content response
                res.status(206);
                res.setHeader('Content-Range', `bytes ${startByte}-${headers['content-length'] - 1}/${headers['content-length']}`);
    
                // Create a readable stream from the video URL
                const videoStream = await axios.get(videoUrl, {
                responseType: 'stream',
                headers: { Range: `bytes=${startByte}-` }
                });
                
                // Pipe the video stream to the response
                videoStream.data.pipe(res);
            }else{
                videoUrl = 'https://www.w3schools.com/tags/mov_bbb.mp4';
                const { headers } = await axios.head(videoUrl);
                res.setHeader('Content-Type', headers['content-type']);
            
                // Check if range request header exists
                const rangeRequest = req.headers.range;
            
                if (rangeRequest) {
                  // If range request exists, parse it
                  const ranges = rangeParser(headers['content-length'], rangeRequest);
            
                  if (ranges === -1) {
                    // If range is invalid, return 416 Range Not Satisfiable
                    res.status(416).send('Range Not Satisfiable');
                    return;
                  }
            
                  // Set headers for partial content response
                  res.status(206);
                  res.setHeader('Content-Range', `bytes ${ranges[0].start}-${ranges[0].end}/${headers['content-length']}`);
                }
            
                // Create a readable stream from the video URL
                const videoStream = await axios.get(videoUrl, { responseType: 'stream' });
            
                // Pipe the video stream to the response
                videoStream.data.pipe(res);
            }
        } catch (e) {
            res.setHeader('Content-Type', 'application/json');
            res.status(500).json({success: false, message: e.message});
        }
        

        // https.get(videoUrl, (stream) => {
        //     stream.pipe(res);
        // });
    }

  
}