const { GraphQLServer } = require('graphql-yoga')

const typeDefs = `
  type Query {
    open: String!
    secured: String!
    me: Me!
  }

  type Me {
    name: String!
    surname: String!
    age: Int!
  }
`

const resolvers = {
  Query: {
    open: () => `Open data, everyone's welcome!`,
    secured: () => `Personal diary - this is for my eyes only!`,
    me: () => ({}),
  },
  Me: {
    name: () => 'Ben',
    surname: () => 'Cool',
    age: () => 18,
  },
}

// Middleware - Permissions

const code = 'supersecret'
const isLoggedIn = async (resolve, parent, args, ctx, info) => {
  // Include your agent code as Authorization: <token> header.
  const permit = ctx.request.get('Authorization') === code

  if (!permit) {
    throw new Error(`Not authorised!`)
  }

  return resolve()
}

const permissions = {
  Query: {
    secured: isLoggedIn,
  },
  Me: isLoggedIn,
}

// Server

const server = new GraphQLServer({
  typeDefs,
  resolvers,
  context: req => ({ ...req }),
  middleware: [permissions],
})

server.start(() => console.log('Server is running on http://localhost:4000'))


// import { GraphQLServer } from 'graphql-yoga'
// import { rule, shield, and, or, not } from 'graphql-shield'
//
// const typeDefs = `
//   type Query {
//     frontPage: [Fruit!]!
//     fruits: [Fruit!]!
//     customers: [Customer!]!
//   }
//
//   type Mutation {
//     addFruitToBasket: Boolean!
//   }
//
//   type Fruit {
//     name: String!
//     count: Int!
//   }
//
//   type Customer {
//     id: ID!
//     basket: [Fruit!]!
//   }
// `
//
// const resolvers = {
//   Query: {
//     frontPage: () => [
//       { name: 'orange', count: 10 },
//       { name: 'apple', count: 1 },
//     ],
//   },
// }
//
// // Auth
//
// const users = {
//   mathew: {
//     id: 1,
//     name: 'Mathew',
//     role: 'admin',
//   },
//   george: {
//     id: 2,
//     name: 'George',
//     role: 'editor',
//   },
//   johnny: {
//     id: 3,
//     name: 'Johnny',
//     role: 'customer',
//   },
// }
//
// function getUser(req) {
//   const auth = req.get('Authorization')
//   if (users[auth]) {
//     return users[auth]
//   } else {
//     return null
//   }
// }
//
// // Rules
//
// const isAuthenticated = rule()(async (parent, args, ctx, info) => {
//   return ctx.user !== null
// })
//
// const isAdmin = rule()(async (parent, args, ctx, info) => {
//   return ctx.user.role === 'admin'
// })
//
// const isEditor = rule()(async (parent, args, ctx, info) => {
//   return ctx.user.role === 'editor'
// })
//
// // Permissions
//
// const permissions = shield({
//   Query: {
//     frontPage: not(isAuthenticated),
//     fruits: and(isAuthenticated, or(isAdmin, isEditor)),
//     customers: and(isAuthenticated, isAdmin),
//   },
//   Mutation: {
//     addFruitToBasket: isAuthenticated,
//   },
//   Fruit: isAuthenticated,
//   Customer: isAdmin,
// })
//
// const server = new GraphQLServer({
//   typeDefs,
//   resolvers,
//   middlewares: [permissions],
//   context: req => ({
//     ...req,
//     user: getUser(req),
//   }),
// })
//
// server.start(() => console.log('Server is running on http://localhost:4000'))
