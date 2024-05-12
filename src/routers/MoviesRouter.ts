import {Router} from 'express';
import { GlobalMiddleWare } from '../middlewares/GlobalMiddleWare';
import { MoviesValidators } from '../validators/MoviesValidators';
import { MovieController } from '../controllers/MovieController';


class MoviesRouter {
    public router: Router;

    constructor(){
        this.router = Router();
        this.getRoutes();
        this.postRoutes();
        this.patchRoutes();
        this.deleteRoutes();
    }

    getRoutes(){
        this.router.get('/all', GlobalMiddleWare.authenticate, MovieController.getAllMovies);
        this.router.get('/prefered', GlobalMiddleWare.authenticate, MovieController.getPreferedMovies);
        this.router.get('/search-movie/:query', GlobalMiddleWare.authenticate, MovieController.searchMovie);
        this.router.get('/get-movie/:id', GlobalMiddleWare.authenticate, MovieController.getMovie);
        this.router.get('/stream-movie/:id', GlobalMiddleWare.authenticate, MovieController.streamVideo);
    }

    postRoutes(){
    }

    patchRoutes(){
    }

    deleteRoutes(){
    }
}

export default new MoviesRouter().router;