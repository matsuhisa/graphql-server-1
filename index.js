const { ApolloServer } = require('apollo-server-express')
const express = require('express')
const expressPlayground = require('graphql-playground-middleware-express').default
const { readFileSync } = require('fs')

const typeDefs = readFileSync('./typeDefs.graphql', 'utf-8')
const resolvers = require('./resolvers')

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

let app = express()
const server = new ApolloServer({ typeDefs, resolvers })
server.applyMiddleware({ app })

app.get('/', (req, res) => res.end(`Welocome to PhotoShare API`))
app.get('/playground', expressPlayground({ endpoint: '/graphql' }))

app.listen({ port: 4000 }, () => {
  console.log(`GraphQL Server running @  http://localhost:4000${server.graphqlPath}`)
})