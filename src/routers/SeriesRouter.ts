import {Router} from 'express';
import { GlobalMiddleWare } from '../middlewares/GlobalMiddleWare';
import { SeriesValidators } from '../validators/SeriesValidators';
import { SeriesController } from '../controllers/SeriesController';
// import { EpisodeValidators } from '../validators/EpisodeValidators';


class SeriesRouter {
    public router: Router;

    constructor(){
        this.router = Router();
        this.getRoutes();
        this.postRoutes();
        this.patchRoutes();
        this.deleteRoutes();
    }

    getRoutes(){
        this.router.get('/all', GlobalMiddleWare.authenticate, SeriesController.getAllSeries);
        this.router.get('/prefered', GlobalMiddleWare.authenticate, SeriesController.getPreferedSeries);
        this.router.get('/get-episodes/:id', GlobalMiddleWare.authenticate, SeriesController.getEpisodes);
        this.router.get('/get-series-with-episodes/:id', GlobalMiddleWare.authenticate, SeriesController.getEpisodesWithSeries);
    }

    postRoutes(){
    }

    patchRoutes(){
        
    }

    deleteRoutes(){
        
    }
}

export default new SeriesRouter().router;