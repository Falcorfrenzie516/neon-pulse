const GeneratorSystem = {
  levels: {
    1: { image: "assets/generator-01.png", hpMultiplier: 1.00 },
    2: { image: "assets/generator-02.png", hpMultiplier: 1.22 },
    3: { image: "assets/generator-03.png", hpMultiplier: 1.44 },
    4: { image: "assets/generator-04.png", hpMultiplier: 1.66 },
    5: { image: "assets/generator-05.png", hpMultiplier: 1.88 },
    6: { image: "assets/generator-06.png", hpMultiplier: 2.10 },
    7: { image: "assets/generator-07.png", hpMultiplier: 2.32 },
    8: { image: "assets/generator-08.png", hpMultiplier: 2.54 },
    9: { image: "assets/generator-09.png", hpMultiplier: 2.76 },
    10: { image: "assets/generator-10.png", hpMultiplier: 2.98 }
  },

  rollPowerLevel(row) {
    const r = Math.random();

    if (row <= 1) {
      if (r < .60) return 1;
      if (r < .80) return 2;
      if (r < .95) return 3;
      return 4;
    }

    if (row <= 3) {
      if (r < .60) return 4;
      if (r < .80) return 3;
      if (r < .95) return 5;
      return 6;
    }

    if (row <= 5) {
      if (r < .60) return 5;
      if (r < .80) return 6;
      if (r < .95) return 7;
      return 8;
    }

    if (r < .60) return 7;
    if (r < .80) return 8;
    if (r < .95) return 10;
    return 9;
  },

  getHP(row, powerLevel, beats = 0) {
    const rowBase = 105 + row * 18 + Math.pow(row, 1.32) * 5.5;
    const buildScale = 1 + beats * .025;
    const levelScale = this.levels[powerLevel].hpMultiplier;

    return Math.round(rowBase * levelScale * buildScale);
  },

  getImage(powerLevel) {
    return this.levels[powerLevel].image;
  },

  getCollisionBox(powerLevel) {
    return {
      width: 48,
      height: 34
    };
  }
};
