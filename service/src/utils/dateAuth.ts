import NTPClient from 'ntp-client'
import moment from 'moment'

// 获取当前时间
async function getCurrentTime() {
  return new Promise((resolve, reject) => {
    NTPClient.getNetworkTime('pool.ntp.org', 123, (err, date) => {
      if (err)
        reject(err)
      else
        resolve(date)
    })
  })
}

// 比较目标时间和当前时间
export async function compareTime(targetTimeStr: string) {
  const targetTime = new Date(Date.UTC(
    Number(targetTimeStr.slice(0, 4)), // 年
    Number(targetTimeStr.slice(5, 7)) - 1, // 月（注意：JavaScript 中的月份从 0 开始，因此需要减去 1）
    Number(targetTimeStr.slice(8, 10)), // 日
  ))
  const currentTime = await getCurrentTime() // 获取当前时间
  if (targetTime < currentTime)
    return true
  else
    return false
}

export async function getTodayDate() {
  return moment().format('YYYY-MM-DD HH:mm:ss')
}
