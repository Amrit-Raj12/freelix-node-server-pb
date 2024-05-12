import { Router } from "express"
import { AdminController } from "../controllers/AdminController"
import { AdminValidators } from "../validators/AdminValidators"
import { UserValidators } from "../validators/UserValidators"
import { MoviesValidators } from "../validators/MoviesValidators"
import { SeriesValidators } from "../validators/SeriesValidators"
import { GlobalMiddleWare } from "../middlewares/GlobalMiddleWare"
import { Utils } from "../utils/Utils"

class AdminRouter {
  public router: Router

  constructor() {
    this.router = Router()
    this.getRoutes()
    this.postRoutes()
    this.patchRoutes()
    this.deleteRoutes()
  }

  getRoutes() {
    this.router.get(
      "/get-dashboard-data",
      GlobalMiddleWare.authenticate,
      AdminController.getDashboardData
    )
    this.router.get(
      "/movie/all",
      GlobalMiddleWare.authenticate,
      AdminController.getAllMovies
    )
    this.router.get(
      "/get-movie/:id?",
      GlobalMiddleWare.authenticate,
      AdminController.getMovies
    )
    this.router.get(
      "/get-user/:id?",
      GlobalMiddleWare.authenticate,
      AdminController.getUsers
    )
    this.router.get(
      "/get-admin/:id?",
      GlobalMiddleWare.authenticate,
      AdminController.getAdmins
    )
  }

  postRoutes() {
    // Admin Operations
    this.router.post(
      "/login",
      AdminValidators.login(),
      GlobalMiddleWare.checkError,
      AdminController.login
    )
    this.router.post(
      "/signup",
      AdminValidators.signUp(),
      GlobalMiddleWare.checkError,
      AdminController.signUp
    )

    // Movie Operations
    this.router.post(
      "/add-movie",
      GlobalMiddleWare.authenticate,
      MoviesValidators.addMovies(),
      GlobalMiddleWare.checkError,
      AdminController.addMovies
    )
    this.router.post(
      "/upload-files/:type/:id",
      GlobalMiddleWare.authenticate,
      AdminController.uploadFiles
    )

    // Series Operations
    // this.router.post('/add', GlobalMiddleWare.authenticate, SeriesValidators.addSeries(), GlobalMiddleWare.checkError, AdminController.addSeries);
    // this.router.post('/add-episode/:id', GlobalMiddleWare.authenticate, SeriesValidators.addEpisodes(), GlobalMiddleWare.checkError, AdminController.addEpisode);
  }

  patchRoutes() {
    this.router.patch(
      "/approve-admin/:id",
      GlobalMiddleWare.authenticate,
      AdminValidators.approveUser(),
      GlobalMiddleWare.checkError,
      AdminController.approveUser
    )
    this.router.patch(
      "/update-movie/:id",
      GlobalMiddleWare.authenticate,
      //   MoviesValidators.updateMovies(),
      GlobalMiddleWare.checkError,
      AdminController.updateMovies
    )
    this.router.patch(
      "/update-sync-movie",
      GlobalMiddleWare.authenticate,
      AdminController.syncUpdateMovies
    )
  }

  deleteRoutes() {
    this.router.delete(
      "/delete-movie/:id",
      GlobalMiddleWare.authenticate,
      MoviesValidators.deleteMovies(),
      GlobalMiddleWare.checkError,
      AdminController.deleteMovies
    )
  }
}
export default new AdminRouter().router
