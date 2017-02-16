const Crawler = require("crawler");
const path = require('path');
const inflected = require('inflected');
const fs = require('fs');
const detReg = /^le|^la|^l'/;

const c = new Crawler({
    maxConnections : 10,
});

function makeFullUri(segment) {
  return 'http://www.pathfinder-fr.org/Wiki/' + segment;
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

      const racesBase = $('div.presentation + ul').first();
      const racesBaseList = racesBase.find('li');

      racesBaseList.each(function (i, o) {
        const ele = $(o);

        const link = ele.find('a');
        const raceLink = makeFullUri(link.attr('href'));
        const toRemove = ele.find('b').first();
        
        const raceName = inflected.singularize(link.text());

        toRemove.remove();

        const raceDescription = ele.text().trim();

        console.info(`Ajout de la race ${raceName}!`);

        races[raceName] = {
          link: raceLink,
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

      classesBaseList.each(function (i, o) {
        const ele = $(o);

        const link = ele.find('a');
        const classLink = makeFullUri(link.attr('href'));
        let className = link.text().replace(detReg, '').trim();

        className = className.charAt(0).toUpperCase() + className.slice(1);

        classes[className] = {
          link: classLink,
          description: ele.text().trim(),
        };

        console.info(`Ajout de la classe ${className}!`);
        fs.writeFile(path.join(__dirname, './../data/classes.json'), JSON.stringify(classes, null, 4), done);
      });
    }
  }
});