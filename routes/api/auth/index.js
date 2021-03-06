const Router = require('koa-router')
const { validateAgainst } = require('../../../lib/validation')
const jwt = require('../../../lib/jwt')
const registerHandler = require('./register')
const loginHandler = require('./login')
const logoutHandler = require('./logout')
const verifyEmailHandler = require('./verifyemail')
const passwordReset = require('./passwordReset')
const rtr = new Router()

rtr.all('/', async ctx => {
  ctx.send(ctx, 200, true, 'koa-hackathon-starter auth')
})

rtr.post(
  '/register',
  validateAgainst(registerHandler.schema),
  registerHandler.handler
)
rtr.post('/login', validateAgainst(loginHandler.schema), loginHandler.handler)
rtr.post('/logout', jwt.verifyToken, logoutHandler.handler)
rtr.post(
  '/verifyemail',
  validateAgainst(verifyEmailHandler.schema),
  verifyEmailHandler.handler
)
rtr.use(
  '/passwordreset',
  passwordReset.routes(),
  passwordReset.allowedMethods()
)

module.exports = rtr
