import axios from 'axios'

const http = axios.create({
  baseURL: 'http://usa1y.studentgpt.top',
})

const timeout = 20000

export const proxyRequestMethod = async (method: string, path: string, req, res) => {
  try {
    if (method === 'get') {
      const response = await http.get(path, { params: req.query, headers: req.headers, timeout })
      res.send(response.data)
      // console.log('===request get====')
      // console.log(response.data)
    }
    else {
      delete req.headers['content-length']
      const response = await http.post(path, req.body, { headers: req.headers, timeout })
      res.send(response.data)
      // console.log('===request post====')
      // console.log(response.data)
    }
  }
  catch (error: any) {
    res.write(JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
  }
  finally {
    res.end()
  }
}

export const forwardRequestMethod = async (url: string, method: string, req, res) => {
  try {
    delete req.headers['content-length']
    delete req.headers.Host
    delete req.headers.host
    if (method === 'get')
      await axios.get(url, { params: req.query, headers: req.headers })

    else
      await axios.post(url, req.rawBody, { headers: req.headers })
  }
  catch (error: any) {

  }
}

export const shouldProxyRequest = async () => {
  if (!process.env.YUAN_YUAN_IS_FENXIAO)
    return false

  return true
}

export const syncSalerUserInfo = async (userInfo: any, salerInfo: any) => {
  // baseurl
  // only try
  try {
    await axios.post(`${salerInfo.baseurl}/saler/syncuser`, userInfo, { timeout })
  }
  catch {
    // do nothing
  }
}

export const requestTopLevelUserToSync = async (usertoken) => {
  const response = await http.post('/api/user/getuserinfo', {}, { headers: { usertoken }, timeout })
  if (response.data.status === 'Success')
    return JSON.parse(response.data.data)
}
