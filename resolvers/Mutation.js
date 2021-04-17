const { authorizeWithGithub } = require("../lib")

module.exports = {
  async postPhoto(parent, args, { db, currentUser }) {

    if(!currentUser){
      throw new Error('エラー：ログインしていない')
    }

    const newPhoto = {
      ...args.input,
      userID: currentUser.githubLogin,
      cureated: new Date()
    }

    const { insertedIds } = await db.collection('photos').insert(newPhoto)
    newPhoto.id = insertedIds[0]
    return newPhoto
  },

  async githubAuth( parent, {code}, {db} ) {
    console.log('----->')
    // 1. Githubからデータを取得する
    let {
      message,
      access_token,
      avatar_url,
      login,
      name
    } = await authorizeWithGithub({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code
    })
    console.log('---> message')
    console.table(message)
    console.table(access_token)
    console.table(avatar_url)
    console.table(login)
    console.table(name)

    // 2. メッセージがあれば何かしらのエラーが発生している
    if(message) {
      throw new Error(message)
    }
    console.log('---> throw new Error(message)')

    // 3. データーを一つのオブジェクトにまとめる
    let latestUserInfo = {
      name,
      githubLogin: login,
      githubToken: access_token,
      avatar: avatar_url
    }
    console.log('---> latestUserInfo')
    console.table(latestUserInfo)

    // 4. 新しい情報もとにレコードを追加したり更新したりする
    const { ops:[user] } = await db
      .collection(`users`)
      .replaceOne({ githubLogin: login }, latestUserInfo, {upsert: true})

    return { user, token: access_token }
  },
}