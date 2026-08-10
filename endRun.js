/*
  NEON PULSE — End Run Text
  Alpha 1.9.x

  File location:
  text/EndRun.js
*/

window.EndRunText = (() => {
  const titles = [
    'TOUR CANCELLED'
  ];

  const reasons = [
    'Hydration Error',
    'Glow Stick Incident',
    'Unplanned Stage Exit',
    'The Drop Dropped You',
    '"One More..."'
  ];

  const replayButtons = [
    'PLAY IT BACK',
    'RUN IT AGAIN',
    'ONE MORE SET',
    'BACK ON STAGE',
    'RELOAD THE SET',
    'QUEUE IT UP',
    'ANOTHER ROUND',
    'DROP IT AGAIN'
  ];

  const restButtons = [
    'GET SOME REST',
    'CALL IT A NIGHT',
    'LEAVE THE VENUE',
    'HEAD BACKSTAGE',
    'CLOCK OUT',
    'PACK IT UP',
    'GO TOUCH GRASS',
    'SAVE YOUR HEARING'
  ];

  function randomFrom(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  function getTitle() {
    return randomFrom(titles);
  }

  function getReason() {
    return randomFrom(reasons);
  }

  function getReplayButton() {
    return randomFrom(replayButtons);
  }

  function getRestButton() {
    return randomFrom(restButtons);
  }

  function getEndRunText() {
    return {
      title: getTitle(),
      reason: getReason(),
      replayButton: getReplayButton(),
      restButton: getRestButton()
    };
  }

  return {
    titles,
    reasons,
    replayButtons,
    restButtons,
    getTitle,
    getReason,
    getReplayButton,
    getRestButton,
    getEndRunText
  };
})();
