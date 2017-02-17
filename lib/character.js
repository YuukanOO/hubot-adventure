const _ = require('lodash');
const helpers = require('./helpers');

class Character {

  constructor(db, username) {
    this.db = db;

    this.user = username;
    this.level = 1;
    this.xp = 0;
    this.health = 0;
    this.armor = 0;
    this.name = null;
    this.color = '#e9cbaf';
    this.class = null;
    this.race = null;
    this.stats = {
      strengh: 0,
      dexterity: 0,
      constitution: 0,
      intelligence: 0,
      wisdom: 0,
      charisma: 0,
    };
    this.modifiers = {};

    this.gold = 0;
    this.backpack = [];
    this.initialized = false;
  }

  /**
   * Mark this character has ready to go into an adventure.
   */
  ready() {
    this.initialized = true;
    this.db.save();
  }

  /**
   * Compute modifiers based on the character stats.
   */
  computeModifiers() {
    for (let stat in this.stats) {
      this.modifiers[stat] = this.db.modifiers[this.stats[stat]];
    }
  }

  /**
   * Sets this character race.
   */
  setRace(raceName) {
    this.race = raceName;
  }

  /**
   * Sets the character name.
   */
  setName(name) {
    this.name = name;
  }

  /**
   * Sets this character class.
   */
  setClass(className) {
    this.class = className;
    this.health = this.db.classes[this.class].health + (this.modifiers.constitution || 0);
  }

  /**
   * Sets this character stats.
   */
  setStats(stats) {
    this.stats = _.extend({}, this.stats, stats);
    this.computeModifiers();
  }

  /**
   * Retrieve an attachment representation for this character.
   */
  attachment(pretext) {
    const stats = Object.keys(this.stats).map(s => ({
      title: helpers.capitalize(helpers.translations[s]),
      value: `${this.stats[s]} (${helpers.formatModifier(this.modifiers[s])})`,
      short: true,
    }));

    return {
      attachments: [
        {
          pretext,
          color: this.color,
          title: `${this.name}, ${this.class} ${this.race} de niveau ${this.level}`,
          fields: [
            {
              title: 'Points de vie',
              value: `${this.health} :heart:`,
              short: true,
            },
            {
              title: "Classe d'armure",
              value: `${this.armor} :shield:`,
              short: true,
            }
          ].concat(stats).concat([
            {
              title: 'Sac à dos',
              value: `${this.gold} po :moneybag:`,
              short: true,
            }
          ]),
        }
      ]
    };
  }

}

module.exports = Character;
