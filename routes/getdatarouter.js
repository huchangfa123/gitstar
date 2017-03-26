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
  const gitreq = await getAuthData.getToken(ctx.request.body.code)
  const token = gitreq.access_token
  const data = await getAuthData.getUser(token)
  const username = data.login
  await getAuthData.updatestar(username)
  const stars = await getAuthData.getstar(username)
  let result = []
  // console.log(stars[0].Starlist.length)
  for (let i = 0; i < stars[0].Starlist.length; i++) {
    const id = stars[0].Starlist[i]._id
    const tag = await getAuthData.gettag(id, username)
    result.push({
      pjname: stars[0].Starlist[i].pjname,
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

router.get('api/set', async (ctx, next) => {
  const name = 'huchangfa123'
  const id = '58d7c7218ac5363b64fc9847'
  const result = await getAuthData.settag(id, name, 'youli')
  ctx.body = {
    success: true,
    data: {
      result
    }
  }
})

module.exports = router
