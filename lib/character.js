const helpers = require('./helpers');

class Character {

  constructor(username) {
    this.user = username;
    this.level = 1;
    this.xp = 0;
    this.health = 0;
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
    this.modifiers = {
      strengh: 0,
      dexterity: 0,
      constitution: 0,
      intelligence: 0,
      wisdom: 0,
      charisma: 0,
    };
  }

  computeModifiers() {

  }

  attachment(pretext) {
    return {
      attachments: [
        {
          pretext,
          color: this.color,
          title: `${this.name}, ${this.class} ${this.race} de niveau ${this.level}`,
          fields: Object.keys(this.stats).map(s => ({
            title: helpers.capitalize(helpers.statsMap[s]),
            value: `:game_die: ${this.stats[s]}`,
            short: true,
          })),
        }
      ]
    };
  }

}

module.exports = Character;
