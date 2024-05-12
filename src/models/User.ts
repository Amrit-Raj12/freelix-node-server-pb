import * as mongoose from 'mongoose';
import {model} from 'mongoose';

const userSchema = new mongoose.Schema({
    email: {type: String, required: true},
    password: {type: String, required: true},
    profile_pic_url: {type: String, required: false},
    verified: {type: Boolean, required: true, default: false},
    verification_token: {type: Number, required: true},
    verification_token_time: {type: Date, required: false},
    reset_password_token: {type: Number, required: false},
    reset_password_token_time: {type: Date, required: false},
    username: {type: String, required: true},
    created_at: {type: Date, required: true, default: new Date()},
    updated_at: {type: Date, required: true, default: new Date()},
    mood: {type: String, required: true, default: "happy"},
    content_type: {type: String, required: true, default: "all"},
    watch_limit: {type: Number, required: true, default: 240},
});

export default model('users', userSchema);
