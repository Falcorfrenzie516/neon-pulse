/*
  NEON PULSE — Speaker Gate
  Alpha 1.9.x

  File location:
  generators/speaker.js
*/

window.SpeakerGate = (() => {
  const config = {
    type: 'beats',
    name: 'SPEAKERS',
    image: 'assets/speakers.png',
    emoji: '🔊'
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

    run.beats += amount;

    return {
      type: 'beats',
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
