
/*
 * @:请求机器人并发送获取邮件的消息
 * @:text，markdown 默认markdown
 * 
 * */
const axios = require('axios')
const ERR_OK = 200
async function robotHook(CONFIG) {
  const METHOD = 'POST'
  const ROBOT_KEY = ''
  const ROBOT_URL = `url?${ROBOT_KEY}`
  const params = {
    url: ROBOT_URL,
    method: METHOD,
    data: CONFIG,
    timeout: 100000
  }
  axios(params).then((res) => {
    if(res.status === ERR_OK) {
      console.log('success-cb:', res.data)
    }else {
      console.log('error-cb:', res.data)
    }
  }).catch(err => {
    console.log(err)
  })
}

module.exports = robotHook