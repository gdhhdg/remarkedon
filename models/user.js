const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
//const commentSchema = require('./comments').schema;
const Schema = mongoose.Schema;

const userSchema = new mongoose.Schema({
    user: {
        local: {
            username: String,
            email: String,
            password: String,
        },
        facebook: {
            id: String,
            token: String,
            name: String,
            email: String
        },
        twitter: {
            id: String,
            token: String,
            displayName: String,
            username: String
        },
        google: {
            id: String,
            token: String,
            email: String,
            name: String

        }
    },
    comment: [{type: Schema.Types.ObjectId, ref:'CommentList'}],
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    joinDate: {type: Date, default: Date.now }
});

userSchema.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8),null);
};

userSchema.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.user.local.password);
};



module.exports = mongoose.model('User', userSchema);