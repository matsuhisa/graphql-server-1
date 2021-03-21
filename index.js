const { ApolloServer } = require(`apollo-server`)
const typeDefs = `
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
  }

  type Photo {
    id: ID!
    url: String!
    name: String!
    description: String
    category: PhotoCategory!
    githubUser: String
    postedBy: User!
  }

  input PostPhotoInput {
    name: String!
    category: PhotoCategory=PORTTRIT
    description: String
  }

  type Query {
    totalPhotos: Int!
    allPhotos: [Photo!]!
  }

  type Mutation {
    postPhoto(input: PostPhotoInput): Photo!
  }
`

let _id = 2
const users = [
  { 'githubLogin': 'foo', 'name': 'たんじろう' },
  { 'githubLogin': 'bar', 'name': 'ねづこ' },
]
let photos = [
  {
    'id': 1,
    'name': 'Dropping the Heart Chute 1',
    'description': 'あいうえお',
    'category': 'ACTION',
    'githubUser': 'foo'
  },
  {
    'id': 2,
    'name': 'Dropping the Heart Chute 2',
    'description': 'かきくけこ',
    'category': 'ACTION',
    'githubUser': 'bar'
  },
]

const resolvers = {
  Query: {
    totalPhotos: () => photos.length,
    allPhotos: () => photos
  },

  Mutation: {
    postPhoto( parent, args ) {
      let newPhoto = {
        id: _id++,
        ...args.input
      }
      photos.push(newPhoto)
      return newPhoto
    }
  },
  // ルートに追加されたリゾルバ => トリビアリゾルバ
  Photo: {
    url: parent => `http://yoursite.com/img/${parent.id}.jpg`,
    postedBy: parent => {
      console.log("----------")
      users.forEach(user => console.log(user.githubLogin))
      console.log(parent.githubUser)
      console.log(users.filter( u => u.githubLogin === parent.githubUser))
      console.log("----------")
      return users.find( u => u.githubLogin === parent.githubUser)
    }
  },
  User: {
    postedPhotos: parent => {
      return photos.filter( p => p.githubUser === parent.githubLogin )
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

server.listen().then(({url}) => console.log(`GraphQL Server running on ${url}`))
