const { ApolloServer, PubSub } = require('apollo-server-express')
const express = require('express')
const expressPlayground = require('graphql-playground-middleware-express').default
const { readFileSync } = require('fs')
const { MongoClient } = require('mongodb')
const { createServer } = require('http')

require('dotenv').config()

const typeDefs = readFileSync('./typeDefs.graphql', 'utf-8')
const resolvers = require('./resolvers')

// 1. 非同期関数を用意する
const start = async () => {
  const app = express()
  const MONGO_DB = process.env.DB_HOST

  let db
  try {
    const client = await MongoClient.connect(MONGO_DB, { useUnifiedTopology: true, useNewUrlParser: true })
    db = client.db()
    console.log('db connect!')
  } catch (error) {
    console.log(`
      Mongo DB Host not found!
      please add DB_HOST environment variable to .env file
      exiting...
    `)
    process.exit(1)
  }

  const pubsub = new PubSub()
  console.log('index.js ===========')
  const server = new ApolloServer({
    typeDefs,
    resolvers, 
    context: async({req, connection}) => {
      const githubToken = req ? req.headers.authorization : connection.context.Authorization
      const currentUser = await db.collection('users').findOne({ githubToken })

      console.log(`req.headers.authorization--> ${req.headers.authorization}`)
      console.table(connection)
      // console.log(`connection.collection.authorization--> ${connection.context.authorization}`)
      // console.log(githubToken)
      // console.log('connection ----------')
      // console.table(connection)

      return { db, currentUser, pubsub }
    },
    playground: true,
    introspection: true,
  })
  server.applyMiddleware({ app })

  app.get('/playground', expressPlayground({ endpoint: '/graphql' }))  
  app.get('/', (req, res) => {
    let url = `https://github.com/login/oauth/authorize?client_id=${process.env.CLIENT_ID}&scope=user`
    res.end(`<a href="${url}">Sign In with Github</a>`)
  })

  const httpServer = createServer(app)
  server.installSubscriptionHandlers(httpServer)

  httpServer.listen({ port: 4000 }, () => {
    console.log(`🚀 GraphQL Server running @  http://localhost:4000${server.graphqlPath}`)
    console.log(`🚀 Subscriptions ready at ws://localhost:4000${server.subscriptionsPath}`)
  })
}

start()
