import Admin from "../models/Admin"
import User from "../models/User"
import Movies from "../models/Movies"
const Series = require("../models/Series")
const Episodes = require("../models/Episodes")
import { Utils } from "../utils/Utils"
import { NodeMailer } from "../utils/NodeMailer"
import * as Jwt from "jsonwebtoken"
import { getEnvironmentVariables } from "../environments/env"

// import * as Cheerio from 'cheerio';
// import * as Request from 'request'
const moment = require("moment")
const cloudinary = require("cloudinary").v2
const streamifier = require("streamifier")
const axios = require("axios")
// const fs = require('fs');
// import { Readable } from 'stream';

cloudinary.config({
  cloud_name: "df810wgnc",
  api_key: "876419857221328",
  api_secret: "JOxDRRToucsOte38VJ3qjo4a62I",
})
let streamUpload = (file) => {
  let config: any
  if (
    file.mimetype == "image/png" ||
    file.mimetype == "image/jpg" ||
    file.mimetype == "image/jpeg"
  ) {
    config = {
      folder: "NetflixImages",
      resource_type: "image",
    }
  } else if (file.mimetype == "video/mp4" || file.mimetype == "video/mpeg") {
    config = {
      folder: "NetflixVideos",
      resource_type: "video",
    }
  } else {
    config = {
      folder: "NetflixFiles",
    }
  }
  return new Promise((resolve, reject) => {
    let stream = cloudinary.uploader.upload_stream(config, (error, result) => {
      if (result) {
        resolve({
          public_id: result.public_id,
          format: result.format,
          resource_type: result.resource_type,
          created_at: result.created_at,
          bytes: result.bytes,
          url: result.secure_url,
          original_filename: result.original_filename,
          mimetype: file.mimetype,
        })
      } else {
        reject(error)
      }
    })
    streamifier.createReadStream(file.buffer).pipe(stream)
  })
}

async function getMovieKeywords(movie_id) {
  let data: any = Array()
  let i = 0
  let url = "https://api.themoviedb.org/3/movie/" + movie_id + "/keywords"
  const api_key = "81b5b4686c1e75c52f202d91ab0f6eb9"
  const response1 = await axios.request({
    method: "GET",
    url: url,
    params: {
      api_key: api_key,
      // query: name,
      include_adult: "false",
      language: "en-US",
      page: 1,
    },
    headers: {
      accept: "application/json",
      // "Authorization": "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI4MWI1YjQ2ODZjMWU3NWM1MmYyMDJkOTFhYjBmNmViOSIsInN1YiI6IjY1ZDlhYjJmNjg4Y2QwMDE4NjExNzRjMyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.Vcl9EZT7VgxiyKtfmsPagYVWoZFUzEhNJv0sb_cnjCA"
    },
  })
  for (const one_keyword_list of response1.data.keywords) {
    let one_keyword_list_keyword_array = one_keyword_list.name.split(", ")
    if (one_keyword_list_keyword_array.length > 1) {
      for (let j = 1; j < one_keyword_list_keyword_array.length; j++) {
        data[response1.data.keywords.length + j - 1] =
          one_keyword_list_keyword_array[j]
      }
      data[i] = one_keyword_list_keyword_array[0]
    } else {
      data[i] = one_keyword_list.name
    }

    i += 1
  }
  return data
}
async function getMovieDetails(movie_id) {
  let url = "https://api.themoviedb.org/3/movie/" + movie_id + "?language=en-US"
  const api_key = "81b5b4686c1e75c52f202d91ab0f6eb9"
  const response2 = await axios.request({
    method: "GET",
    url: url,
    params: {
      api_key: api_key,
      include_adult: "false",
      language: "en-US",
      page: 1,
    },
    headers: {
      accept: "application/json",
    },
  })
  let data1
  let new_genre = Array()
  const got_genre = response2.data.genres
  for (let k = 0; k < got_genre.length; k++) {
    new_genre[k] = got_genre[k].name
  }
  let new_lang = Array()
  for (let l = 0; l < response2.data.spoken_languages.length; l++) {
    new_lang[l] = response2.data.spoken_languages[l].english_name
  }
  data1 = {
    genre: new_genre,
    imdb_rating: response2.data.vote_average,
    release_date: response2.data.release_date,
    language: new_lang,
    length: response2.data.runtime,
    description: response2.data.overview,
    year: response2.data.release_date.split("-")[0],
  }
  return data1
}
async function getMovieImages(movie_id) {
  let url = "https://api.themoviedb.org/3/movie/" + movie_id + "/images"
  const api_key = "81b5b4686c1e75c52f202d91ab0f6eb9"
  const response2 = await axios.request({
    method: "GET",
    url: url,
    params: {
      api_key: api_key,
    },
    headers: {
      accept: "application/json",
    },
  })
  let data1
  let banner
  let poster
  if (typeof response2.data.backdrops[0] != "undefined") {
    banner = response2.data.backdrops[0]["file_path"]
  }
  if (typeof response2.data.posters[0] != "undefined") {
    poster = response2.data.posters[0]["file_path"]
  }
  const backdrops = response2.data.backdrops
  const filtered_backdrops = backdrops.filter((item) => item.height >= 1080)
  if (typeof filtered_backdrops[0] != "undefined") {
    filtered_backdrops.sort((a, b) => b.vote_average - a.vote_average)
    banner = filtered_backdrops[0]["file_path"]
  }
  data1 = {
    base_url: "image.tmdb.org",
    path: "/t/p/original",
    back: banner,
    main: poster,
  }
  return data1
}
async function getMovieDataByName(title, id) {
  let params: any
  let url
  if (id == "") {
    url = "https://imdb146.p.rapidapi.com/v1/find/"
    params = { query: title }
  } else if (id != "") {
    url = "https://imdb146.p.rapidapi.com/v1/title/"
    params = { id: id }
  }
  const options = {
    method: "GET",
    url: url,
    params: params,
    headers: {
      "X-RapidAPI-Key": "0d76b0f1b2msha3689448c01a576p10b3c8jsn5d78d4d1af91",
      "X-RapidAPI-Host": "imdb146.p.rapidapi.com",
    },
  }

  try {
    let movie_id
    // let imdb_poster_url = '';
    if (id == "") {
      const response = await axios.request(options)
      // imdb_poster_url = response.data.titleResults.results[0].titlePosterImageModel.url;
      movie_id = response.data.titleResults.results[0].id
    } else if (id != "") {
      // const response = await axios.request(options);
      // imdb_poster_url = response.data.primaryImage.url;
      movie_id = id
    }
    // let poster_array = imdb_poster_url.split('/');
    // const poster = {
    //     url: imdb_poster_url,
    //     baseurl: poster_array[poster_array.length-4],
    //     folder: poster_array[poster_array.length-3] + '/' + poster_array[poster_array.length-2],
    //     filename: poster_array[poster_array.length-1]
    // }

    const poster = await getMovieImages(movie_id)
    const data = await getMovieKeywords(movie_id)
    const data1 = await getMovieDetails(movie_id)
    return {
      success: true,
      movie_id: movie_id,
      poster: poster,
      keywords: data,
      details: data1,
    }
  } catch (error) {
    console.log(error)
    return {
      success: false,
      movie_id: "",
      poster: "",
      keywords: "",
      details: "",
    }
  }
}

export class AdminController {
  // Harsh 2024-02-11
  static async signUp(req, res) {
    // console.log(req.body.email)
    const email = req.body.email
    const username = req.body.username
    const password = req.body.password
    const verificationToken = Utils.generateVerificationToken()
    try {
      const hash = await Utils.encryptPassword(password)
      const data = {
        email: email,
        password: hash,
        username: username,
        verification_token: verificationToken,
        verification_token_time: Date.now() + new Utils().MAX_TOKEN_TIME,
        created_at: new Date(),
        updated_at: new Date(),
      }
      let user = await new Admin(data).save()
      res.status(200).send({
        success: true,
        message: "Please wait for Approval. It will take at most 24 hours.",
      })
      await NodeMailer.sendEmail({
        to: ["amrit.raj1224@gmail.com"],
        subject: "Email Verification",
        html: `<h1>${verificationToken}</h1>`,
      })
    } catch (e) {
      res.json({ success: false, message: e.message })
    }
  }

  // Harsh 2024-02-11
  static async login(req, res) {
    const password = req.body.password
    const user = req.user
    let expirytime = "2h"
    if (req.body.remember_me) {
      expirytime = "1d"
    }
    const userData = {
      isAdmin: true,
      username: req.user.username,
      email: req.user.email,
      _id: req.user._id,
      verified: req.user.verified,
    }
    try {
      await Utils.comparePassword({
        plainPassword: password,
        encryptedPassword: user.password,
      })
      console.log(req.user.status)
      if (req.user.status == "approved") {
        const token = Jwt.sign(
          { isAdmin: true, email: user.email, user_id: user._id },
          getEnvironmentVariables().jwt_secret,
          { expiresIn: expirytime }
        )
        const data = {
          success: true,
          token: token,
          token_validity: expirytime,
          user: userData,
        }
        res.json(data)
      } else {
        res.status(400).send({
          success: false,
          message: "Please wait for Approval. It will take at most 24 hours.",
        })
      }
    } catch (e) {
      res.json({ success: false, message: e.message })
    }
  }

  static async updateMovies(req, res, next) {
    if (req.user.isAdmin) {
      const id = req.params.id
      const name = req.body.name
      const genre = req.body.genre
      const thumbnail = req.body.thumbnail
      const imdb_rating = req.body.imdb_rating
      const year = req.body.year
      const language = req.body.language
      const length = req.body.length
      const rating = req.body.rating
      const description = req.body.description
      const trailer_url = req.body.trailer_url
      const movie_url = req.body.movie_url
      const poster = req.body.poster
      const keywords = req.body.keywords
      const movie_id = req.body.movie_id

      try {
        const updated = await Movies.findOneAndUpdate(
          { _id: id },
          {
            name: name,
            genre: genre,
            thumbnail: thumbnail,
            imdb_rating: imdb_rating,
            year: year,
            language: language,
            length: length,
            rating: rating,
            description: description,
            trailer_url: trailer_url,
            movie_url: movie_url,
            poster: poster,
            keywords: keywords,
            movie_id: movie_id,
          },
          { new: true }
        )
        res.send({ success: true, message: updated })
      } catch (e) {
        next({ success: false, message: e.message })
      }
    } else {
      res.status(400).json({ success: false, message: "Please login as Admin" })
    }
  }

  static async syncUpdateMovies(req, res, next) {
    if (req.user.isAdmin) {
      try {
        let fetched_movie_data: any
        let updated = Array()
        let movies: any = await Movies.find({}, { __v: 0, movie_url: 0 })
        let i = 0
        for await (const item of movies) {
          fetched_movie_data = await getMovieDataByName(
            item.name,
            item.movie_id
          )
          updated[i] = await Movies.findOneAndUpdate(
            { _id: item._id },
            {
              genre: fetched_movie_data.details.genre,
              imdb_rating: fetched_movie_data.details.imdb_rating,
              release_date: fetched_movie_data.details.release_date,
              year: fetched_movie_data.details.year,
              language: fetched_movie_data.details.language,
              length: fetched_movie_data.details.length,
              description: fetched_movie_data.details.description,
              poster: fetched_movie_data.poster,
              keywords: fetched_movie_data.keywords,
              movie_id: fetched_movie_data.movie_id,
            },
            { new: true }
          )
          // console.log(fetched_movie_data);
          // if (i==1) {
          //     break
          // }
          i += 1
        }
        res.send({ success: true, message: updated })
      } catch (e) {
        res.status(400).json({ success: false, message: e.message })
      }
    } else {
      res.status(400).json({ success: false, message: "Please login as Admin" })
    }
  }

  static async deleteMovies(req, res, next) {
    if (req.user.isAdmin) {
      const movie_id = req.params.id
      try {
        Movies.findOneAndDelete({ _id: movie_id })
          .then((content) => {
            res.send({ success: true, message: content })
          })
          .catch((error) => {
            next({ success: false, message: error.message })
          })
      } catch (e) {
        next({ success: false, message: e.message })
      }
    } else {
      res.status(400).json({ success: false, message: "Please login as Admin" })
    }
  }

  static async addMovies(req, res, next) {
    try {
      // Check if the user is an admin
      if (!req.user.isAdmin) {
        return res.status(403).json({ error: "Unauthorized" })
      }

      // Create a new movie object from the request body
      const movieData = {
        name: req.body.name,
        genre: req.body.genre,
        thumbnail: req.body.thumbnail,
        imdb_rating: req.body.imdb_rating,
        release_date: req.body.release_date,
        year: req.body.year,
        language: req.body.language,
        length: req.body.length,
        rating: req.body.rating,
        description: req.body.description,
        trailer_url: req.body.trailer_url,
        keywords: req.body.keywords,
      }

      // Create a new movie instance using the Movie model
      const movie = new Movies(movieData)

      // Save the movie to the database
      await movie.save()

      res
        .status(201)
        .json({ message: "Movie added successfully", success: true, movie })
    } catch (error) {
      // Handle any errors
      next(error)
    }
    // if(req.user.isAdmin){
    //     const name = req.body.name;
    //     const thumbnail = req.body.thumbnail;
    //     const trailer_url = req.body.trailer_url;
    //     const movie_url = req.body.movie_url;
    //     const rating = req.body.rating;
    //     let movie_id = '';
    //     if (typeof req.body.movie_id != 'undefined') {
    //         movie_id = req.body.movie_id
    //     }
    //     const fetched_movie_data = await getMovieDataByName(name,movie_id);
    //     if(fetched_movie_data.success){
    //         const genre= fetched_movie_data.details.genre;
    //         const imdb_rating= fetched_movie_data.details.imdb_rating;
    //         const release_date= fetched_movie_data.details.release_date;
    //         const year= fetched_movie_data.details.year;
    //         const language= fetched_movie_data.details.language;
    //         const length= fetched_movie_data.details.length;
    //         const description= fetched_movie_data.details.description;
    //         const poster = fetched_movie_data.poster;
    //         const keywords = fetched_movie_data.keywords;
    //         const movie_id = fetched_movie_data.movie_id;
    //         const movies = new Movies({
    //             name,
    //             genre,
    //             thumbnail,
    //             imdb_rating,
    //             release_date,
    //             year,
    //             language,
    //             length,
    //             rating,
    //             description,
    //             trailer_url,
    //             movie_url,
    //             poster,
    //             keywords,
    //             movie_id
    //         })
    //         const content = await movies.save();
    //         res.send({success: true, message:content});
    //     }else{
    //         res.send({success: false, message:"Unable to fetch data"});
    //     }
    // }else{
    //     res.status(400).json({ message: 'Please login as Admin'});
    // }
  }

  static async uploadFiles(req, res, next) {
    if (req.user.isAdmin) {
      try {
        let thumbnail
        let videos
        let updated
        let old_url_segments
        if (req.files.length > 2) {
          res.status(500).json({
            success: false,
            message: "Upload thumbnail or any movie/episode file!",
          })
        } else if (typeof req.files != "undefined") {
          for (let i = 0; i < req.files.length; i++) {
            let file = req.files[i]
            let result: any = await streamUpload(file)
            if (
              file.mimetype == "image/png" ||
              file.mimetype == "image/jpg" ||
              file.mimetype == "image/jpeg"
            ) {
              thumbnail = result
              if (req.params.type == "movie") {
                updated = await Movies.findByIdAndUpdate(
                  { _id: req.params.id },
                  { thumbnail: result.url }
                )
                old_url_segments = updated.thumbnail.split("/")
                old_url_segments =
                  old_url_segments[old_url_segments.length - 2] +
                  "/" +
                  old_url_segments[old_url_segments.length - 1] // get folder/file_name
                old_url_segments = old_url_segments
                  .split(".")
                  .slice(0, -1)
                  .join(".") // remove extension
                await cloudinary.uploader.destroy(old_url_segments)
              }
            } else if (
              file.mimetype == "video/mp4" ||
              file.mimetype == "video/mpeg"
            ) {
              videos = result
              if (req.params.type == "movie") {
                updated = await Movies.findByIdAndUpdate(
                  { _id: req.params.id },
                  { movie_url: result.url }
                )
                old_url_segments = updated.movie_url.split("/")
                old_url_segments =
                  old_url_segments[old_url_segments.length - 2] +
                  "/" +
                  old_url_segments[old_url_segments.length - 1] // get folder/file_name
                old_url_segments = old_url_segments
                  .split(".")
                  .slice(0, -1)
                  .join(".") // remove extension
                await cloudinary.uploader.destroy(old_url_segments)
              }
            }
          }
          res.json({
            success: true,
            movie_url: videos,
            thumbnail: thumbnail,
            updated: updated,
          })
        } else {
          res.status(500).json({ success: false, message: "No file uploaded!" })
        }
      } catch (error) {
        console.error({ error: error })
        res.status(500).json({ success: false, message: error.message })
      }
    } else {
      res.status(400).json({ message: "Please login as Admin" })
    }
  }

  // get all movies
  static async getAllMovies(req, res, next) {
    try {
      // Check if the user is an admin
      if (!req.user.isAdmin) {
        return res.status(403).json({ error: "Unauthorized" })
      }

      const page = parseInt(req.query.page) || 1
      const perPage = 2
      let currentPage = page
      let prevPage = page === 1 ? null : page - 1
      let pageToken = page + 1
      let totalPages

      const movieCount = await Movies.countDocuments()
      totalPages = Math.ceil(movieCount / perPage)
      if (totalPages === page || totalPages === 0) {
        pageToken = null
      }
      if (page > totalPages) {
        throw Error("No more movies to show")
      }
      let movies: any = await Movies.find(
        {},
        { __v: 0, movie_url: 0, keywords: 0, movie_id: 0 }
      )
      // for (let i = 0; i < movies.length; i++) {
      //     movies[i].movie_url = getBaseURL(req) +'/stream-movie/'+movies[i]._id;
      // }
      res.json({
        movie: movies,
        pageToken: pageToken,
        totalPages: totalPages,
        currentPage: currentPage,
        prevPage: prevPage,
      })
    } catch (e) {
      next(e)
    }
  }

  static addSeries(req, res, next) {
    // console.log(req.body);

    // const userId = req.user.user_id;
    const name = req.body.name
    const genre = req.body.genre
    const thumbnail = req.body.thumbnail
    const imdb_rating = req.body.imdb_rating
    const year = req.body.year
    const language = req.body.language
    const no_of_episodes = req.body.no_of_episodes
    const rating = req.body.rating
    const description = req.body.description
    const trailer_url = req.body.trailer_url

    const serieses = new Series({
      name,
      genre,
      thumbnail,
      imdb_rating,
      year,
      language,
      no_of_episodes,
      rating,
      description,
      trailer_url,
    })
    serieses
      .save()
      .then((series) => {
        res.send(series)
      })
      .catch((e) => {
        next(e)
      })
  }

  static addEpisode(req, res, next) {
    const name = req.body.name
    const series = req.params.id
    const thumbnail = req.body.thumbnail
    const release_date = req.body.release_date
    const language = req.body.language
    const length = req.body.length
    const description = req.body.description
    const episode_url = req.body.episode_url

    const episodes = new Episodes({
      name,
      series,
      thumbnail,
      release_date,
      language,
      length,
      description,
      episode_url,
    })
    episodes
      .save()
      .then((episode) => {
        res.send(episode)
      })
      .catch((e) => {
        next(e)
      })
  }

  // Harsh 2024-02-12
  static async approveUser(req, res) {
    if (req.user.isAdmin) {
      const user_id = req.params.id

      try {
        const updated = await Admin.findOneAndUpdate(
          { _id: user_id },
          {
            status: "approved",
            aproved_by: req.user.user_id,
            aproved_at: new Date(),
          },
          { new: true }
        )
        res.json({ success: true, message: "User is Approved!" })
      } catch (e) {
        res.json({ status: false, message: e.message })
      }
    } else {
      res.status(400).json({ success: false, message: "Please login as Admin" })
    }
  }

  // Harsh 2024-02-14
  static async getDashboardData(req, res) {
    if (req.user.isAdmin) {
      try {
        const last_five_admin_user_requests = await Admin.find(
          { status: "requested" },
          { __v: 0, password: 0 }
        )
          .sort({ created_at: -1 })
          .limit(5)
        const approved_admins = await Admin.find(
          { status: "approved" },
          { __v: 0, password: 0 }
        ).sort({ created_at: -1 })
        const total_approved_users = await User.countDocuments()
        const total_movies = await Movies.countDocuments()
        const total_series = await Series.countDocuments()
        res.json({
          success: true,
          last_five_admin_user_requests: last_five_admin_user_requests,
          approved_admins: approved_admins,
          count: {
            admins: approved_admins.length,
            users: total_approved_users,
            movies: total_movies,
            series: total_series,
            total_content: total_movies + total_series,
          },
        })
      } catch (e) {
        res.json({ success: false, message: e.message })
      }
    } else {
      res.status(400).json({ success: false, message: "Please login as Admin" })
    }
  }

  // Harsh 2024-02-14
  static async getMovies(req, res) {
    if (req.user.isAdmin) {
      const id = req.params.id
      let condition = {}
      if (id == "all" || typeof id == "undefined") {
        condition = {}
      } else {
        condition = { _id: id }
      }
      try {
        const movies = await Movies.find(condition, { __v: 0 })
        res.json({ success: true, movies: movies })
      } catch (e) {
        res.json({ success: false, message: e.message })
      }
    } else {
      res.status(400).json({ success: false, message: "Please login as Admin" })
    }
  }

  // Harsh 2024-02-14
  static async getUsers(req, res) {
    if (req.user.isAdmin) {
      const id = req.params.id
      const mm = req.get
      console.log(mm)
      let condition = {}
      if (id == "all" || typeof id == "undefined") {
        condition = {}
      } else {
        condition = { _id: id }
      }
      try {
        const all_users = await User.find(condition, { __v: 0, password: 0 })
        res.json({ success: true, all_users: all_users })
      } catch (e) {
        res.json({ success: false, message: e.message })
      }
    } else {
      res.status(400).json({ success: false, message: "Please login as Admin" })
    }
  }

  // Harsh 2024-02-14
  static async getAdmins(req, res) {
    if (req.user.isAdmin) {
      const id = req.params.id
      let condition = {}
      if (id == "all" || typeof id == "undefined") {
        condition = {}
      } else if (id == "requested" || id == "approved") {
        condition = { status: id }
      } else {
        condition = { _id: id }
      }
      try {
        const all_users = await Admin.find(condition, { __v: 0, password: 0 })
        res.json({ success: true, all_users: all_users })
      } catch (e) {
        res.json({ success: false, message: e.message })
      }
    } else {
      res.status(400).json({ success: false, message: "Please login as Admin" })
    }
  }
}
