const req = require('request-promise')
const Model = require('../lib/databaseModel')

// 授权获取access_token
exports.getToken = async (code) => {
  let token = ''
  const state = '1231231'

  const options = {
    method: 'POST',
    uri: 'https://github.com/login/oauth/access_token',
    body: {
      client_id: '4f1c8132a1b559d5d9aa',
      client_secret: '9f3e6c7940a7646067b1adf359003ea510987d02',
      code,
      state
    },
    json: true
  }

  await req(options).then((parsedBody) => {
    token = parsedBody
    console.log(token)
  }).catch((err) => {
    console.log(err)
  })

  return token
}

// 通过access_token 获取用户信息
exports.getUser = async (token) => {
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
          .then((repos) => {
            console.log('user message:')
            console.log(repos)
            data = repos
          })
          .catch((err) => {
            console.log(err)
          })
  // 把用户信息存进数据库,先判断用户是否存在
  const result = await Model.User.findOne({
    name: data.login
  })
  if (!result) {
    const UserEntity = new Model.User({
      name: data.login,
      email: data.email,
      taglist: []
    })
    await UserEntity.save()
    const StarsEntity = new Model.Stars({
      user: data.login,
      Starlist: []
    })
    await StarsEntity.save()
  }
  return data
}

// 更新用户的star的项目
exports.updatestar = async (username) => {
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
          .then((repos) => {
            // console.log(repos)
            stars = repos
          })
          .catch((err) => {
            console.log(err)
          })

  for (let i = 0; i < stars.length; i++) {
    const result = await Model.Stars.find({
      'Starlist.pjname': stars[i].name
    })
    if (result.length === 0) {
      await Model.Stars.update({user: username},
        {
          $push: {
            'Starlist': {
              pjname: stars[i].name,
              tag: []
            }
          }
        })
    }
  }
}

// 从数据库获取star的项目
exports.getstar = async (username) => {
  const stars = await Model.Stars.find({
    user: username
  })
  return stars
}

// exports.settap = async () => {

// }
