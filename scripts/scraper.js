import cheerio from 'cheerio';
import request from 'request';
import yargs from 'yargs';
import path from 'path';
import {writeFileSync as write} from 'fs';

const ThemeCollection = require('../grimoire-definitions.json').Response.themeCollection;
const lookup = (name) => {
  let needle;
  ThemeCollection.some(theme => (
    theme.pageCollection.some(page => (
      page.cardCollection.some(card => {
        if (
          name.replace(/\s+/g, '').toLowerCase() ===
          card.cardName.replace(/\s+/g, '')
            .replace(new RegExp('&lt;', 'g'), '<')
            .replace(new RegExp('&gt;', 'g'), '>')
            .replace(new RegExp('&#39;', 'g'), "'")
            .toLowerCase()
        ) {
          needle = card;
          return true;
        }
      })
    ))
  ));

  return needle;
};

const keyMap = {
  'grimoire points': 'grimoire',
  'required expansion': 'expansion',

  'tower': 'Tower',
  'earth': 'Earth',
  'moon': 'Moon',
  'venus': 'Venus',
  'mars': 'Mars',
  'the_reef': 'The Reef',
  'dreadnaught': 'Dreadnaught',
};

const locations = [
  'tower',
  'earth',
  'moon',
  'venus',
  'mars',
  'the_reef',
  'dreadnaught'
];

const ghosts = [];
const locationsComplete = [];

locations.forEach(function(location) {
  request(`http://destinyghosthunter.net/ghosts/psn/rdybro/${location}/`, (error, response, html) => {
    if (error) return console.error(error);
    if (response.statusCode !== 200) return console.warn(response);

    const $ = cheerio.load(html);
    const result = [...$('.col-md-9 .panel-primary').map(function(i, element) {
      const name = $(this).find('.panel-title').text()
        .replace(/^\s+?(\d+\.\s+)/, '')
        .replace(/\s+$/, '');
      const youtube = $(this).find('.btn-guide-vid').attr('href');
      const metadata = $(this).find('.panel-body-top').text();
      const description = $(this).find('.panel-body.no-bottom-padding').text().trim();
      const images = [...$(this).find('.panel-body-gallery img')
        .map((i, element) => $(element).attr('src'))];

      const parts = metadata
        .replace('Lore', '')
        .replace('YouTube', '')
        .split(/( \/\/ )|Mission/g)
        .reduce(function(memo, part) {
          if (!part) return memo;
          const [key, value] = part.split(': ');

          if (key === '//') return memo;
          let k = key.toLowerCase().trim();
          k = keyMap[k] || k;

          memo[k] = value && value.trim();
          if (k === 'availability') memo[k] = value.trim().split(', ');
          if (k === 'grimoire') memo[k] = parseInt(value, 10);

          return memo;
        }, {});

      const officialData = lookup(name);
      if (!officialData) {
        console.log('Could not find "%s"', name);
      }

      return {
        id: officialData ? officialData.cardId : -1,
        location: keyMap[location],
        name,
        description,
        images,
        youtube,
        ...parts
      };
    })];

    ghosts.push(...result);
    console.log('Completed parsing Ghosts for %s', location);
    locationsComplete.push(location);
    checkComplete();
  });
});

function checkComplete() {
  if (locationsComplete.length !== locations.length) return;

  const outputFile = path.join(__dirname, '..', 'data', '_ghosts.js');

  console.log('Writing %s Ghost locations to %s', ghosts.length, outputFile.replace(__dirname, ''));
  write(
    outputFile,
    'export default ' + JSON.stringify(ghosts, null, 2)
  );
}


