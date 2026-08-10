/*
  NEON PULSE — Glow Pile Gate
  Alpha 1.9.x

  File location:
  generators/glowPile.js
*/

window.GlowPileGate = (() => {
  const config = {
    type: 'glow',
    name: 'GLOW PILE',
    image: 'assets/glow-pile.png',
    emoji: '✨'
  };

  function create() {
    return {
      type: config.type,
      name: config.name,
      image: config.image,
      emoji: config.emoji
    };
  }

  function getReward(run) {
    return 8 + run.beats * 3;
  }

  function getRewardText(run) {
    return `+${getReward(run)}`;
  }

  function apply(run) {
    const amount = getReward(run);

    run.glow += amount;

    return {
      type: 'glow',
      amount
    };
  }

  return {
    config,
    create,
    getReward,
    getRewardText,
    apply
  };
})();
