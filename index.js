const { ApolloServer } = require('apollo-server-express')
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

  const server = new ApolloServer({ typeDefs, resolvers, context: async({req}) =>{
    const githubToken = req.headers.authorization
    const currentUser = await db.collection('users').findOne({ githubToken })
    return { db, currentUser };
  } })
  server.applyMiddleware({ app })

  app.get('/playground', expressPlayground({ endpoint: '/graphql' }))  
  app.get('/', (req, res) => {
    let url = `https://github.com/login/oauth/authorize?client_id=${process.env.CLIENT_ID}&scope=user`
    res.end(`<a href="${url}">Sign In with Github</a>`)
  })

  const httpServer = createServer(app)
  server.installSubscriptionHandlers(httpServer)

  httpServer.listen({ port: 4000 }, () => {
    console.log(`GraphQL Server running @  http://localhost:4000${server.graphqlPath}`)
  })
}

start()
