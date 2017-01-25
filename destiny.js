import fetch from 'isomorphic-fetch';

const BUNGIE_ROOT = 'http://www.bungie.net/Platform/Destiny/';
const DESTINY_API_KEY = '5ea8a34558624fd1befd126b0088195b';

const get = (endpoint) =>
  fetch(
    `${BUNGIE_ROOT}${endpoint}`, {
      headers: {'X-API-Key': DESTINY_API_KEY}
    }
  )
  .then(resp => resp.ok ? resp.json() : resp)
  .then(data => data.Response[0] || data.Response.data);

export const getUser = (username) =>
  get(`SearchDestinyPlayer/All/${username}/`)


export const getGrimoire = (username) =>
  getUser(username)
    .then(({membershipType, membershipId}) =>
      get(`Vanguard/Grimoire/${membershipType}/${membershipId}/`))


/*
  GET http://www.bungie.net/Platform/Destiny/SearchDestinyPlayer/All/iamdustan/
  {
    "Response": [
      { "iconPath":"/img/theme/destiny/icons/icon_psn.png",
        "membershipType":2,
        "membershipId":"4611686018447625654",
        "displayName":"iamdustan"
      }
    ],
    "ErrorCode":1,
    "ThrottleSeconds":0,
    "ErrorStatus":"Success",
    "Message":"Ok",
    "MessageData":{}
  }


  /Platform/Destiny/${membershipType}/Account
  GET http://www.bungie.net/Platform/Destiny/2/Account/triumphs/
  {
    "Response": {
      "data": {
        "triumphSets": [
          { "triumphSetHash":1,
            "triumphs":[
              { "complete":true,
                "progress":0,
                "actual":0,
                "showProgress":false
              },
              { "complete":true,
                "progress":0,
                "actual":0,
                "showProgress":false
              },
              {"complete":false,"progress":0,"actual":0,"showProgress":false},{"complete":false,"progress":0,"actual":0,"showProgress":false},{"complete":false,"progress":0,"actual":0,"showProgress":false},{"complete":false,"progress":0,"actual":0,"showProgress":false},{"complete":false,"progress":0,"actual":0,"showProgress":false},{"complete":false,"progress":0,"actual":0,"showProgress":false},{"complete":false,"progress":0,"actual":0,"showProgress":false},{"complete":false,"progress":0,"actual":0,"showProgress":false}]
          }
        ]
      }
    },
    "ErrorCode":1,
    "ThrottleSeconds":0,
    "ErrorStatus":"Success",
    "Message":"Ok",
    "MessageData":{}
  }
*/
