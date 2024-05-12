import {body, param} from 'express-validator';
import Admin from '../models/Admin';

export class AdminValidators {
    static signUp() {
        return [body('email', 'Email is Required').isEmail().custom((email, {req}) => {
            return Admin.findOne({email: email}).then(user => {
                if (user) {
                    throw new Error('This user is already requested!');
                } else {
                    return true;
                }
            })
        }),
            body('password', 'Password is Required').isString()
                .isLength({min: 8, max: 20}).withMessage('Password can be from 8-20 Characters only'),
            body('username', 'Username is Required').isString()];
    };

    static login(){
        return [body('email', 'Email is required').isEmail().custom((email, {req}) => {
          return Admin.findOne({ email: email }).then(user => {
            if(user){
                req.user = user;
                return true;
            } else {
                throw new Error('Email/Password is incorrect')
            }
          })
        }), body('password', 'Password is required').isString()]
     };

     static approveUser(){
        return [
            param('id',"User ID is required").isString(),
        ];
     };
}