import User from '../models/User';
import {Utils} from '../utils/Utils';
import {NodeMailer} from '../utils/NodeMailer';
import * as Jwt from 'jsonwebtoken';
import { getEnvironmentVariables } from '../environments/env';

import * as Cheerio from 'cheerio';
import * as Request from 'request'
const moment = require('moment');
export class UserController {
    static async signUp(req, res, next) {
        // console.log(req.body.email)
        const email = req.body.email;
        const username = req.body.username;
        const password = req.body.password;
        const verificationToken = Utils.generateVerificationToken();
        try {
          const hash = await Utils.encryptPassword(password);
          const data = {
            email: email,
            password: hash,
            username: username,
            verification_token: verificationToken,
            verification_token_time: Date.now() + new Utils().MAX_TOKEN_TIME,
            created_at: new Date(),
            updated_at: new Date()
        };
        let user = await new User(data).save();
        const token = Jwt.sign({isAdmin: false, email: user.email, user_id: user._id},
            getEnvironmentVariables().jwt_secret, {expiresIn: '1d'});
            const userData = {
                isAdmin: false, 
                userName: user.username,
                email: user.email,
                _id: user._id,
                mood: user.mood,
                content_type: user.content_type,
                watch_limit: user.watch_limit,
                verified: user.verified
            }
        res.status(200).send({ success: true, token: token, token_validity: "1d", user: userData });
        await NodeMailer.sendEmail({
            to: ['amrit.raj1224@gmail.com'], subject: 'Email Verification',
            html: `<h1>${verificationToken}</h1>`
        })
        } catch (e) {
            next(e);
        }
    }

    static async verify(req, res, next) {
        const verificationToken = req.body.verification_token;
        const email = req.user.email;
        try {
            const user = await User.findOneAndUpdate({
                email: email, verification_token: verificationToken,
                verification_token_time: {$gt: Date.now()}
            }, {verified: true, updated_at: new Date()}, {new: true});
            if (user) {
                res.send({success: true, user: user});
            } else {
                throw new Error('Verification Token Is Expired.Please Request For a new One');
            }
        } catch (e) {
            next(e);
        }
    }


    static async resendVerificationEmail(req, res, next) {
        const email = req.user.email;
        const verificationToken = Utils.generateVerificationToken();
        try {
            const user: any = await User.findOneAndUpdate({email: email}, {
                verification_token: verificationToken,
                verification_token_time: Date.now() + new Utils().MAX_TOKEN_TIME
            });
            if (user) {
                res.status(200).json({
                    userVerificationToken: verificationToken
                })
                await NodeMailer.sendEmail({
                    to: [user.email], subject: 'Email Verification',
                    html: `<h1>${verificationToken}</h1>`
                });
                // res.json({success: true})
            } else {
                throw new Error('User Does Not Exist');
            }
        } catch (e) {
            next(e);
        }
    }

    static async login(req, res, next) {
        const password = req.body.password;
        const user = req.user;
        let expirytime = '1d';
        if (req.body.remember_me) {
            expirytime = '30d';
        }
        const userData = {
            isAdmin: false, 
            userName: req.user.username,
            email: req.user.email,
            _id: req.user._id,
            mood: req.user.mood,
            content_type: req.user.content_type,
            watch_limit: req.user.watch_limit,
            verified: req.user.verified
        }
        try {
            await Utils.comparePassword({
                plainPassword: password,
                encryptedPassword: user.password
            });
            const token = Jwt.sign({isAdmin: false, email: user.email, user_id: user._id},
                getEnvironmentVariables().jwt_secret, {expiresIn: expirytime});
            const data = {success:true, token: token, token_validity: expirytime, user: userData};
            res.json(data);
        } catch (e) {
            next(e);
        }
    }

    static async updatePassword(req, res, next){
        const user_id = req.user.user_id;
        const password = req.body.password;
        const newPassword = req.body.new_password;

        try {
          const user: any = await User.findOne({_id: user_id});
          await Utils.comparePassword({ plainPassword: password, encryptedPassword: user.password })
          const encryptedPassword =  await Utils.encryptPassword(newPassword);

        const newUser = await User.findOneAndUpdate({_id: user_id}, {password: encryptedPassword}, {new: true})
        res.send({success: true, newUser});      
        } catch (e) {
           next(e);
        }
    }

    static async resetPassword(req, res, next) {
        const user = req.user;
        const newPassword = req.body.new_password;

        try {
            const encryptedPassword = await Utils.encryptPassword(newPassword);
            const updatedUser = await User.findOneAndUpdate({_id: user._id}, {
                updated_at: new Date(),
                password: encryptedPassword
            }, {new: true});
            res.status(200).send({success: true, message: 'Password Updated Successfully'})
        } catch (e) {
            next(e)
        }
    }

    static async sendResetPasswordEmail(req, res, next) {
        const email = req.query.email;

        const resetPasswordToken = Utils.generateVerificationToken();

        try {
            const updatedUser = await User.findOneAndUpdate({ email: email }, { updated_at: new Date(), reset_password_token: resetPasswordToken, reset_password_token_time: Date.now() + new Utils().MAX_TOKEN_TIME }, {new: true});
            res.send({success: true, updatedUser});
           await NodeMailer.sendEmail({to: [email], subject: 'Reset Password Email', html: `<h1>${resetPasswordToken}</h1>`})
        } catch (e) {
            next(e)
        }
    }

    static verifyResetPasswordToken(req, res, next) {
        res.json({
            success: true
        })
    }

    static async updateProfilePic(req, res, next){
       const userId = req.user.user_id;
       const fileUrl = 'http://localhost:5000/' + req.file.path.replace(/\\/g, '/');
    //    const fileUrl = 'http://localhost:5000/' + req.file.path;
       
       try {
      const user = await User.findOneAndUpdate({_id: userId}, {
            updated_at: new Date(),
            profile_pic_url: fileUrl
           }, {new: true})
           
           res.send(user);
       } catch (e) {
            next(e)
       }
    }


    // test web-scraping
    static testWebScraping(req, res, next) {
        const data = []
        Request('https://webscraper.io/test-sites/e-commerce/allinone', function (error, response, html) {
            if(!error && response.statusCode == 200){
                // res.send(html)
                const $ = Cheerio.load(html);
                $('.thumbnail').each((index, element) => {
                    const image = $(element).find('.img-responsive').attr('src');
                    const title = $(element).find('.title').attr('title');
                    const description = $(element).find('.description').text();
                    const price = $(element).find('.price').text();

                    data.push({title: title, image: image, description: description, price: price})
                })
                res.send(data);
            }
        })
            
    }
    
    // user preferences
    static async preference(req, res, next) {
        if(!req.user.isAdmin){
            const watch_limit_all = req.body.watch_limit;

            // const watch_limit_hour = watch_limit_all.format('HH');
            // const watch_limit_minute = watch_limit_all.format('mm');
            // const watch_limit = (watch_limit_hour*60) + watch_limit_minute;
            const watch_limit = watch_limit_all;
            const content_type = req.body.content_type;
            const mood = req.body.mood;
            try {
                const user_id = req.user.user_id;
                const user_update = await User.findOneAndUpdate(
                        {_id: user_id},
                        {
                            mood: mood,
                            content_type: content_type,
                            watch_limit: watch_limit,
                            updated_at: new Date()
                        }, {new: true}
                    );
                const data = {session: req.session, user: user_update};
                const to_url = req.get('host') + req.originalUrl;
                const url_segs = to_url.split('/').filter(segment => segment !== '');
                const new_url = req.protocol + "://" + url_segs[0] + "/" + url_segs[1] + "/movie" + "/prefered";
                // res.redirect(new_url);
                res.status(200);
                res.send({success: true, message: "Preferance has been updated successfully."});
            } catch (e) {
                next(e);
            }
        }else{
            res.status(400).json({ message: 'Please login as Normal User'});
        }
    }

}
