const mongoose = require('mongoose')

const Schema = mongoose.Schema

const UserSchema = new Schema({
  name: String,
  email: String,
  taglist: [{
    TagName: String
  }]
})

const StarsSchema = new Schema({
  user: String,
  Starlist: [{
    pjname: String
  }]
})

const TagsSchema = new Schema({
  UserName: String,
  StarpjId: mongoose.Schema.Types.ObjectId,
  TagList: [{
    TagName: String
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
