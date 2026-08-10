/*
  NEON PULSE — Generator System
  Alpha 1.9.1

  Load this BEFORE game.js:
  <script src="generators/generators.js"></script>
  <script src="game.js"></script>
*/

window.GeneratorSystem = (() => {

  const LEVELS = {
    1:  { image: "assets/generator-01.png", hpMultiplier: 1.00 },
    2:  { image: "assets/generator-02.png", hpMultiplier: 1.22 },
    3:  { image: "assets/generator-03.png", hpMultiplier: 1.44 },
    4:  { image: "assets/generator-04.png", hpMultiplier: 1.66 },
    5:  { image: "assets/generator-05.png", hpMultiplier: 1.88 },
    6:  { image: "assets/generator-06.png", hpMultiplier: 2.10 },
    7:  { image: "assets/generator-07.png", hpMultiplier: 2.32 },
    8:  { image: "assets/generator-08.png", hpMultiplier: 2.54 },
    9:  { image: "assets/generator-09.png", hpMultiplier: 2.76 },
    10: { image: "assets/generator-10.png", hpMultiplier: 2.98 }
  };

  const images = {};

  function preload() {
    Object.entries(LEVELS).forEach(([level, config]) => {
      const img = new Image();
      img.src = config.image;
      images[level] = img;
    });
  }


  // =========================================================
  // GENERATOR POWER LEVEL RANDOMIZATION
  // =========================================================
  //
  // row is ZERO indexed:
  //
  // 0–1 = displayed rows 1–2
  // 2–3 = displayed rows 3–4
  // 4–5 = displayed rows 5–6
  // 6–7 = displayed rows 7–8
  //
  // =========================================================

  function rollPowerLevel(row) {

    const r = Math.random();


    // ROWS 1–2
    //
    // Level 1 = 60%
    // Level 2 = 20%
    // Level 3 = 15%
    // Level 4 = 5%

    if (row <= 1) {

      if (r < 0.60) return 1;
      if (r < 0.80) return 2;
      if (r < 0.95) return 3;

      return 4;
    }


    // ROWS 3–4
    //
    // Level 4 = 60%
    // Level 3 = 20%
    // Level 5 = 15%
    // Level 6 = 5%

    if (row <= 3) {

      if (r < 0.60) return 4;
      if (r < 0.80) return 3;
      if (r < 0.95) return 5;

      return 6;
    }


    // ROWS 5–6
    //
    // Level 5 = 60%
    // Level 6 = 20%
    // Level 7 = 15%
    // Level 8 = 5%

    if (row <= 5) {

      if (r < 0.60) return 5;
      if (r < 0.80) return 6;
      if (r < 0.95) return 7;

      return 8;
    }


    // ROWS 7–8
    //
    // Level 7 = 60%
    // Level 8 = 20%
    // Level 10 = 15%
    // Level 9 = 5%

    if (r < 0.60) return 7;
    if (r < 0.80) return 8;
    if (r < 0.95) return 10;

    return 9;
  }


  // =========================================================
  // GENERATOR HEALTH
  // =========================================================

  function getHP(row, powerLevel, beats = 0) {

    const rowBase =
      105 +
      row * 18 +
      Math.pow(row, 1.32) * 5.5;

    const beatScale =
      1 + beats * 0.025;

    const levelScale =
      LEVELS[powerLevel]?.hpMultiplier ?? 1;

    return Math.round(
      rowBase *
      beatScale *
      levelScale
    );
  }


  // =========================================================
  // CREATE GENERATOR
  // =========================================================

  function create(row, x, y, beats = 0) {

    const powerLevel =
      rollPowerLevel(row);

    const hp =
      getHP(row, powerLevel, beats);

    return {

      kind: "gen",

      row,
      powerLevel,

      x,
      y,

      r: 30,


      // IMPORTANT:
      //
      // The artwork is larger than the collision box.
      //
      // This lets the player move BEHIND / BELOW
      // generators without being killed simply because
      // they touched the transparent artwork area.

      collisionW: 48,
      collisionH: 34,

      hp,
      max: hp,

      dead: false
    };
  }


  // =========================================================
  // PLAYER → GENERATOR COLLISION
  // =========================================================

  function playerCollides(generator, player) {

    const halfW =
      (generator.collisionW || 48) / 2;

    const halfH =
      (generator.collisionH || 34) / 2;


    // Smaller than the visible player circle.
    // Makes slipping behind generators possible.

    const playerRadius =
      player.r * 0.55;


    return (

      generator.y + halfH >=
        player.y - playerRadius

      &&

      generator.y - halfH <=
        player.y + playerRadius

      &&

      Math.abs(
        generator.x - player.x
      ) <
        halfW + playerRadius
    );
  }


  // =========================================================
  // SHOT → GENERATOR COLLISION
  // =========================================================
  //
  // Intentionally larger than the player collision.
  //
  // Shooting the generator should feel forgiving even
  // though physically navigating around it is precise.
  //
  // =========================================================

  function shotCollides(generator, shot) {

    return (

      Math.abs(
        shot.x - generator.x
      ) <
        generator.r +
        shot.r +
        8

      &&

      Math.abs(
        shot.y - generator.y
      ) <
        generator.r +
        shot.r +
        12
    );
  }


  // =========================================================
  // DRAW GENERATOR
  // =========================================================

  function draw(ctx, generator) {

    if (generator.dead) return;


    const img =
      images[generator.powerLevel];


    // Visible generator size.
    //
    // Notice this is MUCH larger than collisionW/H.
    //
    // That's intentional.

    const artW = 104;
    const artH = 70;


    ctx.textAlign = "center";


    // GENERATOR IMAGE

    if (
      img &&
      img.complete &&
      img.naturalWidth
    ) {

      ctx.drawImage(
        img,

        generator.x - artW / 2,
        generator.y - artH / 2,

        artW,
        artH
      );

    } else {

      // Fallback if an image hasn't loaded yet.

      ctx.font = "32px Arial";

      ctx.fillText(
        "⚡",
        generator.x,
        generator.y + 9
      );
    }


    // =====================================================
    // HEALTH BAR
    // =====================================================

    ctx.fillStyle =
      "#ffffff20";

    ctx.fillRect(
      generator.x - 48,
      generator.y - artH / 2 - 11,
      96,
      6
    );


    ctx.fillStyle =
      "#ffd65a";

    ctx.fillRect(
      generator.x - 48,
      generator.y - artH / 2 - 11,

      96 *
      Math.max(
        0,
        generator.hp /
        generator.max
      ),

      6
    );


    // =====================================================
    // POWER LEVEL LABEL
    // =====================================================

    ctx.font =
      "900 10px Arial";

    ctx.fillStyle =
      "#fff";

    ctx.fillText(
      `POWER ${generator.powerLevel}`,

      generator.x,

      generator.y +
      artH / 2 +
      17
    );
  }


  function getImage(powerLevel) {

    return images[powerLevel];
  }


  // Preload generator artwork.

  preload();


  // Public generator API

  return {

    levels: LEVELS,

    rollPowerLevel,

    getHP,

    create,

    playerCollides,

    shotCollides,

    draw,

    getImage
  };

})();
