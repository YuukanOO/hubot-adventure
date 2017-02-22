const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const helpers = require('./helpers');
const races = require('./../data/races.json');
const classes = require('./../data/classes.json');
const modifiers = require('./../data/modifiers.json');
const characters = require('./../data/characters.json');
const Character = require('./character');
const Item = require('./item');

class Db {

  constructor() {
    this.races = races;
    this.classes = classes;
    this.modifiers = modifiers;
    this.characters = Object.keys(characters).map(c => {
      c = helpers.usePrototype(c, Character.prototype);
      c.backpack = c.backpack.map(o => helpers.usePrototype(o, Item.prototype));
      return c;
    }).reduce((prev, cur) => {
      prev[cur] = characters[cur];

      return prev;
    }, {});
  }

  /**
   * Saves the current states of the game.
   */
  save() {
    const charactersToSave = Object.keys(this.characters).reduce((prev, cur) => {
      const char = this.characters[cur];

      // Removes some properties from the character object
      prev[char.user] = _.omit(char, 'db');

      return prev;
    }, {});

    // We may have some issue with writeFile if more players try to save their character.
    fs.writeFileSync(path.join(__dirname, './../data/characters.json'), JSON.stringify(charactersToSave, null, 4));
  }

  /**
   * Retrieves or creates the character for the given username.
   * 
   * @param {String} username Username of the character
   * @return {Character} The character
   */
  characterForUsername(username) {
    let character = this.characters[username];

    if (!character) {
      character = new Character(this, username);
      this.characters[username] = character; 
    } else {
      character.db = this;
    }

    return character;
  }

  racesAttachments(text) {
    return {
      text,
      attachments: Object.keys(this.races).map(r => ({
        title: r,
        title_link: this.races[r].link,
        text: this.races[r].description,
        thumb_url: this.races[r].avatar,
      })),
    };
  }

  classesAttachments(text) {
    return {
      text,
      attachments: Object.keys(this.classes).map(r => ({
        title: r,
        title_link: this.classes[r].link,
        text: this.classes[r].description,
      })),
    };
  }
}

module.exports = new Db();
