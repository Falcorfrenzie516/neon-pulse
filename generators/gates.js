/*
  NEON PULSE — Gate System
  Alpha 1.9.x

  File location:
  generators/gate.js

  Load before game.js:
  <script src="generators/generators.js"></script>
  <script src="generators/gate.js"></script>
  <script src="game.js"></script>
*/

window.GateSystem = (() => {
  const DEFINITIONS = {
    weapon: {
      type: 'weapon',
      name: 'SOUND CHECK',
      image: 'assets/sound-check.png',
      emoji: '🎛️'
    },

    beats: {
      type: 'beats',
      name: 'SPEAKERS',
      image: 'assets/speakers.png',
      emoji: '🔊'
    },

    stubs: {
      type: 'stubs',
      name: 'STUB PILE',
      image: 'assets/stub-pile.png',
      emoji: '🎟'
    },

    glow: {
      type: 'glow',
      name: 'GLOW PILE',
      image: 'assets/glow-pile.png',
      emoji: '✨'
    },

    crew: {
      type: 'crew',
      name: 'CREW',
      image: null,
      emoji: '👥'
    }
  };

  const images = {};

  function preload() {
    Object.values(DEFINITIONS).forEach(def => {
      if (!def.image) return;

      const img = new Image();
      img.src = def.image;

      images[def.type] = img;
    });
  }

  function randomChoices(count = 2) {
    return Object.values(DEFINITIONS)
      .sort(() => Math.random() - .5)
      .slice(0, count);
  }

  function createPair(width) {
    const options = randomChoices(2);

    return [
      create(
        options[0],
        width * .34,
        -95
      ),

      create(
        options[1],
        width * .66,
        -95
      )
    ];
  }

  function create(definition, x, y) {
    return {
      type: definition.type,
      name: definition.name,
      emoji: definition.emoji,

      x,
      y,

      w: 112,
      h: 88
    };
  }

  function getRewardText(gate, run) {
    if (gate.type === 'weapon') {
      return '+1';
    }

    if (gate.type === 'beats') {
      return '+1';
    }

    if (gate.type === 'stubs') {
      return `+${20 + run.beats * 6}`;
    }

    if (gate.type === 'glow') {
      return `+${8 + run.beats * 3}`;
    }

    if (gate.type === 'crew') {
      return '+1';
    }

    return '';
  }

  function playerCollides(gate, player) {
    return (
      gate.y + gate.h / 2 > player.y - player.r &&
      gate.y - gate.h / 2 < player.y + player.r &&
      Math.abs(player.x - gate.x) < gate.w / 2
    );
  }

  function draw(ctx, gate, run) {
    const img = images[gate.type];

    ctx.textAlign = 'center';

    // No blue outline and no title label.
    if (
      img &&
      img.complete &&
      img.naturalWidth
    ) {
      let maxW = 78;
      let maxH = 62;

      if (gate.type === 'weapon') {
        maxW = 108;
        maxH = 72;
      }

      if (gate.type === 'beats') {
        maxW = 82;
        maxH = 76;
      }

      const scale = Math.min(
        maxW / img.naturalWidth,
        maxH / img.naturalHeight
      );

      const w =
        img.naturalWidth * scale;

      const h =
        img.naturalHeight * scale;

      ctx.drawImage(
        img,
        gate.x - w / 2,
        gate.y - h / 2 - 6,
        w,
        h
      );
    } else {
      ctx.font = '40px Arial';

      ctx.fillText(
        gate.emoji,
        gate.x,
        gate.y + 5
      );
    }

    // Reward amount stays visible.
    ctx.font = '1000 18px Arial';
    ctx.fillStyle = '#fff';

    ctx.fillText(
      getRewardText(gate, run),
      gate.x,
      gate.y + gate.h / 2 - 2
    );
  }

  preload();

  return {
    definitions: DEFINITIONS,
    randomChoices,
    createPair,
    create,
    getRewardText,
    playerCollides,
    draw
  };
})();
