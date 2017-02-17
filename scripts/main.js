const roll = require('./../lib/roll');

module.exports = function(robot) {

  robot.respond(/help/, function(res) {
    res.send("Pour commencer l'aventure, taper *rejoindre* l'aventure!");
  });

  robot.respond(/roll (\d+)?d(\d+)/, function (res) {
    const count = parseInt(res.match[1] || '1');
    const sides = parseInt(res.match[2]);

    const total = roll.rollAndSum(count, sides);

    res.send(`Je lance ${count} dé(s) à ${sides} face(s) = ${total}`);
  });
};
