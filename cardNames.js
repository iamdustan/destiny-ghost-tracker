const ghosts = require('./data/ghosts');

const data = require('./grimoire-definitions');
const unique = (arr) => {
  const map = new WeakMap();
  const hash = {};
  const uniqued = [];
  arr.forEach(curr => {
    if (Array.isArray(curr) || typeof curr === 'object') {
      if (map.get(curr)) return;
      map.set(curr, true);
      uniqued.push(curr);
    } else {
      if (hash[curr]) return;
      hash[curr] = true;
      uniqued.push(curr);
    }
  });
  return uniqued;
}

const cardNames = data.Response.themeCollection.reduce((arr, current) => (
  arr.concat(
    current.pageCollection.map(n => n.cardCollection).reduce((arr, current) => (
      arr.concat(current)
      /*
      arr.concat(current.filter(n => (
        ghosts.some(g =>
          g.name.replace(/\s+/g, '').toLowerCase() ===
          n.cardName.replace(/\s+/g, '')
            .replace(new RegExp('&lt;', 'g'), '<')
            .replace(new RegExp('&gt;', 'g'), '>')
            .replace(new RegExp('&#39;', 'g'), "'")
            .toLowerCase()
        )
      )))
     */
    ), [])
  )
), []);

/*
  [ 'cardDescription',
    'cardId',
    'cardIntro',
    'cardIntroAttribution',
    'cardName',
    'highResolution',
    'normalResolution',
    'points',
    'rarity',
    'unlockFlagHash',
    'unlockHowToText' ]
*/
console.log(cardNames, cardNames.length);
// console.log(ghosts.map(n => n.name).sort());
// console.log('%s ghosts', ghosts.length);

