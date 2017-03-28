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
  await ctx.redirect(url)
})

router.post('api/getstar', async (ctx, next) => {
  // 获取token
  const gitreq = await getAuthData.getToken(ctx.request.body.code)
  const token = gitreq.access_token
  // 获取用户信息，datalogin为用户名
  const data = await getAuthData.getUser(token)
  const username = data.login
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
      tag: tag.TagList
    })
  }
  ctx.body = {
    success: true,
    data: {
      result
    }
  }
})
// 设置标签
router.get('api/set', async (ctx, next) => {
  const name = 'huchangfa123'
  const id = '58d8ff872ed03c201a50dce5'
  const result = await getAuthData.settag(id, name, 'youli')
  ctx.body = {
    success: true,
    data: {
      result
    }
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

// 根据标签获取项目信息
router.get('api/taggetpj', async(ctx, next) => {
  const user = 'huchangfa123'
  const tag = 'youli'
  const result = await getAuthData.getpjBytag(user, tag)
  ctx.body = {
    success: true,
    data: {
      result
    }
  }
})

module.exports = router
