const Koa = require('koa')
const fs = require('fs')
const path = require('path')
const bodyParser = require('koa-bodyparser')
const logger = require('koa-logger')
const rt = require('koa-response-time')
const koaStatic = require('koa-static')
const compress = require('koa-compress')
const helmet = require('koa-helmet')
const debugLogger = require('debug')('koa-logger')
const routes = require('./routes')

const app = new Koa()

app.context.send = (ctx, status, success, message, extra) => {
  ctx.status = status
  ctx.body = {
    success,
    message,
    ...extra
  }
}

// Custom error handling
app.context.throw = (ctx, status, message, error) => {
  ctx.send(ctx, status, false, message, { error })
}

// Mount models onto app.context
const models = {}
const modelFiles = fs
  .readdirSync('./models/')
  .filter(f => path.extname(f) === '.js')
for (let model of modelFiles) {
  Object.defineProperty(models, path.basename(model, '.js'), {
    value: require(`./models/${model}`),
    writable: false
  })
}
Object.defineProperty(app.context, 'models', { value: models, writable: false })

// Mount sequelize operators onto app.context
Object.defineProperty(app.context, 'SequelizeOp', {
  value: require('sequelize').Op,
  writable: false
})

// Serve static assets
app.use(koaStatic(__dirname + '/static', { defer: true }))

app.use(logger(str => debugLogger(str)))
app.use(rt())
app.use(compress())
app.use(helmet())

// Body parser
app.use(
  bodyParser({
    enableTypes: ['json'],
    onerror: (error, ctx) => ctx.throw(ctx, 400, 'Bad body', error)
  })
)

// Mount routes
app.use(routes.routes(), routes.allowedMethods())

// 404 handling
app.use(async ctx => ctx.throw(ctx, 404, 'Resource not found'))

module.exports = app
