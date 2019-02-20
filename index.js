const { GraphQLServer } = require('graphql-yoga')
const { rule, shield, and, or, not } = require('graphql-shield')

const typeDefs = `
  type Query {
    frontPage: [Fruit!]!
    fruits: [Fruit!]!
    customers: [Customer!]!
  }

  type Mutation {
    addFruitToBasket: Boolean!
  }

  type Fruit {
    name: String!
    count: Int!
  }

  type Customer {
    id: ID!
    basket: [Fruit!]!
  }
`

const resolvers = {
  Query: {
    frontPage: () => [
      { name: 'orange', count: 10 },
      { name: 'apple', count: 1 },
    ],
    fruits: () => [
      { name: 'potato', count: 10 },
      { name: 'lemon', count: 1 },
    ],
  },
}

// Auth

const users = {
  mathew: {
    id: 1,
    name: 'Mathew',
    role: 'admin',
  },
  george: {
    id: 2,
    name: 'George',
    role: 'editor',
  },
  johnny: {
    id: 3,
    name: 'Johnny',
    role: 'customer',
  },
}

function getUser(req) {
  const auth = req.get('Authorization')
  if (users[auth]) {
    return users[auth]
  } else {
    return null
  }
}

// Rules

const isAuthenticated = rule()(async (parent, args, ctx, info) => {
  return ctx.user !== null
})

const isAdmin = rule()(async (parent, args, ctx, info) => {
  return ctx.user.role === 'admin'
})

const isEditor = rule()(async (parent, args, ctx, info) => {
  return ctx.user.role === 'editor'
})

const isgood = rule()(async (parent, args, ctx, info) => {
  console.log("hi");
  return false
})

const test = false;

// Permissions

const permissions = shield({
  Query: {
    frontPage: not(isAuthenticated),
    fruits: isgood,
    customers: and(isAuthenticated, isAdmin),
  },
  Mutation: {
    addFruitToBasket: isAuthenticated,
  },
  Fruit: isAuthenticated,
  Customer: isAdmin
})

const server = new GraphQLServer({
  typeDefs,
  resolvers,
  middlewares: [permissions],
  context: req => ({
    ...req,
    // user: getUser(req),
  }),
})

server.start(({port}) => console.log(`Server is running on http://localhost:${ port }`))
