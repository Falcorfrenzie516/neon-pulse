/*
  NEON PULSE — End Run Text
  Alpha 1.9.x

  File location:
  text/endRun.js
*/

window.EndRunText = (() => {
  const title = 'TOUR CANCELLED';

  const deaths = [
    {
      title: 'Hydration Error',
      body: 'You forgot to drink water. Again.<br>Somewhere between “one more song” and “I’m totally fine,” your body submitted a formal resignation.',
      punch: 'Tour cancelled. Hydrate next build.'
    },
    {
      title: 'Glow Stick Incident',
      body: 'You stared into the spinning glow sticks for a little too long.<br>They were pretty. They were mesmerizing. They were apparently stronger than your sense of direction.',
      punch: 'You have no idea where you are. Neither does the tour bus.'
    },
    {
      title: 'Unplanned Stage Exit',
      body: 'You danced a little too hard and accidentally launched yourself off the stage.<br>The crowd thought it was part of the show.',
      punch: 'It was not part of the show.'
    },
    {
      title: 'The Drop Dropped You',
      body: 'You spent all night waiting for the perfect drop.<br>It finally came. So did your last remaining ounce of energy.',
      punch: 'The beat survived. You did not.'
    },
    {
      title: 'One More Song',
      body: 'You said, “One more song.”<br>Then you said it six more times.<br>The venue turned the lights on. The staff went home. Someone is vacuuming around you.',
      punch: 'Take the hint. The tour is over.'
    }
  ];

  const replayButtons = [
    'PLAY IT BACK'
  ];

  const exitButtons = [
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

  function randomFrom(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  function getDeath() {
    return randomFrom(deaths);
  }

  function getReplayButton() {
    return randomFrom(replayButtons);
  }

  function getExitButton() {
    return randomFrom(exitButtons);
  }

  function getEndRunText() {
    return {
      title,
      death: getDeath(),
      replayButton: getReplayButton(),
      exitButton: getExitButton()
    };
  }

  return {
    title,
    deaths,
    replayButtons,
    exitButtons,
    getDeath,
    getReplayButton,
    getExitButton,
    getEndRunText
  };
})();
