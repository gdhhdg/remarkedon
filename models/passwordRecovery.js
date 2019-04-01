/**
 * Created by gunnerhatmaker on 3/28/19.
 */
/**
 * Created by gunnerhatmaker on 3/22/19.
 */
const mongoose = require('mongoose');
const userSchema = require('./user').schema;
const Schema = mongoose.Schema;

const passwordRecoverySchema = new mongoose.Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    resetPasswordToken: String,
    resetPasswordExpires: Date

});

module.exports = mongoose.model('PasswordRecovery', passwordRecoverySchema);