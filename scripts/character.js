const db = require('./../lib/db');
const helpers = require('./../lib/helpers');

module.exports = function (robot) {

  /**
   * Upon hearing !me, display the character of the user.
   */
  robot.hear(/!me/, function (res) {
    const username = helpers.username(res);
    const character = db.characterForUsername(username);

    if (!character.initialized) {
      res.reply("Il semblerait que tu n'ai pas encore de personnage :thinking_face:");
    } else {
      res.send(character.attachment(`@${username}`));
    }
  });
}