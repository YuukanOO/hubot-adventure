const races = require('./../data/races.json');
const classes = require('./../data/classes.json');

class Db {

  constructor() {
    this.races = races;
    this.classes = classes;
  }

}

module.exports = new Db();
