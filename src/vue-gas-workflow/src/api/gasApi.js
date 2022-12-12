import axios from 'axios'

// 共通のヘッダーを設定したaxiosのインスタンス作成
const gasApi = axios.create({
  headers: { 'content-type': 'text/plain' }
})

// response共通処理
// errorが含まれていたらrejectする
gasApi.interceptors.response.use(res => {
  if (res.data.error) {
    return Promise.reject(res.data.error)
  }
  return Promise.resolve(res)
}, err => {
  return Promise.reject(err)
})

/**
 * APIのURLを設定する
 * @param {String} url
 */
let apiUrl = ''
const setUrl = url => {
  apiUrl = url
}

/**
 * authTokenを設定する
 * @param {String} token
 */
let authToken = ''
const setAuthToken = token => {
  authToken = token
}

/**
 * メールを送信する
 * @param {Object} emailConfig
 * @returns {Promise}
 */
 const sendEmail = emailConfig => {
  return gasApi.post(apiUrl, {
    method: 'POST',
    authToken,
    params: {
      emailConfig
    }
  })
}

export default {
  setUrl,
  setAuthToken,
  sendEmail,
}
