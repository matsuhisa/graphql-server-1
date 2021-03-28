const { ApolloServer } = require(`apollo-server`)
const { GraphQLScalarType } = require('graphql')

const typeDefs = `
scalar DateTime
enum PhotoCategory {
    SELFIE
    PORTTRIT
    ACTION
    LANDSCAPE
    GRAPHIC
  }

  type User {
    githubLogin: ID!
    name: String
    avatar: String
    postedPhotos: [Photo!]!
    inPhotos: [Photo!]!
  }

  type Photo {
    id: ID!
    url: String!
    name: String!
    description: String
    category: PhotoCategory!
    githubUser: String
    postedBy: User!
    taggedUsers: [User!]!
    created: DateTime!
  }

  input PostPhotoInput {
    name: String!
    category: PhotoCategory=PORTTRIT
    description: String
  }

  type Query {
    totalPhotos: Int!
    allPhotos: [Photo!]!
    allUsers: [User!]!
  }

  type Mutation {
    postPhoto(input: PostPhotoInput): Photo!
  }
`

let _id = 2
const users = [
  { 'githubLogin': 'foo', 'name': 'たんじろう' },
  { 'githubLogin': 'bar', 'name': 'ねづこ' },
  { 'githubLogin': 'kaminari', 'name': 'ぜんじろう' },
]
let photos = [
  {
    'id': 1,
    'name': 'Dropping the Heart Chute 1',
    'description': 'あいうえお',
    'category': 'ACTION',
    'githubUser': 'foo',
    'created': '3-19-1998',
  },
  {
    'id': 2,
    'name': 'Dropping the Heart Chute 2',
    'description': 'かきくけこ',
    'category': 'ACTION',
    'githubUser': 'bar',
    'created': '3-19-2008',
  },
  {
    'id': 3,
    'name': 'Dropping the Heart Chute 3',
    'description': 'さしすせそ',
    'category': 'ACTION',
    'githubUser': 'kaminari',
    'created': '3-19-2018',
  },
  {
    'id': 4,
    'name': 'Dropping the Heart Chute 4',
    'description': 'たちつてと',
    'category': 'ACTION',
    'githubUser': 'kaminari',
    'created': '3-19-2028',
  },
]
let tags = [
  { 'PhotoID': '1', 'UserId': 'foo' },
  { 'PhotoID': '2', 'UserId': 'foo' },
  { 'PhotoID': '2', 'UserId': 'bar' },
]

const resolvers = {
  Query: {
    totalPhotos: () => photos.length,
    allPhotos: () => photos,
    allUsers: () => users
  },

  Mutation: {
    postPhoto( parent, args ) {
      let newPhoto = {
        id: _id++,
        ...args.input,
        created: new Date()
      }
      photos.push(newPhoto)
      return newPhoto
    }
  },
  // ルートに追加されたリゾルバ => トリビアリゾルバ
  Photo: {
    url: parent => `http://yoursite.com/img/${parent.id}.jpg`,
    postedBy: parent => {
      users.forEach(user => console.log(user.githubLogin))
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

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

server.listen().then(({url}) => console.log(`GraphQL Server running on ${url}`))
