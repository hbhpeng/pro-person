import { error } from 'console'
import type { PoolConnection } from 'mysql2/promise'
import mysql from 'mysql2/promise'
import { getTodayDate } from './dateAuth'

export interface UserInfo {
  userid?: number
  username: string
  password: string
  usagecount: number
  usecount: number
  usageword: number
  useword: number
  openid?: string
  isVip: number
  vipendday?: string
}

interface AdminInfo {
  userid: number
  username: string
  password: string
}

// 生成随机字符串
function randomString(length) {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < length; i++)
    result += charset.charAt(Math.floor(Math.random() * charset.length))

  return result
}

// 格式化日期
function formatDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}${month}${day}`
}

const pool = mysql.createPool({
  host: 'mysql',
  // host: 'localhost',
  port: 3306,
  user: 'houp',
  password: '624634',
  database: 'GPTDatabase',
  connectionLimit: 100,
})

export async function getUserInfoPage(page: number, pageSize: number): Promise<UserInfo[]> {
  const offset = (page - 1) * pageSize
  const sql = 'SELECT * FROM GPTUserInfo LIMIT ?, ?'

  let connection: PoolConnection
  try {
    connection = await pool.getConnection()
    const [results] = await connection.query(sql, [offset, pageSize])
    return results as UserInfo[]
  }
  catch (error) {
    console.error(`Error querying database: ${error.stack}`)
    return []
  }
  finally {
    connection.release()
  }
}

export async function addOrUpdateUserInfo(userinfo: UserInfo) {
  let connection: PoolConnection
  try {
    connection = await pool.getConnection()
    let sql: string
    if (!userinfo.userid || userinfo.userid < 0) {
      // 插入
      sql = 'insert into GPTUserInfo(`username`, `usagecount`, `usecount`, `password`) values(?, ?, ?, ?)'
      await connection.execute(sql, [userinfo.username, userinfo.usagecount, userinfo.usecount, userinfo.password])
    }
    else {
      // 更新
      sql = 'update GPTUserInfo set username=?, usagecount=?, usecount=?, password=? where userid=?'
      await connection.execute(sql, [userinfo.username, userinfo.usagecount, userinfo.usecount, userinfo.password, userinfo.userid])
    }
    return { status: 'success' }
  }
  catch (error) {
    // console.log(error)
    // console.error(`Error querying database: ${error.stack}`)
    // throw error
    return { status: 'fail', error }
  }
  finally {
    connection.release()
  }
}

export async function removeUserInfo(userinfo: UserInfo) {
  const sql = 'delete from GPTUserInfo where userid = ?'
  let connection: PoolConnection
  try {
    connection = await pool.getConnection()
    if (!userinfo.userid)
      throw error('需要用户id')
    await connection.query(sql, [userinfo.userid])
    return { status: 'success' }
  }
  catch (error) {
    // console.error(`Error querying database: ${error.stack}`)
    // throw error
    return { status: 'fail', error }
  }
  finally {
    connection.release()
  }
}

// 管理员验证
export async function verifyAdmin(username: string, password: string) {
  const sql = 'SELECT * FROM GPTAdmin where username = ?'
  let connection: PoolConnection
  try {
    connection = await pool.getConnection()
    const [results] = await connection.query(sql, [username])
    const [admin] = results as AdminInfo[]
    if (admin && admin.password === password)
      return true

    return false
  }
  catch (error) {
    // console.error(`Error querying database: ${error.stack}`)
    // throw error
    return false
  }
  finally {
    connection.release()
  }
}

export async function deleteOpenApiKey(key: string) {
  const sql = 'delete from GPTAiKey where aikey = ?'
  let connection: PoolConnection
  try {
    connection = await pool.getConnection()
    await connection.execute(sql, [key])
    return true
  }
  catch (error) {
    // console.error(`Error querying database: ${error.stack}`)
    // throw error
    return false
  }
  finally {
    connection.release()
  }
}

export async function databaseApiKeys() {
  const sql = 'SELECT id, aikey, enddate FROM GPTAiKey'

  let connection: PoolConnection
  try {
    connection = await pool.getConnection()
    const [result] = await connection.query(sql) as any
    const data = result.map((row: any) => ({
      id: row.id,
      key: row.aikey,
      lastmodify: row.enddate,
    }))
    return data
  }
  finally {
    connection.release()
  }
}

async function updatCurrentKey() {
  const date = await getTodayDate()
  const currentkey = process.env.OPENAI_API_KEY
  const sql = `UPDATE GPTAiKey SET enddate = '${date}' WHERE aikey = '${currentkey}'`
  let connection: PoolConnection
  try {
    connection = await pool.getConnection()
    await connection.query(sql)
    return connection
  }
  catch (error) {
    // console.error(`Error querying database: ${error.stack}`)
    connection.release()
    throw error
  }
}

export async function changeDatabaseApiKey(key: string) {
  if (!key)
    return false
  const sqlExist = `SELECT COUNT(*) AS count FROM GPTAiKey WHERE aikey = '${key}'`
  const connection: PoolConnection = await updatCurrentKey()
  try {
    const [result] = await connection.query(sqlExist)
    const count = (result[0] as any).count
    const date = await getTodayDate()
    if (count > 0) {
      const sqlUpdate = `UPDATE GPTAiKey SET begindate = '${date}' WHERE aikey = '${key}'`
      await connection.query(sqlUpdate)
    }
    else {
      const sqlInsert = `INSERT INTO GPTAiKey (aikey, begindate) VALUES ('${key}', '${date}')`
      await connection.query(sqlInsert)
    }
    return true
  }
  catch (error) {
    // console.error(`Error querying database: ${error.stack}`)
    // throw error
    return false
  }
  finally {
    connection.release()
  }
}

// 管理员修改密码
export async function changeAdminPassword(username: string, password: string, newpw: string) {
  const sql = 'SELECT * FROM GPTAdmin where username = ?'
  let connection: PoolConnection
  try {
    connection = await pool.getConnection()
    const [results] = await connection.query(sql, [username])
    const [user] = results as UserInfo[]
    if (user && user.password === password) {
      const updateSql = `update GPTAdmin set password = '${newpw}' where username ='${username}'`
      await connection.query(updateSql)
      return true
    }

    return false
  }
  catch (error) {
    // console.error(`Error querying database: ${error.stack}`)
    // throw error
    return false
  }
  finally {
    connection.release()
  }
}

// 用户验证
export async function verifyUser(username: string, password: string) {
  const sql = 'SELECT * FROM GPTUserInfo where username = ?'
  let connection: PoolConnection
  try {
    connection = await pool.getConnection()
    const [results] = await connection.query(sql, [username])
    const [user] = results as UserInfo[]
    if (user && user.password === password)
      return true

    return false
  }
  catch (error) {
    // console.error(`Error querying database: ${error.stack}`)
    // throw error
    return false
  }
  finally {
    connection.release()
  }
}

export async function userScanLoginWithOpenId(openId: string) {
  const querySql = `SELECT * FROM GPTUserInfo where openid = '${openId}'`
  let connection: PoolConnection
  try {
    if (!openId)
      throw new Error('用户不合法')
    connection = await pool.getConnection()
    const [results] = await connection.query(querySql)
    const [user] = results as UserInfo[]
    const date = await getTodayDate()
    if (!user) {
      // 插入一条数据
      // 生成随机用户名和密码
      const usernamePrefix = 'user_'
      const passwordLength = 9
      const username = `${usernamePrefix + randomString(10)}_${formatDate(new Date())}`
      const password = randomString(passwordLength)
      const insertSql = 'INSERT INTO GPTUserInfo (username, password, openid, lastlogin, createtime) VALUES (?, ?, ?, ?, ?)'
      await connection.query(insertSql, [username, password, openId, date, date])
      return { username }
    }
    return user
  }
  finally {
    connection.release()
  }
}

export async function getUserInfo(username: string) {
  const sql = 'SELECT * FROM GPTUserInfo where username = ?'
  let connection: PoolConnection
  try {
    connection = await pool.getConnection()
    const [results] = await connection.query(sql, [username])
    const [user] = results as UserInfo[]
    if (user)
      return user as UserInfo

    return null
  }
  catch (error) {
    // console.error(`Error querying database: ${error.stack}`)
    // throw error
    return null
  }
  finally {
    connection.release()
  }
}

export async function registerUser(username: string, password: string) {
  const sql = 'INSERT INTO GPTUserInfo (username, password) VALUES (?, ?)'
  let connection: PoolConnection

  try {
    connection = await pool.getConnection()
    await connection.query(sql, [username, password])

    return true
  }
  catch (error) {
    // console.error(`Error querying database: ${error.stack}`)
    // throw error
    return false
  }
  finally {
    connection.release()
  }
}

function validateUsername(username: string) {
  const regex = /^[a-zA-Z0-9_]{6,20}$/ // 匹配包含字母、数字和下划线的6-20个字符
  return regex.test(username)
}

function validatePassword(password: string) {
  const regex = /^[a-zA-Z0-9!@#\$%\^\&*\)\(+=._-]{8,16}$/ // 匹配包含数字、字母和特殊符号的8-16个字符
  return regex.test(password)
}

export async function validateUser(username: string, password: string) {
  if (validateUsername(username) && validatePassword(password))
    return true

  return false
}

// export function handleSqlError()
