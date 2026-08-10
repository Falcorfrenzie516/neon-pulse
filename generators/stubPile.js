/*
  NEON PULSE — Stub Pile Gate
  Alpha 1.9.x

  File location:
  generators/stubPile.js
*/

window.StubPileGate = (() => {
  const config = {
    type: 'stubs',
    name: 'STUB PILE',
    image: 'assets/stub-pile.png',
    emoji: '🎟'
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
    return 20 + run.beats * 6;
  }

  function getRewardText(run) {
    return `+${getReward(run)}`;
  }

  function apply(run) {
    const amount = getReward(run);

    run.stubs += amount;

    return {
      type: 'stubs',
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
