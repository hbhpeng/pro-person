import { error } from 'console'
import mysql from 'mysql2/promise'

export interface UserInfo {
  userid?: number
  username: string
  password: string
  usagecount: number
  usecount: number
  usageword: number
  useword: number
}

interface AdminInfo {
  userid: number
  username: string
  password: string
}

const pool = mysql.createPool({
  host: 'mysql',
  // host: 'localhost',
  port: 3306,
  user: 'houp',
  password: '624634',
  database: 'GPTDatabase',
  connectionLimit: 10,
})

export async function getUserInfoPage(page: number, pageSize: number): Promise<UserInfo[]> {
  const offset = (page - 1) * pageSize
  const sql = 'SELECT * FROM GPTUserInfo LIMIT ?, ?'

  try {
    const connection = await pool.getConnection()
    const [results] = await connection.query(sql, [offset, pageSize])
    connection.release()
    return results as UserInfo[]
  }
  catch (error) {
    console.error(`Error querying database: ${error.stack}`)
    throw error
  }
}

export async function addOrUpdateUserInfo(userinfo: UserInfo) {
  try {
    const connection = await pool.getConnection()
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
    connection.release()
    return { status: 'success' }
  }
  catch (error) {
    // console.log(error)
    // console.error(`Error querying database: ${error.stack}`)
    // throw error
    return { status: 'fail', error }
  }
}

export async function removeUserInfo(userinfo: UserInfo) {
  const sql = 'delete from GPTUserInfo where userid = ?'
  try {
    if (!userinfo.userid)
      throw error('需要用户id')

    const connection = await pool.getConnection()
    await connection.query(sql, [userinfo.userid])
    return { status: 'success' }
  }
  catch (error) {
    // console.error(`Error querying database: ${error.stack}`)
    // throw error
    return { status: 'fail', error }
  }
}

// 管理员验证
export async function verifyAdmin(username: string, password: string) {
  const sql = 'SELECT * FROM GPTAdmin where username = ?'

  try {
    const connection = await pool.getConnection()
    const [results] = await connection.query(sql, [username])
    const [admin] = results as AdminInfo[]
    if (admin && admin.password === password)
      return true

    connection.release()
    return false
  }
  catch (error) {
    // console.error(`Error querying database: ${error.stack}`)
    // throw error
    return false
  }
}

// 用户验证
export async function verifyUser(username: string, password: string) {
  const sql = 'SELECT * FROM GPTUserInfo where username = ?'

  try {
    const connection = await pool.getConnection()
    const [results] = await connection.query(sql, [username])
    const [user] = results as UserInfo[]
    if (user && user.password === password)
      return true

    connection.release()
    return false
  }
  catch (error) {
    // console.error(`Error querying database: ${error.stack}`)
    // throw error
    return false
  }
}

export async function getUserInfo(username: string) {
  const sql = 'SELECT * FROM GPTUserInfo where username = ?'

  try {
    const connection = await pool.getConnection()
    const [results] = await connection.query(sql, [username])
    const [user] = results as UserInfo[]
    if (user)
      return user as UserInfo

    connection.release()
    return null
  }
  catch (error) {
    // console.error(`Error querying database: ${error.stack}`)
    // throw error
    return null
  }
}

export async function registerUser(username: string, password: string) {
  const sql = 'INSERT INTO GPTUserInfo (username, password) VALUES (?, ?)'

  try {
    const connection = await pool.getConnection()
    await connection.query(sql, [username, password])

    connection.release()
    return true
  }
  catch (error) {
    // console.error(`Error querying database: ${error.stack}`)
    // throw error
    return false
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
