const Router = require('koa-router')
const getAuthData = require('../services/getAuthData')

const router = new Router()

router.get('login', async(ctx, next) => {
  await ctx.render('login')
})

router.get('first', async(ctx, next) => {
  await ctx.render('first')
})

router.get('api/getaccept', async(ctx, next) => {
  let baseurl = 'https://github.com/login/oauth/authorize?'
  const scope = 'scope=user%20public_repo%20notifications&'
  let url = `${baseurl}client_id=4f1c8132a1b559d5d9aa&${scope}state=5486545`
  // await ctx.redirect(url)
  ctx.body = {
    success: true,
    data: {
      url
    }
  }
})

// router.post('getaccesstoken', async(ctx, next) => {
//   const token = await getToken.getToken(ctx.request.body.code)
//   ctx.body = {
//     success: true,
//     data: token
//   }
// })

router.post('api/getstar', async(ctx, next) => {
  const gitreq = await getAuthData.getToken(ctx.request.body.code)
  const token = gitreq.access_token
  const data = await getAuthData.getUser(token)
  const username = data.login
  const stars = await getAuthData.getstar(username)
  console.log('star message:')
  console.log(stars)
  // console.log(ctx.request.body.code)
  ctx.body = {
    success: true,
    data: {
      starred: stars
    }
  }
})

module.exports = router
