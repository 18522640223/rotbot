自动构建群发机器人

1、在企业微信群中创建机器人

2、在 config.js 中配置邮箱账号、密码，api.js中添加企业微信 webhook 地址

3、在 gitlab 项目中 设置>集成>Pipelines emails>Recipients 中添加 2 中的邮箱账号

4、找一台公网服务器（要访问 wx 服务）运行 app.js，建议使用 pm2

5、执行完毕后删除 config.js 中的邮箱账号、密码（防止密码泄露） 
