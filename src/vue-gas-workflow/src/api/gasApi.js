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
 * 全データを取得する
 * @returns {Promise}
 */
const fetch = () => {
  return gasApi.post(apiUrl, {
    method: 'GET',
    authToken,
  })
}

/**
 * データを追加する
 * @param {Object} item
 * @returns {Promise}
 */

/**
 * 指定年月&idのデータを削除する
 * @param {String} yearMonth
 * @param {String} id
 * @returns {Promise}
 */

/**
 * データを更新する
 * @param {String} beforeYM
 * @param {Object} item
 * @returns {Promise}
 */

export default {
  setUrl,
  setAuthToken,
  fetch,
  // add,
  // delete: $delete,
  // update
}
