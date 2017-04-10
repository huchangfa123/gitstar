const req = require('request-promise')
const Model = require('../lib/databaseModel')
const mongoose = require('mongoose')

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
      avatar: data.avatar_url,
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
            console.log(repos)
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
              secname: '',
              language: stars[i].language,
              stargazers: stars[i].stargazers_count,
              intro: stars[i].description,
              personalintro: '',
              pjurl: stars[i].html_url
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

// 设置项目的标签
exports.settag = async (id, name, ntag, color) => {
  // 找出项目对应的tag列表
  const result = await Model.Tags.find({
    StarpjId: id,
    UserName: name
  })
  // 对项目的tag列表进行更新查重
  if (result) {
    let checkSame = false
    for (let i = 0; i < result[0].TagList.length; i++) {
      if (result[0].TagList[i].TagName === ntag) { checkSame = true }
    }
    if (!checkSame) {
      await Model.Tags.update({StarpjId: id, UserName: name}, {
        $push: {
          'TagList': {
            TagName: ntag,
            TagColor: color
          }
        }
      })
    }
  }
  // 找出用户对应的tag列表进行更多新查重
  const userresult = await Model.User.find({
    name: name
  })
  if (userresult) {
    let checkSam = false
    for (let i = 0; i < userresult[0].taglist.length; i++) {
      if (userresult[0].taglist[i].TagName === ntag) {
        checkSam = true
        const times = userresult[0].taglist[i].UseTimes
        await Model.User.update({name: name}, {
          $pull: {
            'taglist': {
              TagName: ntag,
              UseTimes: times
            }
          }
        })
        const ntimes = times + 1
        await Model.User.update({name: name}, {
          $push: {
            'taglist': {
              TagName: ntag,
              UseTimes: ntimes
            }
          }
        })
        break
      }
    }
    if (!checkSam) {
      await Model.User.update({name: name}, {
        $push: {
          'taglist': {
            TagName: ntag,
            UseTimes: 1
          }
        }
      })
    }
  }
}

// 获取项目标签
exports.gettag = async(id, name, pjname) => {
  let result = await Model.Tags.findOne({
    StarpjId: id,
    UserName: name,
    PjName: pjname
  })
  if (!result) {
    const TagEntity = new Model.Tags({
      UserName: name,
      PjName: pjname,
      StarpjId: id,
      TagList: []
    })
    await TagEntity.save()
    result = TagEntity
  }
  return result
}

// 删除项目标签
exports.deletetag = async(id, name, tag) => {
  // 删除tag表中的标签
  await Model.Tags.update({
    UserName: name,
    StarpjId: id
  }, {
    $pull: {
      'TagList': {TagName: tag}
    }
  })

// 删除user中的标签
  const userresult = await Model.User.find({
    name: name
  })

  if (userresult) {
    for (let i = 0; i < userresult[0].taglist.length; i++) {
      if (userresult[0].taglist[i].TagName === tag) {
        const times = userresult[0].taglist[i].UseTimes
        await Model.User.update({name: name}, {
          $pull: {
            'taglist': {
              TagName: tag,
              UseTimes: times // mongo的default会一直default，不能更改
            }
          }
        })
        const ntimes = times - 1
        if (ntimes !== 0) {
          await Model.User.update({name: name}, {
            $push: {
              'taglist': {
                TagName: tag,
                UseTimes: ntimes
              }
            }
          })
        }
        break
      }
    }
  }
}

// 获取用户标签
exports.getusertag = async(name) => {
  const result = await Model.User.findOne({
    name: name
  })
  const usertaglist = result.taglist
  return usertaglist
}

// 获取最近用户标签
exports.getrecenttag = async(name) => {
  const allresult = await Model.User.findOne({
    name: name
  })
  const result = []
  let count = 10
  for (let i = allresult.taglist.length - 1; i >= 0; i--) {
    // console.log(allresult.taglist[i])
    result.push({
      index: count % 10,
      tagname: allresult.taglist[i].TagName,
      tagusestime: allresult.taglist[i].UseTimes
    })
    count--
    if (count === 0) break
  }
  return result
}

// 根据标签获取项目
exports.getpjBytag = async(name, tag) => {
  let result = []
  const Tagallpj = await Model.Tags.find({
    UserName: name
  })
  const allpjData = await Model.Stars.find({
    user: name
  })
  let count = 0
  for (let i = 0; i < Tagallpj.length; i++) {
    for (let j = 0; j < Tagallpj[i].TagList.length; j++) {
      if (Tagallpj[i].TagList[j].TagName === tag) {
        for (let k = 0; k < allpjData[0].Starlist.length; k++) {
          if (allpjData[0].Starlist[k].pjname === Tagallpj[i].PjName) {
            result.push({
              pjname: Tagallpj[i].PjName,
              secname: allpjData[0].Starlist[k].secname,
              tag: Tagallpj[i].TagList,
              language: allpjData[0].Starlist[k].language,
              stargazers: allpjData[0].Starlist[k].stargazers,
              intro: allpjData[0].Starlist[k].intro,
              personalintro: allpjData[0].Starlist[k].personalintro,
              url: allpjData[0].Starlist[k].pjurl,
              index: count,
              id: allpjData[0].Starlist[k]._id
            })
            count++
            break
          }
        }
      }
    }
  }
  return result
}

// 设置项目的别名和备注信息
exports.setsecnameandintro = async (name, id, secname, perintro) => {
  const allpj = await Model.Stars.findOne({user: name})
  for (let i = 0; i < allpj.Starlist.length; i++) {
    const nid = allpj.Starlist[i]._id + ''
    if (nid === id) {
      allpj.Starlist[i].secname = secname
      allpj.Starlist[i].personalintro = perintro
      allpj.save()
    }
  }
}
