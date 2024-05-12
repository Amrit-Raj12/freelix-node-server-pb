import {body, query} from 'express-validator';
import User from '../models/User';

export class UserValidators {
    static signUp() {
        return [body('email', 'Email is Required').isEmail().custom((email, {req}) => {
            return User.findOne({email: email}).then(user => {
                if (user) {
                    throw new Error('User Already Exist');
                } else {
                    return true;
                }
            })
        }),
            body('password', 'Password is Required').isString()
                .isLength({min: 8, max: 20}).withMessage('Password can be from 8-20 Characters only'),
            body('username', 'Username is Required').isString()];
    }

    static verifyUser() {
        return [body('verification_token', 'Verification Token is Required').isNumeric()]
    }

    static resendVerificationEmail() {
        return [query('email', 'Email is Required').isEmail()]
    }

    static updatePassword() {
        return [body('password', 'Password is Required').isString(),
        body('confirm_password', 'Confirm Password is Required').isString(),
        body('new_password', 'New Password is Required').isString()
        .custom((newPassword, {req}) => {
            if(newPassword === req.body.confirm_password){
                return true;
            } else {
                req.errorStatus = 422;
                throw new Error('Password and Confirm Password does not match')
            }
        })
    ]
    }

    static resetPassword(){
        return [body('email', 'Email is Required').isEmail().custom((email, {req}) => {
            return User.findOne({email:email}).then((user) => {
                if(user){
                    req.user = user;
                    return true;
                } else {
                    throw new Error('User Does Not Exist');
                }
            }) 
        }),
        body('new_password', 'New Password is Required').isString().custom((newPassword, {req}) => {
            if(newPassword === req.body.confirm_password){
                return true;
            } else {
                throw new Error('Confirm Password and new Password Does not Match')
            }
        }),
        body('confirm_password', 'Confirm Password is Required').isString(),
        body('reset_password_token', 'Reset Password Token is Required').isNumeric()
        .custom((token, {req}) => {
            if(Number(req.user.reset_password_token) === Number(token)){
                return true;
            } else {
                req.errorStatus = 422;
                throw new Error('Reset Password Token is Invalid. Please Try Again');
            }
    })
    ]
    }

     static login(){
        return [body('email', 'Email is required').isEmail().custom((email, {req}) => {
          return User.findOne({ email: email }).then(user => {
            if(user){
                req.user = user;
                return true;
            } else {
                throw new Error('Email/Password is incorrect')
            }
          })
        }), body('password', 'Password is required').isString()]
     }

     static sendResetPasswordEmail() {
        return [query('email').isEmail().custom((email, {req}) => {
           return User.findOne({email: email}).then((user) => {
                if(user){
                    return true;
                } else {
                  throw new Error('Email does not Exist')  
                }
            })
        })]
     }

     static verifyResetPasswordToken() {
        return [query('reset_password_token', 'Reset Password Token is Required').isNumeric()
        .custom((token, {req}) => {
            return User.findOne({
                reset_password_token: token,
                reset_password_token_time: {$gt: Date.now()}
            }).then((user) => {
                if(user){
                    return true;
                } else {
                    throw new Error('Token Does Not Exist. Please Request For New One.')
                }
            })
        })
        ]
     }

     static updateProfilePic(){
        return [body('profile_pic').custom((profilePic, {req}) => {
            if(req.file){
                return true;
            } else {
                throw new Error('File not uploaded');
            }
        })]
     }
     
     static preference(){
        return [body('watch_limit', 'Watchtime limit is required').isNumeric(), body('content_type', 'Please select any content type').isString(), body('mood', 'Please select mood').isString()]
     }
}


