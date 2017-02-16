const username = res => res.message.user.name;
const userid = res => res.message.user.id;
const fix = (robot, msg) => msg.replace(robot.name, '').trim();
const capitalize = (msg) => msg.charAt(0).toUpperCase() + msg.slice(1);

const statsMap = {
  strengh: 'force',
  dexterity: 'dextérité',
  constitution: 'constitution',
  intelligence: 'intelligence',
  wisdom: 'sagesse',
  charisma: 'charisme',
};
const statsMapInverse = Object.keys(statsMap).reduce((p, c) => {
  p[statsMap[c]] = c;

  return p;
}, {});

module.exports = {
  username,
  userid,
  fix,
  capitalize,
  statsMap,
  statsMapInverse,
};
