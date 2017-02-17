/**
 * Retrieve the user name from a message.
 */
const username = res => res.message.user.name;

/**
 * Retrieve the user id from a message.
 */
const userid = res => res.message.user.id;

/**
 * Used with hubot-conversation since sometimes it gets it wrong.
 */
const fix = (robot, msg) => msg.replace(robot.name, '').trim();

/**
 * Capitalize a string.
 */
const capitalize = (msg) => msg.charAt(0).toUpperCase() + msg.slice(1);

/**
 * Retrieve a representation with +number or -number for modifiers.
 */
const formatModifier = (number) => number >= 0 ? `+${number}` : number;

const translations = {
  strengh: 'force',
  dexterity: 'dextérité',
  constitution: 'constitution',
  intelligence: 'intelligence',
  wisdom: 'sagesse',
  charisma: 'charisme',
};

const translationsInverse = Object.keys(translations).reduce((p, c) => {
  p[translations[c]] = c;

  return p;
}, {});

const translationsInverseShort = Object.keys(translations).reduce((p, c) => {
  p[translations[c].substring(0, 3)] = c;

  return p;
}, {});

/**
 * Retrieve a translation.
 */
const translate = key => translations[key.toLowerCase()];

/**
 * Retrieve the natural (or technical) value of a translation.
 */
const natural = natural => {
  const naturalLower = natural.toLowerCase();
  return translationsInverse[naturalLower] || translationsInverseShort[naturalLower];
};

module.exports = {
  username,
  userid,
  fix,
  formatModifier,
  capitalize,
  translate,
  translations,
  translationsInverse,
  translationsInverseShort,
  natural,
};
