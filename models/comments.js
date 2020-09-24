/**
 * Created by gunnerhatmaker on 8/14/18.
 */
const mongoose = require('mongoose');
const userSchema = require('./user').schema;
const Schema = mongoose.Schema;

const commentSchema = new mongoose.Schema({
    comment:[{type: Schema.Types.ObjectId, ref: 'commentList' }],
    url: String,
    count: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('Comment', commentSchema);