import * as express from 'express';
import * as mongoose from 'mongoose'
import * as session from 'express-session';
const cookieParser = require('cookie-parser');

import { getEnvironmentVariables } from './environments/env';
import UserRouter from './routers/UserRouter';
import PostRouter from './routers/PostRouter';
import CommentRouter from './routers/CommentRouter';
import bodyParser = require('body-parser');
import MoviesRouter from './routers/MoviesRouter';
import SeriesRouter from './routers/SeriesRouter';
import AdminRouter from "./routers/AdminRouter";

// New Harsh 2024-02-18
const multer = require('multer');
const upload = multer();
// End New

const cors = require('cors')
// import { Jobs } from './jobs/Jobs';

export class Server {
    public app: express.Application = express();

    constructor(){
        this.setConfigurations();
        this.setRoutes();
        this.error404Handler();
        this.handleErrors();
    }
    setConfigurations(){
        this.connectMongoDb();
        this.configureBodyParser();
        this.setSession();
        this.setProxy()
        this.setLimit();
        // Jobs.runRequiredJobs();
    }
    // new 2024-02-19
    setLimit(){
        this.app.use(express.json({
            limit: '50mb'
          }));
    }
    setProxy(){
        this.app.use(cors())
        // this.app.use((req, res, next) => {
        //     res.setHeader('Access-Control-Allow-Origin', 'https://netflix-latest.netlify.app')
        //     next()
        // })
        this.app.use((req, res, next) => {
            const allowedOrigins = ['http://localhost:3000','http://192.168.29.152:3000','https://netflix-latest.netlify.app','http://127.0.0.1:5000']
            const origin = req.headers.origin;
            if (allowedOrigins.includes(origin)) {
                res.setHeader('Access-Control-Allow-Origin', origin);
            }
            next();
        })
    }
    
    setSession(){
        this.app.use(cookieParser());
        this.app.use(session({
            secret: 'my_netflix_secret_key',
            resave: false,
            saveUninitialized: true,
            cookie: { expires: new Date(Date.now() + 86400000) } // 24 hours from now
          }));
    }
    connectMongoDb(){
        const datbaseUrl = getEnvironmentVariables().db_url;
        mongoose.connect(datbaseUrl)
        .then(() => {
            console.log('mongodb is connected');
        })
        .catch((error) => {
            console.error('Error connecting to MongoDB:', error);
        });
    }

    configureBodyParser(){
        this.app.use(bodyParser.urlencoded({ extended: true }))
        this.app.use(bodyParser.json())
        this.app.use(upload.array('files'));
        // this.app.use(upload.fields([
        //     { name: 'image'},
        //     { name: 'video'}
        // ]))
    }

    setRoutes(){
        // set static route
        this.app.use('/src/uploads', express.static('src/uploads'));
        
        // this.app.use('/',(req,res)=>{
        //     try {
        //         res.status(200).json({
        //             message:"Welcome to Netflix Server"
        //         })
        //     } catch (error) {
        //         res.status(500).json({
        //             error:"Something went wrong!"
        //         })
        //     }
        // })

        this.app.use('/api/user', UserRouter)
        this.app.use('/api/post', PostRouter)
        this.app.use('/api/comment', CommentRouter)

        this.app.use('/api/movie', MoviesRouter)
        this.app.use('/api/series', SeriesRouter)
        this.app.use('/api/admin', AdminRouter)
    }

    error404Handler(){
        this.app.use((req, res) => {
            res.status(404).json({
                message: 'Not found!',
                status_code: 404
            })
        })
    }

    handleErrors(){
        this.app.use((error, req, res, next) => {
            const errorStatus = req.errorStatus || 500;

            res.status(errorStatus).json({
                message: error.message || 'Something Went Wrong. Please Try Again',
                status_code: errorStatus
            })
        })
    }

}