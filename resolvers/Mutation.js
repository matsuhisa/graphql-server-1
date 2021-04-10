const { authorizeWithGithub } = require("../lib")

module.exports = {
  postPhoto( parent, args ) {
    let newPhoto = {
      id: _id++,
      ...args.input,
      created: new Date()
    }
    photos.push(newPhoto)
    return newPhoto
  },

  async authorizeWithGithub( parent, {code}, {db} ) {
    let {
      message, access_token, avater_url, lgoin, name
    } = await authorizeWithGithub({
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      code
    })

    // 2. メッセージがあれば何かしらのエラーが発生している
    if(message) {
      throw new Error(message)
    }

    // 3. データーを一つのオブジェクトにまとめる
    let latestuserInfo = {
      name,
      githubLogin: lgoin,
      githubToken: access_token,
      avater: avater_url,
    }

    // 4. 新しい情報もとにレコードを追加したり更新したりする
    const { ops:[user] } = await db
      .collection(`users`)
      .replaceOne({ githubLogin: login }, latestuserInfo, {upsert: true})

    return { user, token: access_token }
  }
}