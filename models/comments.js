/**
 * Created by gunnerhatmaker on 8/14/18.
 */
const mongoose = require('mongoose');

const commentSchema = mongoose.Schema({

    comment: [String],
    url: String,
    date: Date,
    count: Number,
    voters: [String],
    user: String


});



module.exports = mongoose.model('Comment',commentSchema);