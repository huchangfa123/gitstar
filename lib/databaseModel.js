const mongoose = require('mongoose')

const Schema = mongoose.Schema

const UserSchema = new Schema({
  name: String,
  email: String,
  taglist: [{
    tagName: String
  }]
})

const StarsSchema = new Schema({
  user: String,
  Starlist: [{
    pjname: String,
    tag: []
  }]
})

const User = mongoose.model('User', UserSchema)
const Stars = mongoose.model('Stars', StarsSchema)

module.exports = {
  User,
  Stars
}
