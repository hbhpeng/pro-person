import { error } from 'console'
import type { PoolConnection } from 'mysql2/promise'
import mysql from 'mysql2/promise'
import { getTodayDate } from './dateAuth'

const pool = mysql.createPool({
  host: 'mysql',
  // host: 'localhost',
  port: 3306,
  user: 'houp',
  password: '624634',
  database: 'GPTDatabase',
  connectionLimit: 100,
})

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

export interface UserOrderInfo {
  id: number
  username: string
  productid: number
  orderid: string
  createtime: string
  orderstate: number
  openid: string
  orderprice?: number
  ordertype: number
}

export interface OrderProductInfo {
  id: number
  name: string
  wordnum: number
  originprice: number
  nowprice: number
  description: string
  reserve: string
  needvip: number
}

interface AdminInfo {
  userid: number
  username: string
  password: string
}

export enum OrderStatus {
  Pending = 0, // 待支付
  Paid = 1, // 已支付
  Refunded = 2, // 已退款
  Cancelled = 3, // 已取消
}

const supportVipOption = ['周会员', '月会员', '季会员', '年会员']

// 缓存数据接口
interface VisitCache {
  visits: number
  uniqueVisitors: Set<string>
}

export const visitCache: VisitCache = {
  visits: 0,
  uniqueVisitors: new Set(),
}

// 每分钟将缓存写入数据库
setInterval(() => {
  // 将缓存写入到数据库中
  writeCacheToDatabase(visitCache)

  // 清空缓存
  visitCache.visits = 0
  visitCache.uniqueVisitors.clear()
}, 60000 * 30)

async function writeCacheToDatabase(cache: VisitCache) {
  if (visitCache.visits <= 0 && visitCache.uniqueVisitors.size <= 0)
    return
  const insertSql = `INSERT INTO GPTVisitStatic (visits_count, unique_visits) VALUES (${cache.visits}, ${cache.uniqueVisitors.size})`
  let connection: PoolConnection
  try {
    connection = await pool.getConnection()
    await connection.query(insertSql)
  }
  catch (error) {
    console.error(`Error querying database: ${error.stack}`)
  }
  finally {
    connection.release()
  }
}

export async function getTotalVisits() {
  let querySql = 'SELECT SUM(visits_count) AS total_visits FROM GPTVisitStatic'
  let connection: PoolConnection
  try {
    connection = await pool.getConnection()
    const [total_result] = await connection.query(querySql)
    querySql = `
      SELECT HOUR(created_at) AS hour, SUM(visits_count) AS count
      FROM GPTVisitStatic WHERE DATE(created_at) = CURDATE() GROUP BY HOUR(created_at)`
    const [hour_result] = await connection.query(querySql)
    querySql = `
      SELECT MONTH(created_at) AS month, SUM(visits_count) AS count
      FROM GPTVisitStatic WHERE YEAR(created_at) = YEAR(CURDATE()) GROUP BY MONTH(created_at)`
    const [month_result] = await connection.query(querySql)
    return { total_result: total_result[0], hour_result, month_result }
  }
  catch (error) {
    console.error(`Error querying database: ${error.stack}`)
  }
  finally {
    connection.release()
  }
}

export async function getAllOrderStatis() {
  let querySql = 'SELECT COUNT(DISTINCT id) AS total_order, SUM(orderprice) AS total_money FROM GPTUserOrderInfo WHERE orderstate = 1'
  let connection: PoolConnection
  try {
    connection = await pool.getConnection()
    const [total_result] = await connection.query(querySql)
    querySql = `SELECT COUNT(DISTINCT id) AS weak_order, SUM(orderprice) AS weak_money FROM GPTUserOrderInfo WHERE
createtime BETWEEN DATE_SUB(NOW(), INTERVAL 7 DAY) AND NOW() AND orderstate = 1`
    const [weak_result] = await connection.query(querySql)
    return { total_result: total_result[0], weak_result: weak_result[0] }
  }
  catch (error) {
    console.error(`Error querying database: ${error.stack}`)
  }
  finally {
    connection.release()
  }
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
      sql = 'insert into GPTUserInfo(`username`, `usagecount`, `usecount`, `password`, `vipendday`) values(?, ?, ?, ?, ?)'
      await connection.execute(sql, [userinfo.username, userinfo.usagecount, userinfo.usecount, userinfo.password, userinfo.vipendday])
    }
    else {
      // 更新
      sql = 'update GPTUserInfo set username=?, usagecount=?, usecount=?, password=?, vipendday=? where userid=?'
      await connection.execute(sql, [userinfo.username, userinfo.usagecount, userinfo.usecount, userinfo.password, userinfo.vipendday, userinfo.userid])
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
  finally {
    connection.release()
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
      return user

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

export async function userScanLoginWithOpenId(openId: string, username?: string) {
  let querySql: string
  if (username)
    querySql = `SELECT * FROM GPTUserInfo where username = '${username}'`
  else
    querySql = `SELECT * FROM GPTUserInfo where openid = '${openId}'`
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
    else if (user.openid !== openId && username) {
      const queryopenId = 'SELECT * FROM GPTUserInfo where openid = ? LIMIT 1'
      const [results] = await connection.query(queryopenId, openId)
      const [user] = results as UserInfo[]
      if (user)
        throw new Error('用户已有账号')

      // 之前没注册过就绑定账号
      const updateSql = `UPDATE GPTUserInfo SET openid = '${openId}' WHERE username = '${username}'`
      await connection.query(updateSql)
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

// 订单相关
export async function createAnOrderInfo(username: string,
  openid: string,
  productid: string,
  orderid: string,
) {
  const sql = 'INSERT INTO GPTUserOrderInfo (username, openid, productid, createtime, orderid) VALUES (?, ?, ?, ?, ?)'
  let connection: PoolConnection

  try {
    connection = await pool.getConnection()
    const date = await getTodayDate()
    await connection.query(sql, [username, openid, productid, date, orderid])
  }
  finally {
    connection.release()
  }
}
// orderid 必填  username和openid选填一个
export async function getUserOrderInfoByOrderid(orderid: string, openid: string, username: string) {
  let queryId = username
  let querySql = 'SELECT * FROM GPTUserOrderInfo where username = ? and orderid = ?'
  if (openid) {
    querySql = 'SELECT * FROM GPTUserOrderInfo where openid = ? and orderid = ?'
    queryId = openid
  }
  let connection: PoolConnection
  try {
    connection = await pool.getConnection()
    const [results] = await connection.query(querySql, [queryId, orderid])
    const [orderInfo] = results as UserOrderInfo[]
    if (orderInfo)
      return orderInfo as UserOrderInfo
    return null
  }
  catch {
    return null
  }
  finally {
    connection.release()
  }
}

export async function updateUserOrderInfoByOrderId(username: string, openid: string, orderid: string, orderstate: OrderStatus) {
  let queryId = openid
  let updateSql = 'update GPTUserOrderInfo set orderstate=? where openid=? and orderid=?'
  if (username) {
    queryId = username
    updateSql = 'update GPTUserOrderInfo set orderstate=? where username=? and orderid=?'
  }

  let connection: PoolConnection
  try {
    connection = await pool.getConnection()
    const orderinfo = await getUserOrderInfoByOrderid(orderid, openid, '')

    if (orderinfo.orderstate !== orderstate) {
      // 更新订单表
      await connection.query(updateSql, [orderstate, queryId, orderid])
      if (orderstate === OrderStatus.Paid) {
        // 根据prodcutid去表里查是什么产品
        const productInfo: OrderProductInfo = await getProductInfoByProductId(orderinfo.productid)
        // 判断是不是会员产品
        // 构造sql 执行更新
        let updateSql: string
        let interval
        if (productInfo.name === supportVipOption[0]) {
          interval = '7 DAY'
          updateSql = 'UPDATE GPTUserInfo SET vipendday=IF(COALESCE(vipendday, \'1970-01-01\') < CURRENT_DATE(), DATE_ADD(CURRENT_TIMESTAMP(), INTERVAL 7 DAY), DATE_ADD(vipendday, INTERVAL 7 DAY)), usagecount=usagecount+? WHERE openid=?'
        }
        else if (productInfo.name === supportVipOption[1]) {
          interval = '1 MONTH'
          updateSql = 'UPDATE GPTUserInfo SET vipendday=IF(COALESCE(vipendday, \'1970-01-01\') < CURRENT_DATE(), DATE_ADD(CURRENT_TIMESTAMP(), INTERVAL 1 MONTH), DATE_ADD(vipendday, INTERVAL 1 MONTH)), usagecount=usagecount+? WHERE openid=?'
        }
        else if (productInfo.name === supportVipOption[2]) {
          interval = '1 QUARTER'
          updateSql = 'UPDATE GPTUserInfo SET vipendday=IF(COALESCE(vipendday, \'1970-01-01\') < CURRENT_DATE(), DATE_ADD(CURRENT_TIMESTAMP(), INTERVAL 1 QUARTER), DATE_ADD(vipendday, INTERVAL 1 QUARTER)), usagecount=usagecount+? WHERE openid=?'
        }
        else if (productInfo.name === supportVipOption[3]) {
          interval = '1 YEAR'
          updateSql = 'UPDATE GPTUserInfo SET vipendday=IF(COALESCE(vipendday, \'1970-01-01\') < CURRENT_DATE(), DATE_ADD(CURRENT_TIMESTAMP(), INTERVAL 1 YEAR), DATE_ADD(vipendday, INTERVAL 1 YEAR)), usagecount=usagecount+? WHERE openid=?'
        }

        if (interval !== '-1') {
          await connection.query(updateSql, [productInfo.wordnum, openid])
        }
        else {
          updateSql = 'update GPTUserInfo set usagecount = usagecount + ?, isVip = ? where openid=?'
          await connection.query(updateSql, [productInfo.wordnum, productInfo.needvip, openid])
        }
      }
    }
  }
  catch (error) {

  }
  finally {
    connection.release()
  }
}

export async function deleteAllUserOrderUncomplete(openid: string, username: string) {
  if (!username && !openid)
    return
  let queryId = username
  let deletesql = 'DELETE FROM GPTUserOrderInfo WHERE orderstate != 1 AND username = ?'
  if (openid) {
    deletesql = 'DELETE FROM GPTUserOrderInfo WHERE orderstate != 1 AND openid = ?'
    queryId = openid
  }
  let connection: PoolConnection
  try {
    connection = await pool.getConnection()
    await connection.query(deletesql, [queryId])
  }
  catch {

  }
  finally {
    connection.release()
  }
}

// 产品相关
export async function addAProductInfo(product: OrderProductInfo) {
  let connection: PoolConnection
  let params: any[]
  try {
    connection = await pool.getConnection()
    let sql: string
    if (!product.id || product.id < 0) {
      // 插入
      sql = `INSERT INTO GPTProductInfo (name, wordnum, originprice, nowprice, description, reserve, needvip)
VALUES (?, ?, ?, ?, ?, ?, ?)`
      params = [product.name, product.wordnum, product.originprice, product.nowprice,
        product.description, product.reserve, product.needvip]
    }
    else {
      // 更新
      sql = `UPDATE GPTProductInfo SET name=?, wordnum=?, originprice=?, nowprice=?,
description=?, reserve=?, needvip=? WHERE id=?`
      params = [product.name, product.wordnum, product.originprice, product.nowprice,
        product.description, product.reserve, product.needvip, product.id]
    }
    await connection.query(sql, params)
  }
  finally {
    connection.release()
  }
}

export async function removeAProductInfo(productid: number) {
  let connection: PoolConnection
  try {
    connection = await pool.getConnection()
    const sql = 'DELETE FROM GPTProductInfo WHERE id=?'
    await connection.query(sql, [productid])
  }
  finally {
    connection.release()
  }
}

export async function queryAllProductInfo() {
  let connection: PoolConnection
  try {
    connection = await pool.getConnection()
    const sql = 'SELECT * FROM GPTProductInfo'
    const [results] = await connection.query(sql)
    const resultData = results as OrderProductInfo[]
    return resultData
  }
  finally {
    connection.release()
  }
}

// productid 必填
export async function getProductInfoByProductId(productid: number) {
  const querySql = 'SELECT * FROM GPTProductInfo where id = ?'

  let connection: PoolConnection
  try {
    connection = await pool.getConnection()
    const [results] = await connection.query(querySql, [productid])
    const [productInfo] = results as OrderProductInfo[]
    if (productInfo)
      return productInfo as OrderProductInfo
    return null
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
