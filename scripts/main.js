const Conversation = require('hubot-conversation');
const db = require('./../lib/db');
const helpers = require('./../lib/helpers');
const Character = require('./../lib/character');
const roll = require('./../lib/roll');

const characters = {};
const creatingCharacter = {};

module.exports = function(robot) {

  const creationDialog = new Conversation(robot);

  robot.respond(/help/, function(res) {
    res.send("Pour commencer l'aventure, taper rejoindre l'aventure!");
  });

  robot.respond(/roll (\d+)?d(\d+)/, function (res) {
    const count = parseInt(res.match[1] || '1');
    const sides = parseInt(res.match[2]);

    const total = roll.rollAndSum(count, sides);

    res.send(`Je lance ${count} dé(s) à ${sides} face(s) = ${total}`);
  });

  robot.hear(/rejoindre/, function (res) {
    const username = helpers.username(res);
    const user = characters[username];

    if (!user) {
      res.send("Je ne te connais pas encore jeune aventurier ! Crée ton personnage en privé !");
      
      const dialog = creationDialog.startDialog(res, 1200000);
      const character = new Character(username);

      robot.messageRoom(helpers.userid(res), "Commençons par le commencement, comment désires-tu être nommé ?");
      dialog.addChoice(/(.*)/i, function (characterMsg) {
        character.name = helpers.fix(robot, characterMsg.match[1]);

        const races = Object.keys(db.races);

        characterMsg.reply(`Bien le bonjour *${character.name}* !
A quelle race appartient tu ? Les choix disponibles sont les suivants : ${races.join(', ')}`);
        races.forEach(r => dialog.addChoice(new RegExp(r, 'i'), function (raceMsg) {
          character.race = r;
          
          const classes = Object.keys(db.classes);
          raceMsg.reply(`Un fier *${character.race}* donc ! Nous avançons, quelle classe maintenant ? Parmis : ${classes.join(', ')}`)
          classes.forEach(c => dialog.addChoice(new RegExp(c, 'i'), function (classMsg) {
            character.class = c;
            let availableStats = [];

            for (let k = 0; k < 6; k += 1) {
              const values = roll.roll(4, 6);
              const min = Math.min.apply(null, values);
              let minRemoved = false;
              const left = values.filter(v => {
                if (v === min && !minRemoved) {
                  minRemoved = true;
                  return false;
                }

                return true;
              });

              availableStats.push(left.reduce((prev, cur) => prev + cur, 0));
            }

            availableStats = availableStats.sort((a, b) => b - a);

            classMsg.reply(`Tu es donc un *${character.class} ${character.race}*, occupons-nous de tes caractéristiques.
J'ai lancé des dés et en ai déduis les valeurs de caractéristiques suivantes :
${availableStats.map(s => `:game_die: ${s}`).join(', ')}
Distribue ces valeurs par ordre décroissant des caractéristiques suivantes (séparées par des virgules) :
${Object.values(helpers.statsMap).map(s => `*${helpers.capitalize(s)}*`).join(', ')}`);
            dialog.addChoice(/(.*)/, function (statsMsg) {
              const chars = helpers.fix(robot, statsMsg.match[1]);
              const rep = chars.toLowerCase().split(',').map(t => t.trim());

              for (let stat of rep) {
                const statTrueName = helpers.statsMapInverse[stat];
                
                if (!statTrueName) {
                  console.error('Wrong char name');
                  break;
                }

                character.stats[statTrueName] = availableStats[0];
                availableStats = availableStats.slice(1);
              }

              statsMsg.reply(character.attachment('Une bonne chose de faite ! Voilà un petit résumé'));
            });
          }));
        }));
      });
    } else {
      res.send("Tu as rejoins le groupe d'aventuriers");
    }
  });

};
