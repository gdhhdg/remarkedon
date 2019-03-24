/**
 * Created by gunnerhatmaker on 3/22/19.
 */
/**
 * Created by gunnerhatmaker on 8/14/18.
 */
const mongoose = require('mongoose');
const userSchema = require('./user').schema;
const Schema = mongoose.Schema;

const commentListSchema = new mongoose.Schema({
        comment: String,
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        date: Date,
        url: String

});

module.exports = mongoose.model('CommentList', commentListSchema);