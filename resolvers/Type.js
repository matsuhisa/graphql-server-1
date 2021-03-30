const { GraphQLScalarType } = require('graphql')

module.exports = {
  // ルートに追加されたリゾルバ => トリビアリゾルバ
  Photo: {
    url: parent => `http://yoursite.com/img/${parent.id}.jpg`,
    postedBy: parent => {
      return users.find( u => u.githubLogin === parent.githubUser)
    },
    taggedUsers: parent => tags
                            // 1. 対象の写真が関係しているタグの配列を返す
                            .filter( tag => tag.PhotoID == parent.id )
                            // 2. タグの配列をユーザーIDの配列に変換する
                            .map(tag => tag.UserId)
                            // 3. ユーザーIDの配列をユーザーオブジェクトの配列に変換する
                            .map(userId => users.find(u => u.githubLogin === userId))
  },
  User: {
    postedPhotos: parent => {
      return photos.filter( p => p.githubUser === parent.githubLogin )
    },
    inPhotos: parent => tags
                        // 1.
                        .filter( tag => tag.userId === parent.githubLogin )
                        // 2.
                        .map( tag => tag.PhotoID )
                        // 3.
                        .map( PhotoID => photos.find( p => p.id === PhotoID ) )
  },
  DateTime: new GraphQLScalarType({
    name: 'DateTime',
    description: 'A valid date time value.',
    parseValue: value => new Date(value),
    serialize: value => new Date(value).toISOString(),
    parseLiteral: ast => ast.value
  })
}