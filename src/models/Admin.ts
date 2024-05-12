import * as mongoose from 'mongoose';
import {model} from 'mongoose';

const adminSchema = new mongoose.Schema({
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
    status: {type: String, required: true, default: "requested"},
    aproved_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin",
        required: false
    },
    aproved_at: {type: Date, required: false},
});

export default model('admin', adminSchema);
