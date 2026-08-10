/*
  NEON PULSE — Exit Button Text
  Alpha 1.9.x

  File location:
  generators/exitButtons.js
*/

window.ExitButtons = (() => {
  const buttons = [
    'GET SOME REST',
    'BACKSTAGE',
    'BACK TO THE GREEN ROOM',
    'LEAVE THE DECKS',
    'CALL IT A NIGHT',
    'END THE AFTERS',
    'PACK UP THE GEAR',
    'POWER DOWN',
    'CLOCK OUT, DJ',
    'EXIT THE BOOTH',
    'LEAVE THE RAVE',
    'SAVE YOUR EARS',
    'TOUR BUS TIME',
    'FIND THE TOUR BUS',
    'GO TOUCH GRASS',
    'HYDRATE & DISAPPEAR',
    'LOG OFF THE DECKS',
    '> RETURN: BACKSTAGE',
    '> DJ.STATUS = OFFLINE',
    'GO BE A PERSON'
  ];

  function random() {
    return buttons[Math.floor(Math.random() * buttons.length)];
  }

  return {
    buttons,
    random
  };
})();
