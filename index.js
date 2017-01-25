import Hapi from 'hapi';
import GraphQL from 'hapi-graphql';
import Schema from './schema';

const server = new Hapi.Server();
server.connection({
  port: +process.env.PORT || 3000
});

server.register({
  register: GraphQL,
  options: {
    query: {
      schema: Schema,
      rootValue: {},
      pretty: false
    },
    route: {
      path: '/graphql',
      config: {}
    }
  }
}, () =>
  server.start(() =>
    console.log('Server running at:', server.info.uri)
  )
);

