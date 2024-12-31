import { ApolloServer } from "apollo-server-express";
import typeDefs from "./typeDefs.js";
import resolvers from "./resolvers.js";
import jwt from 'jsonwebtoken'
import express from 'express'

import { WebSocketServer } from 'ws'; 
import { useServer } from 'graphql-ws/lib/use/ws';
import { makeExecutableSchema } from "@graphql-tools/schema";
const port = process.env.PORT || 4000

const app = express();

const context = ({ req }) => {
    const { authorization } = req.headers;
    if (authorization) {
        const { userId } = jwt.verify(authorization, process.env.JWT_SECRET);
        return { userId }
    }
}
const schema = makeExecutableSchema({typeDefs,resolvers})

const apolloServer = new ApolloServer({
    schema, 
    context,
    subscriptions: {
        path: '/graphql',
      },
})
await apolloServer.start()
apolloServer.applyMiddleware({app, path:"/graphql"});

const server = app.listen(port,()=>{
    const wsServer = new WebSocketServer({
        server,
        path: '/graphql',
      });
       
      useServer({ schema }, wsServer);
      console.log("Apollo and Subscription server is up");
      
})



// const server = new ApolloServer({
//     typeDefs,
//     resolvers,
//     context: ({ req }) => {
//         const { authorization } = req.headers;
//         if (authorization) {
//             const { userId } = jwt.verify(authorization, process.env.JWT_SECRET);
//             return { userId }
//         }
//     }
// });

// server.listen().then(({ url }) => {
//     console.log(`🚀 Server ready at ${url}`);
// })