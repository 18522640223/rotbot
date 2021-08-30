

const Imap = require('imap')  
const MailParser = require('mailparser').MailParser
const EMAIL_CON = require('./config/email')  // 邮件配置
const robotHook = require('./api/index')  // 调起机器人方法

let delayTime = 10 * 1000 //10s 未连接上，自动重连
let inflag = false
// 创建Email连接
let  imap = new Imap(EMAIL_CON);
// 打开邮箱
async function start() {
  imap.once('ready', async () => {
    console.log('------------已经成功连接服务器--------------')
    setTimeout(() => {
      if(!inflag) {
        console.log(`无法连接收件箱，进行重新连接。`)
        imap.end()
      }
    }, delayTime)
    await openInBox()
  })
}
async function openInBox() {
  imap.openBox('INBOX', false, async () => {
    inflag = true
    console.log('------------打开邮箱--------------')
    imap.on("mail", async() => {
      await search()
    });
    
  })
}
// 搜索的邮件
async function search() {
  imap.search(['NEW', ['TEXT', 'Pipeline']], (err,  results) => {
    console.log('------------搜索邮件--------------')
    if(err) {
      console.log(`当前无邮件${err.message}`)
      return
    }
    try {
      // 判断邮箱是里的邮件是否为空
      if(!results || !results.length ) {
        return
      }
      getEmailContent(results[0])
    } catch(e) {
      console.log(e)
    }
  })
}
async function getEmailContent(results) {
  let f = imap.fetch(results, {bodies: '', markSeen: true }) // 默认邮件是未读状态
  f.on('message', (msg, seqno) => {
    msg.on('body', (stream, info) => {
      let parser = new MailParser();
      stream.pipe(parser); //解析数据流
      parser.on('data', async (data) => {
        if(data.type === 'text') {
          await markdownContent(data.text)
        }
      })
    })
    msg.once('end', ()=> {
    })
  })
  f.once('error', function (err) {
    console.log(`收取邮件报错:${err.message}`)
  });
  f.once('end', function () {
    console.log(`收取邮件结束`)
  });
}
start()

// 设置报警如未打开邮件后导致未接收到消息
function warningRobot() {
  let config = {
    msgtype: 'text',
    text: {
      content: '读取邮件内容失败，请联系管理员'
    }
  }
  robotHook(config)
}
// 处理markDown所需要的格式
async function markdownContent(content) {
  // 组成需要的markdown
  let markdown = ''
  let font = ''
  if(content.includes('passed')) {
    font = `<font color="info">Build成功：</font>`
  }else {
    font = `<font color="warning">Build失败：</font>`
  }  
  // 正则匹配内容 项目
  let projectReg = /(?=Project).*?(?=\()/g
  let project = content.match(projectReg)[0]

  //正则匹配内容 分支
  let branchReg = /(?=Branch).*?(?=\()/g
  let branch = content.match(branchReg)[0]

  // //正则匹配内容 Commit
  let commitReg = /(?=Commit:).*?(?=\()/g
  let commit = content.match(commitReg)[0]

  //正则匹配内容 Commit Message
  let commitMsgReg = /(?=Message).*/g
  let commitMsg = content.match(commitMsgReg)[0]

  //正则匹配内容 Commit Author
  let commitAutReg = /Author/g
  let commitAuthor = content.match(commitAutReg)[0]
  // /正则匹配内容 By
  let byReg = /(?=by).*?(?=\()/g
  let by = content.match(byReg)[0]
  // 组成需要的格式
  markdown = `${font}
  >${project}
  >${branch}
  >${commit}
  >${'Commit ' + commitMsg}
  >${'Commit ' + commitAuthor}: @${by}`

  let config = {
    msgtype: "markdown",
    markdown: {
      content: markdown
    }
  }
  await robotHook(config)
}

imap.once('error', async(err)=> {
  console.log(err)
  await warningRobot()
});

imap.once('end', async ()=> {
  console.log('Connection ended');
  await start()
});

imap.connect();
