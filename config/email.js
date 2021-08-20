/*
 * @:获取邮箱的邮件内容
 * @:text
 * 
 * */
const EMAIL_CON = {
  user: 'email', // 你邮箱的地址
  password: 'password', // 你邮箱的密码
  host: 'partner.outlook.cn', // 邮箱服务器主机地址
  port: 993, // 邮箱服务器端口地址
  tls: true, // 使用安全传输协议
  tlsOptions: { rejectUnauthorized: false } // 禁用对证书有效性的检查
}

module.exports = EMAIL_CON