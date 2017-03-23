const mongoose = require('mongoose')
const databaseConfig = require('config').get('Database')

mongoose.Promise = require('bluebird')

mongoose.createConnection(databaseConfig.host, databaseConfig.name)

const Schema = mongoose.Schema

const UserSchema = new Schema({
  name: String,
  email: String,
  typelist: [{
    typeName: String,
    datalist: []
  }]
})

const User = mongoose.model('User', UserSchema)

module.exports = {
  User
}
