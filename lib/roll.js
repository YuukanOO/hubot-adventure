function roll(count, sides) {
  sides = new Array(sides).fill(0).map((o, i) => i + 1);
  results = new Array(count).fill(0).map(r => sides[Math.floor(Math.random() * sides.length)]);

  return results;
}

function rollAndSum(count, sides) {
  return roll(count, sides).reduce((prev, cur) => prev + cur, 0);
}

module.exports = {
  roll,
  rollAndSum,
}