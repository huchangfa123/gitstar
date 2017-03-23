// const https = require('https')
// const querystring = require('querystring')
const req = require('request-promise')

exports.getToken = async (code) => {
  let token = ''
  const state = '1231231'
  const options = {
    method: 'POST',
    uri: 'https://github.com/login/oauth/access_token',
    body: {
      client_id: '4f1c8132a1b559d5d9aa',
      client_secret: '9f3e6c7940a7646067b1adf359003ea510987d02',
      code: code,
      state: state
    },
    json: true
  }
  await req(options)
          .then(function (parsedBody) {
            token = parsedBody
            console.log(token)
          })
          .catch(function (err) {
            console.log(err)
          })

  return token
}

exports.getUser = async(token) => {
  // console.log(token)
  let data = ''
  const options = {
    uri: 'https://api.github.com/user',
    qs: {
      access_token: token
    },
    headers: {
      'User-Agent': 'Request-Promise'
    },
    json: true
  }
  await req(options)
          .then(function (repos) {
            console.log('user message:')
            console.log(repos)
            data = repos
          })
          .catch(function (err) {
            console.log(err)
          })
  return data
}

exports.getstar = async(username) => {
  let stars = ''
  const url = `https://api.github.com/users/${username}/starred`
  const options = {
    uri: url,
    headers: {
      'User-Agent': 'Request-Promise'
    },
    json: true
  }
  await req(options)
          .then(function (repos) {
            // console.log(repos)
            stars = repos
          })
          .catch(function (err) {
            console.log(err)
          })
  return stars
}
