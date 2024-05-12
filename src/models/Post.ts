import * as mongoose from 'mongoose';
import {model} from 'mongoose';
import Comment from './Comment';
interface IPost {
    user_id: mongoose.Types.ObjectId;
    created_at: Date;
    updated_at: Date;
    content: string;
    comments: mongoose.Types.ObjectId[];
}

const postSchema = new mongoose.Schema({
    user_id: {type: mongoose.Types.ObjectId, required: true},
    created_at: {type: Date, required: true},
    updated_at: {type: Date, required: true},
    content: {type: String, required: true},
    comments: [{type: mongoose.Types.ObjectId, ref: 'comments'}],
})

postSchema.post('deleteOne', { document: true, query: false }, async (post) => {
    for (let id of post.comments) {
        await Comment.findOneAndDelete({ _id: id });
    }
});

postSchema.virtual('commentCount').get(function () {
    return this.comments.length;
})

export default model<IPost>('post', postSchema);