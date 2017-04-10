const Router = require('koa-router')
const getAuthData = require('../services/getAuthData')

const router = new Router()

router.get('login', async (ctx, next) => {
  await ctx.render('login')
})

router.get('first', async (ctx, next) => {
  await ctx.render('first')
})

router.get('api/getaccept', async (ctx, next) => {
  const baseurl = 'https://github.com/login/oauth/authorize?'
  const scope = 'scope=user%20public_repo%20notifications&'
  const url = `${baseurl}client_id=4f1c8132a1b559d5d9aa&${scope}state=5486545`
  // await ctx.redirect(url)
  ctx.body = {
    success: true,
    data: {
      url
    }
  }
})

router.post('api/getstar', async (ctx, next) => {
  // 获取token
  const gitreq = await getAuthData.getToken(ctx.request.body.code)
  const token = gitreq.access_token
  // 获取用户信息，datalogin为用户名
  const data = await getAuthData.getUser(token)
  const username = data.login
  const avatarUrl = data.avatar_url
  // 更新star项目表
  await getAuthData.updatestar(username)
  // 获取star项目表
  const stars = await getAuthData.getstar(username)
  let result = []
  // console.log(stars[0].Starlist.length)
  for (let i = 0; i < stars[0].Starlist.length; i++) {
    const id = stars[0].Starlist[i]._id
    const pjname = stars[0].Starlist[i].pjname
    const tag = await getAuthData.gettag(id, username, pjname)
    result.push({
      pjname: tag.PjName,
      secname: stars[0].Starlist[i].secname,
      tag: tag.TagList,
      language: stars[0].Starlist[i].language,
      stargazers: stars[0].Starlist[i].stargazers,
      personalintro: stars[0].Starlist[i].intro,
      intro: stars[0].Starlist[i].intro,
      url: stars[0].Starlist[i].pjurl,
      index: i,
      id: id
    })
  }
  ctx.body = {
    success: true,
    userMessage: {
      username,
      avatarUrl
    },
    data: {
      result
    }
  }
})
// 设置标签
router.post('api/set', async (ctx, next) => {
  const name = 'huchangfa123'
  const id = ctx.request.body.id
  const tag = ctx.request.body.tag
  const color = ctx.request.body.color
  // const id = '58e4d62a63fb5229d5d0667d'
  // const tag = 'koa'
  // const color = '#652315'
  await getAuthData.settag(id, name, tag, color)
  ctx.body = {
    success: true,
    message: 'success',
    tag: {
      tagname: tag,
      tagcolor: color
    }
  }
})

// 删除标签
router.post('api/deletetag', async (ctx, next) => {
  const name = 'huchangfa123'
  const id = ctx.request.body.id
  const tag = ctx.request.body.tag
  // console.log('id:' + id)
  // console.log('tag:' + tag)
  // const id = '58e4d273236de726081b332b'
  // const tag = 'koa'
  await getAuthData.deletetag(id, name, tag)
  ctx.body = {
    success: true,
    message: 'delete success!'
  }
})

// 获取用户标签
router.get('api/gettag', async(ctx, next) => {
  const user = 'huchangfa123'
  const result = await getAuthData.getusertag(user)
  ctx.body = {
    success: true,
    data: {
      result
    }
  }
})

// 获取用户最近标签
router.get('api/getrecenttag', async(ctx, next) => {
  const user = 'huchangfa123'
  const result = await getAuthData.getrecenttag(user)
  console.log(result)
  ctx.body = {
    success: true,
    data: {
      result
    }
  }
})

// 根据标签获取项目信息
router.post('api/taggetpj', async(ctx, next) => {
  const user = 'huchangfa123'
  const tag = ctx.request.body.tag
  const result = await getAuthData.getpjBytag(user, tag)
  ctx.body = {
    success: true,
    data: {
      result
    }
  }
})

router.post('api/setsecnameandintro', async(ctx, next) => {
  const user = 'huchangfa123'
  const id = ctx.request.body.id
  const secname = ctx.request.body.secname
  const personalintro = ctx.request.body.personalintro
  // const id = '58ea283cb14ae43dcef84476'
  // const secname = '网页编辑文本器2'
  await getAuthData.setsecnameandintro(user, id, secname, personalintro)
  ctx.body = {
    success: true,
    data: {
      secname
    }
  }
})

module.exports = router
