/*
  NEON PULSE — Sound Check Gate
  Alpha 1.9.x

  File location:
  generators/soundCheck.js
*/

window.SoundCheckGate = (() => {
  const config = {
    type: 'weapon',
    name: 'SOUND CHECK',
    image: 'assets/sound-check.png',
    emoji: '🎛️'
  };

  function create() {
    return {
      type: config.type,
      name: config.name,
      image: config.image,
      emoji: config.emoji
    };
  }

  function getReward() {
    return 1;
  }

  function getRewardText() {
    return `+${getReward()}`;
  }

  function apply(run) {
    const amount = getReward();

    run.weaponLv += amount;

    return {
      type: 'weapon',
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
