const Crawler = require("crawler");
const path = require('path');
const inflected = require('inflected');
const fs = require('fs');
const url = require('url');
const async = require('async');

const detReg = /^le|^la|^l'/;

const c = new Crawler({
    maxConnections : 10,
});

function makeFullUri(segment) {
  return url.resolve('http://www.pathfinder-fr.org/Wiki/', segment);
}

c.queue({
  uri: 'http://www.pathfinder-fr.org/Wiki/Pathfinder-RPG.Races.ashx',
  callback: function(error, res, done) {
    if (error) {
      console.error(error);
      done();
    } else {
      const races = {};
      const $ = res.$;

      const portraitByUrls = {};
      const portraits = $('div.presentation').first().find('a img');
      portraits.each(function (i, o) {
        const ele = $(o);
        const url = makeFullUri(ele.parent().attr('href'));
        portraitByUrls[url] = ele.attr('src');
      });

      const racesBase = $('div.presentation + ul').first();
      const racesBaseList = racesBase.find('li');

      racesBaseList.each(function (i, o) {
        const ele = $(o);

        const link = ele.find('a');
        const raceLink = makeFullUri(link.attr('href'));
        const raceAvatar = portraitByUrls[raceLink];
        const toRemove = ele.find('b').first();
        
        const raceName = inflected.singularize(link.text());

        toRemove.remove();

        const raceDescription = ele.text().trim();

        console.info(`Ajout de la race ${raceName}!`);

        races[raceName] = {
          link: raceLink,
          avatar: raceAvatar,
          description: raceDescription,
        };
      });

      fs.writeFile(path.join(__dirname, './../data/races.json'), JSON.stringify(races, null, 4), done);
    }
  }
});

c.queue({
  uri: 'http://www.pathfinder-fr.org/Wiki/Pathfinder-RPG.Classes.ashx',
  callback: function (error, res, done) {
    if (error) {
      console.error(error);
      done();
    } else {
      const classes = {};
      const $ = res.$;

      const classesBase = $('div.presentation + br + i + ul').first();
      const classesBaseList = classesBase.find('li');

      async.each(classesBaseList, function (o, callback) {
        const ele = $(o);

        const link = ele.find('a');
        const classLink = makeFullUri(link.attr('href'));
        let className = link.text().replace(detReg, '').trim();

        className = className.charAt(0).toUpperCase() + className.slice(1);

        c.queue({
          uri: classLink,
          callback: function (err, r, d) {
            const $ = r.$;

            const lifeMatches = $($('b:contains(Dés de vie.)')[0].nextSibling).text().match(/d(\d*)/);

            classes[className] = {
              link: classLink,
              health: parseInt(lifeMatches[1]),
              description: ele.text().trim(),
            };
            console.info(`Ajout de la classe ${className}!`);

            d();
            callback();
          }
        });
      }, function (err) {
        if (err) {
          console.error(err);
        }

        fs.writeFile(path.join(__dirname, './../data/classes.json'), JSON.stringify(classes, null, 4), done);
      });
    }
  }
});

c.queue({
  uri: 'http://www.pathfinder-fr.org/Wiki/Pathfinder-RPG.Caractéristiques.ashx',
  callback: function (error, res, done) {
    if (error) {
      console.error(error);
      done();
    } else {
      const modifiers = [-5];
      const $ = res.$;

      const table = $($('table.tablo')[2]);

      table.find('tr').each(function (i, o) {
        const ele = $(o);

        const tds = ele.find('td');
        const cara = $(tds[0]).text();

        let matches;

        if (matches = cara.match(/(\d+)–?(\d*)/)) {
          const from = parseInt(matches[1]);
          const to = parseInt(matches[2]) || from;

          const mod = parseInt($(tds[1]).text().replace('–', '-'));
          
          for (let i = from - 1; i < to; i += 1) {
            modifiers[i + 1] = mod;
          }
        }
      });

      fs.writeFile(path.join(__dirname, './../data/modifiers.json'), JSON.stringify(modifiers, null, 4), done);
    }
  }
});