const mongoose = require('mongoose')

const Schema = mongoose.Schema

const UserSchema = new Schema({
  name: String,
  email: String,
  avatar: String,
  taglist: [{
    TagName: String,
    UseTimes: Number
  }]
})

const StarsSchema = new Schema({
  user: String,
  Starlist: [{
    pjname: String,
    secname: String,
    language: String,
    stargazers: String,
    intro: String,
    personalintro: String,
    pjurl: String
  }]
})

const TagsSchema = new Schema({
  UserName: String,
  PjName: String,
  StarpjId: mongoose.Schema.Types.ObjectId,
  TagList: [{
    TagName: String,
    TagColor: String
  }]
})

const User = mongoose.model('User', UserSchema)
const Stars = mongoose.model('Stars', StarsSchema)
const Tags = mongoose.model('Tags', TagsSchema)

module.exports = {
  User,
  Stars,
  Tags
}
