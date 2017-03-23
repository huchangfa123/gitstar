const Koa = require('koa')
const Route = require('koa-router')
const co = require('co')
const path = require('path')
const render = require('koa-swig')// set template
const serve = require('koa-static')// set static file
const bodyparser = require('koa-bodyparser')// get body
const dataRouter = require('./routes/getdatarouter')
const session = require('koa-session')
const sessionConfig = require('./config/session')
const cors = require('kcors')
require('./lib/database')

const app = new Koa()
const router = new Route()

app.use(cors())
app.use(serve(path.join(__dirname, 'static')))
app.use(bodyparser())
app.use(session(sessionConfig.CONFIG, app))

// 设置页面加载资源位置
app.context.render = co.wrap(render({
  root: path.join(__dirname, './views'),
  autoescape: true,
  cache: false, // disable, set to false
  ext: 'html'
}))

router.use('/', dataRouter.routes(), dataRouter.allowedMethods())

app.use(router.routes(), router.allowedMethods())

module.exports = app
