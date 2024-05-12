const Series = require('../models/Series');
const Episodes = require('../models/Episodes');

export class SeriesController {



    static async getAllSeries(req, res, next) {
        const page = parseInt(req.query.page) || 1;
        const perPage = 2;
        let currentPage = page;
        let prevPage = page === 1 ? null : page - 1;
        let pageToken = page + 1;
        let totalPages;

        try {
            const seriesCount = await Series.countDocuments();
             totalPages = Math.ceil(seriesCount/perPage);
             if(totalPages === page || totalPages === 0){
                 pageToken = null;
             }
             if(page > totalPages) {
                throw Error('No more series to show')
             }
            //  const series: any = await Series.find({}).skip((perPage * page) - perPage).limit(perPage);
             const series: any = await Series.find({});
             res.json({
                 series: series,
                 pageToken: pageToken,
                 totalPages: totalPages,
                 currentPage: currentPage,
                 prevPage: prevPage
             })
         } catch (e) {
             next(e)
         }
    }

    static async getPreferedSeries(req, res, next) {
        const content_type = req.session.content_type;
        const mood = req.session.mood;
        

        try {
            let my_genre = [];
            if (mood == "sad") {
                my_genre = ['comedy', 'romantic'];
            }else if(mood == "angry"){
                my_genre = ['comedy', 'romantic'];
            }else if(mood == "happy"){
                my_genre = ['comedy', 'romantic', 'thriller', 'horror', "suspance"];
            } else {
                res.status(400).json({ message: 'Please select valid mood.' });
            }
            if ((content_type === 'series') || (content_type == 'all')) {
                Series.find({ genre: { $in: my_genre } })
                    .then((content) => {
                        res.json({ content });
                    })
                    .catch((error) => {
                        next(error);
                    });
            } else {
                res.status(400).json({ message: 'Please enter movies/series.' });
            }

         } catch (e) {
             next(e)
         }
    }


    static async getEpisodesWithSeries(req, res, next) {
        const series_id = req.params.id;
        try {
            const series_data = await Series.find({ _id : series_id });
            const episode_data = await Episodes.find({ series : series_id });
            res.json({ "series" : series_data, "episodes" : episode_data });
         } catch (e) {
             next(e)
         }
    }

    static async getEpisodes(req, res, next) {
        const series_id = req.params.id;
        try {
            const episode_data = await Episodes.find({ series : series_id });
            res.json({ episode_data });
         } catch (e) {
             next(e)
         }
    }

  
}