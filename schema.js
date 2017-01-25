import ghostDB from './data/_ghosts';
import {getGrimoire as getDestiny} from './destiny';

import {
  GraphQLBoolean,
  GraphQLEnumType,
  GraphQLObjectType,
  GraphQLInterfaceType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLSchema,
  GraphQLString,
  GraphQLInt
} from 'graphql/type';

const clone = d => JSON.parse(JSON.stringify(d));

const computeFoundGhosts = (ghosts, cards) => {
  let g = clone(ghosts);
  cards.forEach(c => {
    let needle;
    g.some(ghost => {
      if (ghost.id !== c.cardId) return false;
      needle = ghost;
      return true;
    });

    if (needle) {
      needle.found = true;
    } else {
      console.warn('Could not find ghost for %s', c.cardId, c.name);
    }
  });
  return g;
}

async function findGhosts ({location, username}) {
  let ghosts = ghostDB;
  if (location) {
    ghosts = ghosts.filter(g => g.location === location);
  }

  if (username) {
    const data = await getDestiny(username)
    return computeFoundGhosts(ghosts, data.cardCollection);
  }

  return ghosts;
};

/**
 * The locations in Destiny.
 *
 * This implements the following type system shorthand:
 *   enum Location { TOWER, EARTH, MOON, VENUS, MARS, THEREEF, DREADNAUGHT }
 */
const locationEnum = new GraphQLEnumType({
  name: 'LocationEnum',
  description: 'One of the locations in Destiny',
  values: {
    TOWER: {
      value: 'Tower',
      description: 'The Tower',
    },
    EARTH: {
      value: 'Earth',
      description: 'Earth',
    },
    MOON: {
      value: 'Moon',
      description: 'Moon',
    },
    VENUS: {
      value: 'Venus',
      description: 'Venus',
    },
    MARS: {
      value: 'Mars',
      description: 'Mars',
    },
    THEREEF: {
      value: 'The Reef',
      description: 'The Reef',
    },
    DREADNAUGHT: {
      value: 'Dreadnaught',
      description: 'The Dreadnaught',
    },
  }
});

// const locationType = new GraphQLList(GraphQLString);
const locationType = new GraphQLObjectType({
  name: 'Location',
  description: 'The locations of Destiny',
  fields: () => ({
    name: {
      type: GraphQLString,
      description: 'Location Name'
    },
    value: {
      type: GraphQLString,
      description: 'Location Value'
    }
  })
});

const ghostInterface = new GraphQLObjectType({
  name: 'Ghost',
  description: 'A Ghost location in Destiny',
  fields: () => ({
    /*
    id: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The id of the ghost.',
    },
    */
    location: {
      type: GraphQLString,
      description: 'The location a thing is in',
    },
    name: {
      type: GraphQLString,
      description: 'The name of the ghost.',
    },
    description: {
      type: GraphQLString,
      description: 'Description of directions to find the ghost.',
    },
    images: {
      type: new GraphQLList(GraphQLString),
      description: 'Screenshots of the Ghost location.',
    },
    youtube: {
      type: GraphQLString,
      description: 'Link to YouTube video of Ghost location.',
    },
    area: {
      type: GraphQLString,
      description: 'Name of the location area.',
    },
    grimoire: {
      type: GraphQLInt,
      description: 'Grimoire points ghost is worth.',
    },
    expansion: {
      type: GraphQLString,
      description: 'Expansion required to get ghost.',
    },
    availability: {
      type: new GraphQLList(GraphQLString),
      description: 'Which missions a ghost is available in.',
    },

    found: {
      type: GraphQLBoolean,
      description: 'Has this ghost been found be a user',
    },
  }),
  /*
  resolveType: (ghost, b) => {
    return ghost[0];
  }
  */
});

const queryType = new GraphQLObjectType({
  name: 'RootGhostQuery',
  fields: () => ({
    locations: {
      type: new GraphQLList(locationType),
      resolve: (root, args) => locationEnum._values.map(v => ({
          name: v.value,
          value: v.name
      }))
    },
    ghosts: {
      type: new GraphQLList(ghostInterface),
      resolve: (root, args) => new Promise((resolve, reject) => {
        try {
          resolve(findGhosts(args));
        } catch (e) {
          reject(e);
        }
      }),
      args: {
        location: {
          description: '',
          type: locationEnum
        },
        username: {
          description: '',
          type: GraphQLString
        }
      },
    },
  }),
});

const schema = new GraphQLSchema({
  query: queryType
});

export default schema;
