/*
  NEON PULSE — Crew Gate
  Alpha 1.9.x

  File location:
  generators/crewGate.js
*/

window.CrewGate = (() => {
  const config = {
    type: 'crew',
    name: 'CREW',
    image: null,
    emoji: '👥'
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
    return {
      type: 'crew',
      amount: getReward(),
      action: 'chooseCrew'
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
