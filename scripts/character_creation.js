const Conversation = require('hubot-conversation');
const helpers = require('./../lib/helpers');
const roll = require('./../lib/roll');
const db = require('./../lib/db');

const CONVERSATION_TIMEOUT = 1200000;

module.exports = function (robot) {

  const creationDialog = new Conversation(robot);

  /**
   * Upon hearing rejoindre, add the character to the current adventure if one
   * is open.
   */
  robot.hear(/rejoindre/, function (res) {
    const username = helpers.username(res);

    const character = db.characterForUsername(username);

    if (!character.initialized) {
      // TODO: reprendre là où on s'est arrêté
      const dialog = creationDialog.startDialog(res, CONVERSATION_TIMEOUT);
      
      res.send("Je ne te connais pas encore jeune aventurier ! Crée ton personnage en privé !");

      /**
       * CHARACTER NAME
       */
      robot.messageRoom(helpers.userid(res), `
J'espère que tu es prêt à rejoindre l'aventure car ça risque d'être sanglant ! :skull_and_crossbones:

:information_source:  Nous allons pas à pas créer ton personnage. Lorsque tu es invité à préciser une caractéristique, tu peux la référencer par ses *3* premières lettres.
Ainsi, pour référencer la *Force*, tu pourras te contenter d'écrire *for*.

Il est temps de se préparer, quel est le nom de ton personnage ?`);

      dialog.addChoice(/(.*)/i, function (characterMsg) {
        character.setName(helpers.fix(robot, characterMsg.match[1]));

        /**
         * CHARACTER RACE
         */
        const races = Object.keys(db.races);
        characterMsg.reply(db.racesAttachments(`
Bien le bonjour *${character.name}* ! A quelle race appartient tu ?`));

        races.forEach(r => dialog.addChoice(new RegExp(r, 'i'), function (raceMsg) {
          /**
           * CHARACTER CLASS
           */
          const classes = Object.keys(db.classes);

          raceMsg.reply(db.classesAttachments(`
Un bien bel *${r}* donc ! Nous avançons, quelle classe maintenant ?`));

          classes.forEach(c => dialog.addChoice(new RegExp(c, 'i'), function (classMsg) {

            /**
             * CHARACTER STATS
             */

            let availableStats = [];

            // Throw 4d6 and keeps the max 3
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

            // Sort them !
            availableStats = availableStats.sort((a, b) => b - a);

            classMsg.reply(`
Tu es donc un *${c} ${r}*, occupons-nous de tes caractéristiques.
J'ai lancé des dés et en ai déduis les valeurs suivantes :
${availableStats.map(s => `:game_die: ${s}`).join(', ')}

Distribue ces valeurs par ordre décroissant en précisant les caractéristiques associées (séparées par des virgules) :
${Object.values(helpers.translations).map(s => `*${helpers.capitalize(s)}*`).join(', ')}`);

            dialog.addChoice(/(.*)/, function (statsMsg) {
              const chars = helpers.fix(robot, statsMsg.match[1]);
              const rep = chars.split(',').map(t => t.trim());
              const charStats = {};

              for (let stat of rep) {
                const statNatural = helpers.natural(stat);
                
                if (!statNatural) {
                  statsMsg.reply(`Tu t'es trompé, je ne connais pas de caractéristique nommée ${stat}`);
                  return;
                }

                charStats[statNatural] = availableStats[0];
                availableStats = availableStats.slice(1);
              }

              character.setStats(charStats);
              character.setRace(r);
              character.setClass(c);

              statsMsg.reply(character.attachment('Une bonne chose de faite ! Voilà un petit résumé de ton personnage'));
              
              // TODO : Compléter entiérement la fiche perso
              character.ready();
            });
          }));
        }));
      });
    } else {
      res.send(`Tu as rejoins l'aventure ${character.name}`);
    }
  });

};