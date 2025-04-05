export class TimeSystem {
  constructor(scene, dayDuration = 180) {
    this.scene = scene;
    this.dayDuration = dayDuration * 1000; // Convert to milliseconds
    this.nightDuration = dayDuration * 1000 * 0.5; // Night is shorter than day
    this.time = 0;
    this.isDay = true;
    this.dayCount = 1;

    this.dayStartCallbacks = [];
    this.nightStartCallbacks = [];

    // Setup day/night cycle visuals
    this.setupDayNightVisuals();
  }

  update(delta) {
    // Update the time
    this.time += delta;

    // Check for day/night transition
    if (this.isDay && this.time >= this.dayDuration) {
      this.time = 0;
      this.isDay = false;
      this.transitionToNight();
    } else if (!this.isDay && this.time >= this.nightDuration) {
      this.time = 0;
      this.isDay = true;
      this.dayCount++;
      this.transitionToDay();
    }

    // Update sky darkness based on time
    this.updateSkyDarkness();
  }

  setupDayNightVisuals() {
    // Create sky images
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;

    this.skyDay = this.scene.add
      .image(width / 2, height / 2, "sky-day")
      .setScrollFactor(0)
      .setScale(1.2)
      .setDepth(-10);

    this.skyNight = this.scene.add
      .image(width / 2, height / 2, "sky-night")
      .setScrollFactor(0)
      .setScale(1.2)
      .setDepth(-10)
      .setAlpha(0);
  }

  updateSkyDarkness() {
    if (this.isDay) {
      // Day: gradually transition towards evening
      const progress = this.time / this.dayDuration;
      const nightAlpha = progress * 0.5; // Max 0.5 alpha for sunset effect
      this.skyNight.setAlpha(nightAlpha);
    } else {
      // Night: fully dark at middle of night, then gradually lighten
      const progress = this.time / this.nightDuration;
      let nightAlpha;

      if (progress < 0.5) {
        nightAlpha = 0.5 + progress; // 0.5 to 1.0
      } else {
        nightAlpha = 1.5 - progress; // 1.0 to 0.5
      }

      this.skyNight.setAlpha(nightAlpha);
    }
  }

  transitionToNight() {
    // Call night start callbacks
    for (const callback of this.nightStartCallbacks) {
      callback();
    }
  }

  transitionToDay() {
    // Call day start callbacks
    for (const callback of this.dayStartCallbacks) {
      callback();
    }
  }

  onDayStart(callback) {
    this.dayStartCallbacks.push(callback);
  }

  onNightStart(callback) {
    this.nightStartCallbacks.push(callback);
  }

  isNight() {
    return !this.isDay;
  }

  getTimeOfDay() {
    return this.isDay ? "day" : "night";
  }

  getDayCount() {
    return this.dayCount;
  }

  // Get time progress as a float between 0 and 1
  getDayProgress() {
    return this.isDay ? this.time / this.dayDuration : 0;
  }

  getNightProgress() {
    return this.isDay ? 0 : this.time / this.nightDuration;
  }

  // Get total day+night cycle progress as a float between 0 and 1
  getCycleProgress() {
    if (this.isDay) {
      return (this.time / this.dayDuration) * 0.66; // Day is 2/3 of full cycle
    } else {
      return 0.66 + (this.time / this.nightDuration) * 0.34; // Night is 1/3
    }
  }
}
