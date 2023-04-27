import jwt from 'jsonwebtoken'
import { isNotEmptyString } from '../utils/is'
// const jwt = require('jsonwebtoken')

const secret = 'aoid&^isen[Iff_=eOSL@#feijfe%iKL}S'

const auth = async (req, res, next) => {
  const AUTH_SECRET_KEY = process.env.AUTH_SECRET_KEY
  if (isNotEmptyString(AUTH_SECRET_KEY)) {
    try {
      const Authorization = req.header('Authorization')
      if (!Authorization || Authorization.replace('Bearer ', '').trim() !== AUTH_SECRET_KEY.trim())
        throw new Error('Error: 无访问权限 | No access rights')
      next()
    }
    catch (error) {
      res.send({ status: 'Unauthorized', message: error.message ?? 'Please authenticate.', data: null })
    }
  }
  else {
    next()
  }
}

const sqlAuth = (req, res) => {
  // const { username } = req.body as UserInfo
  const token = req.headers.admintoken
  let isAuth = false
  if (token) {
    jwt.verify(token, secret, (error, decoded) => {
      const tokenFlag = error?.name
      if (tokenFlag === 'TokenExpiredError' || tokenFlag === 'JsonWebTokenError')
        isAuth = false

      else
        isAuth = true
    })
  }
  else {
    isAuth = false
  }
  if (isAuth)
    return true

  res.send({ status: 'Fail', message: '权限失效，请尝试重新登陆', data: JSON.stringify({ status: '2' }) })
  return false
}

const signUser = (username) => {
  return jwt.sign({ username }, secret, {
    expiresIn: (60 * 60 * 24) * 7,
  })
}

const userSqlAuth = (req, res) => {
  // const { username } = req.body as UserInfo
  const token = req.headers.usertoken
  let auth = ''
  if (token) {
    jwt.verify(token, secret, (error, decoded) => {
      const tokenFlag = error?.name
      if (tokenFlag === 'TokenExpiredError' || tokenFlag === 'JsonWebTokenError')
        auth = ''
      else
        auth = decoded.username
    })
  }
  return auth
}

export { auth, sqlAuth, signUser, userSqlAuth }
