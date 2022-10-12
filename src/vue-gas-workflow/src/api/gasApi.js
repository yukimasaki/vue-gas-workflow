import axios from 'axios'

// 共通のヘッダーを設定したaxiosのインスタンス作成
const gasApi = axios.create({
  headers: { 'content-type': 'application/x-www-form-urlencoded' }
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
 * APIのURLを設定します
 * @param {String} url
 */
const setUrl = url => {
  gasApi.defaults.baseURL = url
}

/**
 * authTokenを設定します
 * @param {String} token
 */
let authToken = ''
const setAuthToken = token => {
  authToken = token
}

/**
 * 指定年月のデータを取得します
 * @param {String} yearMonth
 * @returns {Promise}
 */
const fetch = () => {
  return gasApi.post('', {
    method: 'GET',
    authToken,
    // ↓ paramsを記述しなくても良いか検証 ↓
    // params: {
    //   yearMonth
    // }
  })
}

/**
 * データを追加します
 * @param {Object} item
 * @returns {Promise}
 */

/**
 * 指定年月&idのデータを削除します
 * @param {String} yearMonth
 * @param {String} id
 * @returns {Promise}
 */

/**
 * データを更新します
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
