"use strict";
(() => {
  var __defProp = Object.defineProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

  // src/pond/forms.ts
  var FORMS = {
    comet: {
      key: "comet",
      label: "Comet",
      length: 76,
      widths: [4.2, 5.8, 6.4, 6, 5.1, 4.1, 3.1, 2.1, 1.2],
      colors: { core: "#eafcff", body: "#6fd3ff", fin: "#9fe8ff", glow: "#45c0ff" },
      cruiseSpeed: 70,
      maxSpeed: 215,
      turnRate: 4.4,
      accel: 4.2,
      wanderSpread: 1.7,
      wanderInterval: [0.7, 2],
      wiggleAmp: 0.05,
      wiggleLag: 0.55,
      idleBeat: 3,
      beatPerPx: 0.07,
      maxBend: 0.45,
      senseRadius: 280,
      sparkle: 1.3,
      tail: "fork",
      pectoral: 0.16,
      playChance: 0.6,
      playTurn: 2.1,
      playSpeedMul: 0.78
    },
    fantail: {
      key: "fantail",
      label: "Fantail",
      length: 62,
      widths: [5.4, 7.8, 9.6, 9.8, 8.8, 7, 5, 3, 1.6],
      colors: { core: "#fff5cf", body: "#ffb52e", fin: "#ffd66b", glow: "#ffae1a" },
      cruiseSpeed: 42,
      maxSpeed: 115,
      turnRate: 2.3,
      accel: 2.2,
      wanderSpread: 1.3,
      wanderInterval: [1.5, 3.5],
      wiggleAmp: 0.075,
      wiggleLag: 0.7,
      idleBeat: 2.2,
      beatPerPx: 0.05,
      maxBend: 0.35,
      senseRadius: 230,
      sparkle: 1,
      tail: "veil",
      pectoral: 0.24,
      playChance: 0.35,
      playTurn: 1.15,
      playSpeedMul: 1.5
    },
    koi: {
      key: "koi",
      label: "Koi",
      length: 90,
      widths: [6, 8.4, 10, 10.4, 9.8, 8.4, 6.4, 4, 2],
      colors: { core: "#fff0f6", body: "#ff7fb0", fin: "#ffaacb", glow: "#ff6aa6" },
      cruiseSpeed: 55,
      maxSpeed: 145,
      turnRate: 1.9,
      accel: 2.6,
      wanderSpread: 0.9,
      wanderInterval: [2, 5],
      wiggleAmp: 0.045,
      wiggleLag: 0.6,
      idleBeat: 1.8,
      beatPerPx: 0.055,
      maxBend: 0.3,
      senseRadius: 250,
      sparkle: 0.7,
      tail: "fan",
      pectoral: 0.17,
      playChance: 0.4,
      playTurn: 0.95,
      playSpeedMul: 1.35
    }
  };
  var ROSTER = [
    {
      form: "comet",
      personality: {
        name: "Sora",
        label: "Daredevil",
        quirk: "daredevil",
        accent: "#c7f4ff",
        mark: "stripe",
        boldness: 0.95,
        greed: 0.55,
        curiosity: 0.82,
        sociability: 0.5,
        patience: 0.22,
        laziness: 0.08,
        agility: 0.96
      }
    },
    {
      form: "comet",
      personality: {
        name: "Mizu",
        label: "Trickster",
        quirk: "trickster",
        accent: "#b4c5ff",
        mark: "star",
        boldness: 0.72,
        greed: 0.5,
        curiosity: 0.98,
        sociability: 0.55,
        patience: 0.55,
        laziness: 0.22,
        agility: 0.86
      }
    },
    {
      form: "fantail",
      personality: {
        name: "Kin",
        label: "Show-off",
        quirk: "showoff",
        accent: "#fff3bd",
        mark: "blush",
        boldness: 0.66,
        greed: 0.45,
        curiosity: 0.78,
        sociability: 0.86,
        patience: 0.7,
        laziness: 0.3,
        agility: 0.54
      }
    },
    {
      form: "fantail",
      personality: {
        name: "Hana",
        label: "Daydreamer",
        quirk: "shy",
        accent: "#ffe6b0",
        mark: "speck",
        boldness: 0.2,
        greed: 0.5,
        curiosity: 0.85,
        sociability: 0.32,
        patience: 0.8,
        laziness: 0.58,
        agility: 0.48
      }
    },
    {
      form: "koi",
      personality: {
        name: "Momo",
        label: "Leader",
        quirk: "leader",
        accent: "#ffd9ec",
        mark: "patch",
        boldness: 0.84,
        greed: 0.6,
        curiosity: 0.6,
        sociability: 0.98,
        patience: 0.88,
        laziness: 0.24,
        agility: 0.6
      }
    },
    {
      form: "koi",
      personality: {
        name: "Yuki",
        label: "Glutton",
        quirk: "glutton",
        accent: "#ffbdd9",
        mark: "spot",
        boldness: 0.6,
        greed: 1,
        curiosity: 0.42,
        sociability: 0.72,
        patience: 0.98,
        laziness: 0.82,
        agility: 0.38
      }
    }
  ];

  // src/pond/math.ts
  var TAU = Math.PI * 2;
  var lerp = (a, b, t) => a + (b - a) * t;
  var clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  var rand = (a = 0, b = 1) => a + Math.random() * (b - a);
  var randInt = (a, b) => Math.floor(rand(a, b + 1));
  var angleDiff = (a, b) => {
    let d = (b - a) % TAU;
    if (d > Math.PI) d -= TAU;
    if (d < -Math.PI) d += TAU;
    return d;
  };
  var damp = (rate, dt) => 1 - Math.exp(-rate * dt);

  // src/pond/fish.ts
  var nextId = 1;
  var Fish = class {
    constructor(formKey, x, y, scale, personality) {
      __publicField(this, "id", nextId++);
      __publicField(this, "form");
      __publicField(this, "personality");
      __publicField(this, "name");
      __publicField(this, "x");
      __publicField(this, "y");
      __publicField(this, "angle");
      __publicField(this, "speed", 0);
      __publicField(this, "angVel", 0);
      __publicField(this, "phase", rand(0, 6));
      __publicField(this, "scale");
      __publicField(this, "spine", []);
      __publicField(this, "hunger", rand(0.42, 0.78));
      __publicField(this, "excite", 0);
      __publicField(this, "state");
      __publicField(this, "stateTimer", rand(0.5, 2));
      __publicField(this, "wanderTarget");
      __publicField(this, "wanderTimer", 0);
      __publicField(this, "target", null);
      __publicField(this, "emitAcc", 0);
      __publicField(this, "seed", rand(0, 100));
      __publicField(this, "fleeX", 0);
      __publicField(this, "fleeY", 0);
      __publicField(this, "restBob", 0);
      // --- Life details ---
      __publicField(this, "timeNow", 0);
      __publicField(this, "mouthOpen", 0);
      __publicField(this, "stretch", 1);
      __publicField(this, "gulpPos", -1);
      __publicField(this, "blinkTimer", rand(1.5, 4));
      __publicField(this, "blinkProg", -1);
      __publicField(this, "lungeTimer", 0);
      __publicField(this, "lungeCooldown", 0);
      __publicField(this, "targetTime", 0);
      // --- Individuality ---
      __publicField(this, "mood", rand(-0.6, 0.6));
      __publicField(this, "moodTimer", rand(4, 9));
      __publicField(this, "confusion", 0);
      __publicField(this, "celebrate", 0);
      __publicField(this, "schooling", false);
      __publicField(this, "beggingNow", false);
      // --- Behaviors ---
      __publicField(this, "behavior", "none");
      __publicField(this, "behaviorTimer", rand(2, 6));
      __publicField(this, "behaviorClock", rand(2, 6));
      __publicField(this, "playDir", 1);
      __publicField(this, "followFish", null);
      // --- Anti-stuck watchdog ---
      __publicField(this, "anchorX");
      __publicField(this, "anchorY");
      __publicField(this, "anchorT", 0);
      __publicField(this, "stuckHits", 0);
      __publicField(this, "lastTargetSpeed", 0);
      this.form = FORMS[formKey];
      this.personality = personality;
      this.name = personality.name;
      this.x = x;
      this.y = y;
      this.anchorX = x;
      this.anchorY = y;
      this.scale = scale;
      this.angle = rand(0, Math.PI * 2);
      this.wanderTarget = this.angle;
      this.state = this.defaultState();
      const n = this.form.widths.length;
      const spacing = this.form.length * scale / (n - 1);
      for (let i = 0; i < n; i++) {
        this.spine.push({
          x: x - Math.cos(this.angle) * spacing * i,
          y: y - Math.sin(this.angle) * spacing * i
        });
      }
    }
    get length() {
      return this.form.length * this.scale;
    }
    actionLabel() {
      if (this.confusion > 0.25) return "Tricked!";
      if (this.state === "startled") return "Spooked";
      if (this.target) return this.target.kind === "decoy" ? "Chasing a ghost" : "Hunting";
      if (this.celebrate > 0.2) return "Celebrating";
      if (this.schooling) return "Schooling";
      if (this.behavior === "play") {
        switch (this.personality.quirk) {
          case "daredevil":
            return "Looping";
          case "trickster":
            return "Zigzagging";
          case "showoff":
            return "Twirling";
          case "shy":
            return "Peeking";
          case "glutton":
            return "Poking around";
          default:
            return "Leading";
        }
      }
      if (this.behavior === "follow") return "Following";
      if (this.state === "rest") return "Dozing";
      if (this.beggingNow) return "Begging";
      return this.mood > 0.35 ? "Feeling frisky" : "Cruising";
    }
    defaultState() {
      return this.form.key === "comet" ? "glide" : "cruise";
    }
    releaseTarget() {
      if (this.target) {
        this.target.claims = Math.max(0, this.target.claims - 1);
        this.target = null;
      }
      this.targetTime = 0;
    }
    /** A shrimp's ghost decoy can steal this fish's attention. */
    forceTarget(food) {
      this.releaseTarget();
      food.claims++;
      this.target = food;
      this.targetTime = 0;
      this.confusion = 0;
      this.behavior = "none";
    }
    /** Called when a shrimp jukes out of a lunge — the fish visibly overshoots. */
    miss(strength = 0.65) {
      const p = this.personality;
      this.confusion = Math.max(this.confusion, strength * (1.15 - p.agility * 0.6));
      this.lungeCooldown = Math.max(this.lungeCooldown, 0.6);
      this.excite = Math.max(this.excite, 0.3);
    }
    startle(fromX, fromY) {
      const dx = this.x - fromX;
      const dy = this.y - fromY;
      const d = Math.hypot(dx, dy) || 1;
      this.fleeX = dx / d;
      this.fleeY = dy / d;
      this.state = "startled";
      this.stateTimer = 0.3 + (1 - this.personality.boldness) * 0.7;
      this.behavior = "none";
      this.releaseTarget();
    }
    updateState(dt, t) {
      const f = this.form;
      const p = this.personality;
      if (this.state === "startled") {
        if (this.stateTimer <= 0) {
          this.state = this.defaultState();
          this.stateTimer = rand(0.5, 1.5);
        }
        return f.maxSpeed * 1.15;
      }
      switch (f.key) {
        case "comet": {
          if (this.stateTimer <= 0) {
            if (this.state === "burst") {
              this.state = "glide";
              this.stateTimer = rand(1.1, 2.8) * (1 - p.boldness * 0.35);
            } else {
              this.state = "burst";
              this.stateTimer = rand(0.3, 0.65) * (0.8 + p.boldness * 0.4);
            }
          }
          return this.state === "burst" ? f.maxSpeed : f.cruiseSpeed * 0.35;
        }
        case "fantail": {
          return f.cruiseSpeed * (1 + 0.3 * Math.sin(t * 0.6 + this.seed));
        }
        case "koi": {
          if (this.stateTimer <= 0) {
            if (this.state === "rest") {
              this.state = "cruise";
              this.stateTimer = rand(5, 10);
            } else if (Math.random() < 0.2 + p.laziness * 0.5 && this.hunger < 0.7) {
              this.state = "rest";
              this.stateTimer = rand(2, 3 + p.laziness * 3);
            } else {
              this.stateTimer = rand(4, 8);
            }
          }
          return this.state === "rest" ? 5 : f.cruiseSpeed;
        }
      }
      void dt;
      return f.cruiseSpeed;
    }
    /** Each personality has its own idea of fun. */
    updateBehavior(dt, env) {
      const f = this.form;
      const p = this.personality;
      if (this.behavior !== "none") {
        this.behaviorTimer -= dt;
        if (this.behaviorTimer <= 0 || this.target || this.state === "startled") {
          this.behavior = "none";
          this.followFish = null;
          this.behaviorClock = rand(3, 8);
        }
        return;
      }
      this.behaviorClock -= dt;
      if (this.behaviorClock > 0) return;
      this.behaviorClock = rand(2.5, 6.5) / (0.65 + p.curiosity * 0.65);
      if (this.target || this.state === "startled" || this.state === "rest" || env.swarm) return;
      const chance = clamp(f.playChance * (0.3 + p.curiosity * 0.8 + this.mood * 0.2 + this.excite * 0.2), 0.05, 0.95);
      if (Math.random() > chance) return;
      if (p.quirk === "shy" && Math.random() < 0.55) return;
      if (p.sociability > 0.6 && p.quirk !== "leader" && Math.random() < 0.45) {
        let best = null;
        let bd = 340;
        for (const o of env.fish) {
          if (o === this) continue;
          const d = Math.hypot(o.x - this.x, o.y - this.y);
          if (d < bd) {
            bd = d;
            best = o;
          }
        }
        if (best) {
          this.behavior = "follow";
          this.followFish = best;
          this.behaviorTimer = rand(4, 7);
          return;
        }
      }
      this.behavior = "play";
      this.playDir = Math.random() < 0.5 ? -1 : 1;
      this.behaviorTimer = p.quirk === "daredevil" ? rand(0.8, 1.5) : p.quirk === "showoff" ? rand(1.8, 3) : p.quirk === "shy" ? rand(0.7, 1.2) : rand(1.2, 2.2);
    }
    update(dt, env) {
      const f = this.form;
      const p = this.personality;
      const t = env.time;
      this.timeNow = t;
      const L = this.length;
      this.hunger = clamp(this.hunger + dt / 105, 0, 1);
      this.excite = Math.max(0, this.excite - dt * 0.55);
      this.confusion = Math.max(0, this.confusion - dt * 0.8);
      this.celebrate = Math.max(0, this.celebrate - dt);
      this.stateTimer -= dt;
      this.wanderTimer -= dt;
      this.lungeTimer = Math.max(0, this.lungeTimer - dt);
      this.lungeCooldown = Math.max(0, this.lungeCooldown - dt);
      this.moodTimer -= dt;
      if (this.moodTimer <= 0) {
        this.moodTimer = rand(5, 11);
        this.mood = rand(-0.8, 1);
      }
      if (this.wanderTimer <= 0) {
        this.wanderTarget = this.angle + rand(-1, 1) * f.wanderSpread * (0.7 + p.curiosity * 0.5);
        this.wanderTimer = rand(f.wanderInterval[0], f.wanderInterval[1]);
      }
      let targetSpeed = this.updateState(dt, t);
      this.updateBehavior(dt, env);
      if (this.target) {
        this.targetTime += dt;
        const timeout = 4 + p.patience * 8;
        if (this.target.eaten || this.target.age > this.target.life || this.targetTime > timeout) {
          this.releaseTarget();
        }
      }
      if (!this.target && this.hunger > 0.06 && this.state !== "startled" && this.confusion < 0.5) {
        const sense = f.senseRadius * (0.42 + this.hunger) * this.scale * (0.72 + p.greed * 0.65);
        let best = null;
        let bestScore = Infinity;
        const decoyPull = (p.curiosity * 0.72 + p.boldness * 0.2 - p.patience * 0.28) * 85;
        for (const fd of env.food) {
          if (fd.eaten) continue;
          const d = Math.hypot(fd.x - this.x, fd.y - this.y);
          if (d > sense) continue;
          const score = d + fd.claims * 90 - (fd.kind === "decoy" ? decoyPull : 0);
          if (score < bestScore) {
            bestScore = score;
            best = fd;
          }
        }
        if (best) {
          best.claims++;
          this.target = best;
          this.targetTime = 0;
          this.behavior = "none";
          if (this.state === "rest") {
            this.state = "cruise";
            this.stateTimer = rand(4, 8);
          }
        }
      }
      let foodDist = Infinity;
      let foodAngDiff = 0;
      if (this.target) {
        foodDist = Math.hypot(this.target.x - this.x, this.target.y - this.y);
        foodAngDiff = Math.abs(
          angleDiff(this.angle, Math.atan2(this.target.y - this.y, this.target.x - this.x))
        );
      }
      if (this.target && this.confusion < 0.2 && this.lungeCooldown <= 0 && foodDist < 62 * this.scale && foodDist > 11 * this.scale && foodAngDiff < 0.32 + p.agility * 0.28) {
        this.lungeTimer = 0.22;
        this.lungeCooldown = 0.7 + (1 - p.boldness) * 0.4;
      }
      let sx = Math.cos(this.wanderTarget) + Math.cos(this.angle) * 0.6;
      let sy = Math.sin(this.wanderTarget) + Math.sin(this.angle) * 0.6;
      if (f.key === "fantail") {
        const sway = Math.sin(t * 0.9 + this.seed) * (0.3 + (p.quirk === "showoff" ? 0.3 : 0));
        sx += Math.cos(this.angle + Math.PI / 2) * sway;
        sy += Math.sin(this.angle + Math.PI / 2) * sway;
      }
      if (this.behavior === "play" && !this.target) {
        if (p.quirk === "trickster") {
          const zig = Math.sin(t * 5.5 + this.seed) > 0 ? 1 : -1;
          sx += Math.cos(this.angle + zig * 1.25) * 2.4;
          sy += Math.sin(this.angle + zig * 1.25) * 2.4;
        } else if (p.quirk === "shy") {
          const peek = Math.sin(t * 2.2 + this.seed) * 0.8;
          sx += Math.cos(this.angle + this.playDir * peek) * 1.2;
          sy += Math.sin(this.angle + this.playDir * peek) * 1.2;
        } else {
          const turn = this.angle + this.playDir * f.playTurn * (0.65 + p.agility * 0.5);
          sx += Math.cos(turn) * 2.6;
          sy += Math.sin(turn) * 2.6;
        }
        targetSpeed = Math.max(
          targetSpeed,
          f.key === "comet" ? f.maxSpeed * f.playSpeedMul : f.cruiseSpeed * f.playSpeedMul
        );
      }
      if (this.behavior === "follow" && this.followFish && !this.target) {
        const o = this.followFish;
        const tx = o.x - Math.cos(o.angle) * o.length * 1.15;
        const ty = o.y - Math.sin(o.angle) * o.length * 1.15;
        const dx = tx - this.x;
        const dy = ty - this.y;
        const d = Math.hypot(dx, dy) || 1;
        sx += dx / d * 2.8;
        sy += dy / d * 2.8;
        targetSpeed = Math.max(targetSpeed, Math.min(f.maxSpeed * 0.8, o.speed * 1.1 + 14));
        if (d < o.length * 0.55) targetSpeed = Math.min(targetSpeed, o.speed * 0.9);
      }
      const begThreshold = 0.8 - p.greed * 0.28;
      const begging = !this.target && this.hunger > begThreshold && env.pointer.inside && this.state !== "startled" && this.state !== "rest" && !env.swarm;
      this.beggingNow = begging;
      if (begging) {
        const dx = env.pointer.x - this.x;
        const dy = env.pointer.y - this.y;
        const d = Math.hypot(dx, dy) || 1;
        if (d > 85) {
          sx += dx / d * (1.6 + p.greed * 1.2);
          sy += dy / d * (1.6 + p.greed * 1.2);
          targetSpeed = Math.max(targetSpeed, f.cruiseSpeed * 1.15);
        } else {
          sx += -dy / d * 1.6 + dx / d * 0.4;
          sy += dx / d * 1.6 + dy / d * 0.4;
          targetSpeed = Math.max(targetSpeed, f.cruiseSpeed * 0.7);
        }
      } else if (!this.target && !env.swarm && env.pointer.inside && p.curiosity > 0.65 && this.state !== "startled" && this.mood > 0) {
        const dx = env.pointer.x - this.x;
        const dy = env.pointer.y - this.y;
        const d = Math.hypot(dx, dy) || 1;
        if (d > 120) {
          sx += dx / d * (p.curiosity - 0.55) * 0.7;
          sy += dy / d * (p.curiosity - 0.55) * 0.7;
        }
      }
      this.schooling = false;
      const swarm = env.swarm;
      if (swarm && this.state !== "startled" && this.confusion < 0.6) {
        const dx = swarm.x - this.x;
        const dy = swarm.y - this.y;
        const d = Math.hypot(dx, dy) || 1;
        const radial = clamp(d / 150, 0, 1);
        const orbitDir = this.id % 2 === 0 ? 1 : -1;
        const ox = -dy / d * orbitDir;
        const oy = dx / d * orbitDir;
        const weight = (0.7 + p.sociability * 2.6) * (this.target ? 0.55 : 1.15);
        sx += (dx / d * radial * 1.4 + ox * 1.15) * weight;
        sy += (dy / d * radial * 1.4 + oy * 1.15) * weight;
        targetSpeed = Math.max(targetSpeed, f.cruiseSpeed * (1.05 + p.sociability * 0.65));
        this.schooling = d < 230;
        this.excite = Math.max(this.excite, 0.2);
      }
      const m = 80 + L * 0.5;
      let bx = 0;
      let by = 0;
      if (this.x < m) bx += (m - this.x) / m;
      if (this.x > env.width - m) bx -= (this.x - (env.width - m)) / m;
      if (this.y < m) by += (m - this.y) / m;
      if (this.y > env.height - m) by -= (this.y - (env.height - m)) / m;
      const wallWeight = this.target ? 1.1 : 3.2;
      sx += bx * wallWeight;
      sy += by * wallWeight;
      const sepWeight = p.quirk === "shy" ? 2.1 : 1.4;
      for (const o of env.fish) {
        if (o === this) continue;
        const dx = this.x - o.x;
        const dy = this.y - o.y;
        const d = Math.hypot(dx, dy);
        const r = (L + o.length) * (p.quirk === "shy" ? 0.62 : 0.5);
        if (d > 0 && d < r) {
          const k = (1 - d / r) * sepWeight;
          sx += dx / d * k;
          sy += dy / d * k;
        }
      }
      if (this.target) {
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const d = Math.hypot(dx, dy) || 1;
        const urgency = 0.5 + this.hunger;
        sx += dx / d * (3.4 + p.greed * 1.8);
        sy += dy / d * (3.4 + p.greed * 1.8);
        targetSpeed = Math.max(targetSpeed, f.maxSpeed * clamp(0.55 * urgency * (0.85 + p.greed * 0.3), 0.5, 0.95));
        if (this.lungeTimer > 0) targetSpeed = Math.max(targetSpeed, f.maxSpeed * 1.2);
        if (d < 40 * this.scale) targetSpeed *= 0.55 + d / (80 * this.scale);
        if (d < 8 * this.scale + this.target.size) this.eat(env);
      }
      if (this.state === "startled") {
        sx += this.fleeX * 6;
        sy += this.fleeY * 6;
      }
      if (this.confusion > 0) {
        const wobble = Math.sin(t * 20 + this.seed) * this.confusion;
        sx += Math.cos(this.angle + Math.PI / 2) * wobble * 2.2;
        sy += Math.sin(this.angle + Math.PI / 2) * wobble * 2.2;
        targetSpeed *= 1 - 0.45 * this.confusion;
      }
      targetSpeed *= (1 - p.laziness * 0.28) * (1 + this.mood * 0.12);
      const desired = Math.atan2(sy, sx);
      const diff = angleDiff(this.angle, desired);
      const turnRate = f.turnRate * (0.72 + p.agility * 0.55) * (this.state === "startled" ? 1.5 : 1);
      const targetAngVel = clamp(diff * 3.6, -turnRate, turnRate);
      this.angVel = lerp(this.angVel, targetAngVel, damp(5.5, dt));
      this.angle += this.angVel * dt;
      const turnPenalty = 1 - clamp(Math.abs(this.angVel) / turnRate, 0, 1) * 0.35;
      this.speed = lerp(this.speed, Math.max(6, targetSpeed * turnPenalty), damp(f.accel, dt));
      this.lastTargetSpeed = targetSpeed;
      this.x += Math.cos(this.angle) * this.speed * dt;
      this.y += Math.sin(this.angle) * this.speed * dt;
      if (this.state === "rest") {
        this.restBob += dt;
        this.y += Math.sin(this.restBob * 1.6) * 2.5 * dt;
      }
      const pad = 12;
      this.x = clamp(this.x, pad, env.width - pad);
      this.y = clamp(this.y, pad, env.height - pad);
      this.anchorT += dt;
      if (this.anchorT > 0.7) {
        const moved = Math.hypot(this.x - this.anchorX, this.y - this.anchorY);
        const wantsMove = this.lastTargetSpeed > 24 && this.state !== "rest";
        this.stuckHits = wantsMove && moved < 5 ? this.stuckHits + 1 : 0;
        this.anchorX = this.x;
        this.anchorY = this.y;
        this.anchorT = 0;
        if (this.stuckHits >= 2) {
          this.stuckHits = 0;
          this.releaseTarget();
          const a = rand(0, Math.PI * 2);
          this.fleeX = Math.cos(a);
          this.fleeY = Math.sin(a);
          this.state = "startled";
          this.stateTimer = 0.55;
          this.wanderTimer = 0;
        }
      }
      let mouthWant = 0;
      if (this.target) {
        mouthWant = clamp(1.15 - foodDist / (120 * this.scale), 0, 1);
      } else if (begging) {
        mouthWant = 0.4;
      } else if (this.confusion > 0.1) {
        mouthWant = this.confusion * 0.55;
      } else if (this.state === "rest") {
        const cyc = (t + this.seed * 3) % 6;
        if (cyc < 1.3) mouthWant = Math.sin(cyc / 1.3 * Math.PI) * 0.85;
      }
      this.mouthOpen = lerp(this.mouthOpen, mouthWant, damp(9, dt));
      this.blinkTimer -= dt;
      if (this.blinkTimer <= 0) {
        this.blinkTimer = rand(2.2, 5.5);
        this.blinkProg = 0;
      }
      if (this.blinkProg >= 0) {
        this.blinkProg += dt / 0.22;
        if (this.blinkProg >= 1) this.blinkProg = -1;
      }
      if (this.gulpPos >= 0) {
        this.gulpPos += dt * 7;
        if (this.gulpPos > this.spine.length + 1) this.gulpPos = -1;
      }
      const stretchWant = this.lungeTimer > 0 ? 1.08 : 1;
      this.stretch = lerp(this.stretch, stretchWant, damp(12, dt));
      if (this.state === "rest" && Math.random() < dt * 0.25) {
        env.emit(
          this.x + Math.cos(this.angle) * 8 * this.scale,
          this.y + Math.sin(this.angle) * 8 * this.scale,
          "puff",
          "#bff6ff",
          1
        );
      }
      this.phase += dt * (f.idleBeat + this.speed * f.beatPerPx) * (1 + this.excite * 0.9 + this.confusion * 0.5 + Math.max(0, this.mood) * 0.15);
      this.updateSpine();
      this.emitAcc += dt * (0.6 + this.speed * 0.045) * f.sparkle * (1 + this.excite + (this.schooling ? 0.4 : 0));
      while (this.emitAcc > 1) {
        this.emitAcc -= 1;
        const tail = this.spine[this.spine.length - 1];
        env.emit(tail.x + rand(-4, 4), tail.y + rand(-4, 4), "trail", f.colors.fin);
      }
    }
    eat(env) {
      const food = this.target;
      if (!food) return;
      if (food.kind === "decoy") {
        food.eaten = true;
        this.releaseTarget();
        this.confusion = 1.15;
        this.excite = 0.75;
        this.gulpPos = -1;
        env.emit(food.x, food.y, "puff", "#cffafe", 5);
        env.emit(food.x, food.y, "spark", "#ffffff", 4);
        env.onEat(this, food, "decoy");
        return;
      }
      food.eaten = true;
      this.releaseTarget();
      this.hunger = Math.max(0, this.hunger - 0.2 - this.personality.greed * 0.1);
      this.excite = 1;
      this.celebrate = 1.2;
      this.gulpPos = 0;
      this.confusion = 0;
      if (this.personality.quirk === "daredevil" || this.personality.quirk === "showoff" || Math.random() < 0.35) {
        this.behavior = "play";
        this.behaviorTimer = 0.9;
        this.playDir = Math.random() < 0.5 ? -1 : 1;
      }
      env.emit(this.x, this.y, "spark", this.form.colors.core, 14);
      env.emit(this.x, this.y, "puff", "#dff9ff", 3);
      env.onEat(this, food, "finish");
    }
    updateSpine() {
      const f = this.form;
      const n = this.spine.length;
      const spacing = this.length * this.stretch / (n - 1);
      this.spine[0].x = this.x;
      this.spine[0].y = this.y;
      let prevDir = this.angle + Math.PI;
      for (let i = 1; i < n; i++) {
        const prev = this.spine[i - 1];
        const cur = this.spine[i];
        let ang = Math.atan2(cur.y - prev.y, cur.x - prev.x);
        if (!Number.isFinite(ang)) ang = prevDir;
        const dd = angleDiff(prevDir, ang);
        ang = prevDir + clamp(dd, -f.maxBend, f.maxBend);
        cur.x = prev.x + Math.cos(ang) * spacing;
        cur.y = prev.y + Math.sin(ang) * spacing;
        prevDir = ang;
      }
    }
    computePoints() {
      const f = this.form;
      const n = this.spine.length;
      const L = this.length * this.stretch;
      const pts = [];
      const turnBoost = 1 + Math.min(0.6, Math.abs(this.angVel) * 0.22);
      const amp = f.wiggleAmp * L * (1 + this.excite * 0.7 + this.confusion * 0.35) * turnBoost;
      for (let i = 0; i < n; i++) {
        const p = this.spine[i];
        let dx;
        let dy;
        if (i === 0) {
          dx = Math.cos(this.angle);
          dy = Math.sin(this.angle);
        } else {
          const q = this.spine[i - 1];
          const d = Math.hypot(q.x - p.x, q.y - p.y) || 1;
          dx = (q.x - p.x) / d;
          dy = (q.y - p.y) / d;
        }
        const nx = -dy;
        const ny = dx;
        const tt = i / (n - 1);
        const wig = Math.sin(this.phase - i * f.wiggleLag) * amp * Math.pow(tt, 1.3);
        const breathe = 1 + 0.035 * Math.sin(this.timeNow * 2.2 + this.seed + i * 0.35);
        let bulge = 0;
        if (this.gulpPos >= 0) {
          const dseg = i - this.gulpPos;
          bulge = Math.exp(-(dseg * dseg) / 1.1) * 0.45;
        }
        const w = f.widths[i] * this.scale * breathe * (1 + bulge);
        pts.push({ x: p.x + nx * wig, y: p.y + ny * wig, dx, dy, nx, ny, w });
      }
      return pts;
    }
    draw(ctx) {
      const f = this.form;
      const pts = this.computePoints();
      const n = pts.length;
      const L = this.length * this.stretch;
      const head = pts[0];
      const tail = pts[n - 1];
      ctx.save();
      ctx.shadowColor = f.colors.glow;
      ctx.shadowBlur = 16 * this.scale;
      this.drawTail(ctx, pts, L);
      this.drawPectorals(ctx, pts, L);
      const outline = [];
      outline.push({ x: head.x + head.dx * head.w * 1.25, y: head.y + head.dy * head.w * 1.25 });
      for (let i = 0; i < n; i++) outline.push({ x: pts[i].x + pts[i].nx * pts[i].w, y: pts[i].y + pts[i].ny * pts[i].w });
      for (let i = n - 1; i >= 0; i--) outline.push({ x: pts[i].x - pts[i].nx * pts[i].w, y: pts[i].y - pts[i].ny * pts[i].w });
      const grad = ctx.createLinearGradient(head.x, head.y, tail.x, tail.y);
      grad.addColorStop(0, f.colors.core);
      grad.addColorStop(0.35, f.colors.body);
      grad.addColorStop(1, f.colors.fin);
      ctx.fillStyle = grad;
      closedSmooth(ctx, outline);
      ctx.fill();
      ctx.shadowBlur = 0;
      const core = [];
      core.push({ x: head.x + head.dx * head.w * 0.7, y: head.y + head.dy * head.w * 0.7 });
      for (let i = 0; i < n - 1; i++) core.push({ x: pts[i].x + pts[i].nx * pts[i].w * 0.42, y: pts[i].y + pts[i].ny * pts[i].w * 0.42 });
      for (let i = n - 2; i >= 0; i--) core.push({ x: pts[i].x - pts[i].nx * pts[i].w * 0.42, y: pts[i].y - pts[i].ny * pts[i].w * 0.42 });
      ctx.globalAlpha = 0.75;
      ctx.fillStyle = f.colors.core;
      closedSmooth(ctx, core);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = "rgba(255,255,255,0.55)";
      ctx.lineWidth = 1.2 * this.scale;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(pts[1].x, pts[1].y);
      for (let i = 2; i < n - 1; i++) ctx.lineTo(pts[i].x, pts[i].y);
      ctx.stroke();
      this.drawMark(ctx, pts);
      const blinkAmt = this.blinkProg >= 0 ? Math.sin(this.blinkProg * Math.PI) : 0;
      const ex = head.x + head.dx * head.w * 0.25;
      const ey = head.y + head.dy * head.w * 0.25;
      const er = Math.max(1.2, head.w * 0.22);
      ctx.fillStyle = "#0b1424";
      for (const s of [-1, 1]) {
        ctx.beginPath();
        ctx.ellipse(
          ex + head.nx * head.w * 0.58 * s,
          ey + head.ny * head.w * 0.58 * s,
          er,
          Math.max(0.25, er * (1 - blinkAmt * 0.88)),
          this.angle,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
      if (blinkAmt < 0.5) {
        ctx.fillStyle = "rgba(255,255,255,0.9)";
        for (const s of [-1, 1]) {
          ctx.beginPath();
          ctx.arc(ex + head.nx * head.w * 0.58 * s + head.dx * er * 0.4, ey + head.ny * head.w * 0.58 * s + head.dy * er * 0.4, er * 0.4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      if (this.mouthOpen > 0.03) {
        const mx = head.x + head.dx * head.w * 0.98;
        const my = head.y + head.dy * head.w * 0.98;
        ctx.fillStyle = "rgba(10, 18, 34, 0.88)";
        ctx.beginPath();
        ctx.ellipse(mx, my, head.w * (0.16 + 0.5 * this.mouthOpen), head.w * (0.09 + 0.42 * this.mouthOpen), this.angle, 0, Math.PI * 2);
        ctx.fill();
        if (this.mouthOpen > 0.45) {
          ctx.fillStyle = "rgba(255, 170, 190, 0.5)";
          ctx.beginPath();
          ctx.ellipse(mx, my, head.w * 0.3 * this.mouthOpen, head.w * 0.18 * this.mouthOpen, this.angle, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      if (this.confusion > 0.35) {
        ctx.globalAlpha = clamp(this.confusion, 0, 1);
        ctx.fillStyle = "#e0faff";
        ctx.font = `700 ${Math.round(13 * this.scale)}px ui-sans-serif, system-ui, sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText("?!", head.x + Math.cos(this.angle - Math.PI / 2) * 20, head.y + Math.sin(this.angle - Math.PI / 2) * 20);
        ctx.globalAlpha = 1;
      }
      ctx.restore();
    }
    /** Every personality wears its own little marking. */
    drawMark(ctx, pts) {
      const p = pts[3];
      const w = p.w;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(this.angle);
      ctx.fillStyle = this.personality.accent;
      ctx.globalAlpha = 0.42;
      switch (this.personality.mark) {
        case "stripe":
          ctx.fillRect(-w * 0.22, -w * 0.85, w * 0.44, w * 1.7);
          break;
        case "spot":
          ctx.beginPath();
          ctx.arc(0, 0, w * 0.46, 0, Math.PI * 2);
          ctx.fill();
          break;
        case "blush":
          for (const s of [-1, 1]) {
            ctx.beginPath();
            ctx.arc(0, s * w * 0.62, w * 0.28, 0, Math.PI * 2);
            ctx.fill();
          }
          break;
        case "speck":
          for (const [dx, dy, r] of [[-w * 0.4, -w * 0.3, 0.17], [0, w * 0.28, 0.2], [w * 0.45, -w * 0.2, 0.14]]) {
            ctx.beginPath();
            ctx.arc(dx, dy, w * r, 0, Math.PI * 2);
            ctx.fill();
          }
          break;
        case "star": {
          ctx.beginPath();
          for (let i = 0; i < 8; i++) {
            const a = i / 8 * Math.PI * 2 - Math.PI / 2;
            const r = w * (i % 2 === 0 ? 0.62 : 0.22);
            const x = Math.cos(a) * r;
            const y = Math.sin(a) * r;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
          ctx.fill();
          break;
        }
        case "patch":
          ctx.beginPath();
          ctx.ellipse(-w * 0.18, -w * 0.08, w * 0.5, w * 0.72, 0.5, 0, Math.PI * 2);
          ctx.fill();
          break;
      }
      ctx.restore();
    }
    drawPectorals(ctx, pts, L) {
      const f = this.form;
      const p = pts[2];
      const bx = -p.dx;
      const by = -p.dy;
      const size = f.pectoral * L;
      ctx.fillStyle = f.colors.fin;
      ctx.globalAlpha = 0.7;
      for (const s of [-1, 1]) {
        const flutter = 1 + (0.3 + this.excite * 0.35 + (this.personality.quirk === "showoff" ? 0.15 : 0)) * Math.sin(this.phase * 1.4 + s * 0.6);
        const nx = p.nx * s;
        const ny = p.ny * s;
        const baseX = p.x + nx * p.w * 0.75;
        const baseY = p.y + ny * p.w * 0.75;
        const tipX = baseX + nx * size * flutter + bx * size * 0.7;
        const tipY = baseY + ny * size * flutter + by * size * 0.7;
        const c1x = baseX + nx * size * 0.35 * flutter - bx * size * 0.25;
        const c1y = baseY + ny * size * 0.35 * flutter - by * size * 0.25;
        const c2x = baseX + nx * size * 0.5 * flutter + bx * size * 1;
        const c2y = baseY + ny * size * 0.5 * flutter + by * size * 1;
        ctx.beginPath();
        ctx.moveTo(baseX, baseY);
        ctx.quadraticCurveTo(c1x, c1y, tipX, tipY);
        ctx.quadraticCurveTo(c2x, c2y, baseX, baseY);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    drawTail(ctx, pts, L) {
      const f = this.form;
      const n = pts.length;
      const T = pts[n - 1];
      const bx = -T.dx;
      const by = -T.dy;
      const tailWave = Math.sin(this.phase - n * f.wiggleLag);
      ctx.fillStyle = f.colors.fin;
      if (f.tail === "fork") {
        const len = 0.36 * L;
        ctx.globalAlpha = 0.8;
        for (const s of [-1, 1]) {
          const spread = 0.5 * s + tailWave * 0.2;
          const dirX = bx * Math.cos(spread) - by * Math.sin(spread);
          const dirY = bx * Math.sin(spread) + by * Math.cos(spread);
          const tipX = T.x + dirX * len;
          const tipY = T.y + dirY * len;
          ctx.beginPath();
          ctx.moveTo(T.x, T.y);
          ctx.quadraticCurveTo(T.x + dirX * len * 0.5 + T.nx * s * len * 0.15, T.y + dirY * len * 0.5 + T.ny * s * len * 0.15, tipX, tipY);
          ctx.quadraticCurveTo(T.x + bx * len * 0.45, T.y + by * len * 0.45, T.x, T.y);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      } else if (f.tail === "veil") {
        ctx.globalAlpha = 0.55;
        for (const s of [-1, 0, 1]) {
          const len = 0.62 * L * (s === 0 ? 1.1 : 0.9);
          const lateral = s * 0.4 + Math.sin(this.phase * 0.8 - 1.2 + s * 0.8) * 0.18;
          const wave2 = Math.sin(this.phase * 0.8 - 2.6 + s * 0.8) * 0.25;
          const width = 0.09 * L;
          const c1x = T.x + bx * len * 0.35 + T.nx * lateral * len * 0.5;
          const c1y = T.y + by * len * 0.35 + T.ny * lateral * len * 0.5;
          const c2x = T.x + bx * len * 0.75 + T.nx * (lateral + wave2) * len;
          const c2y = T.y + by * len * 0.75 + T.ny * (lateral + wave2) * len;
          const tipX = T.x + bx * len + T.nx * (lateral * 1.2 + wave2) * len;
          const tipY = T.y + by * len + T.ny * (lateral * 1.2 + wave2) * len;
          ctx.beginPath();
          ctx.moveTo(T.x, T.y);
          ctx.bezierCurveTo(c1x + T.nx * width * 0.5, c1y + T.ny * width * 0.5, c2x + T.nx * width, c2y + T.ny * width, tipX, tipY);
          ctx.bezierCurveTo(c2x - T.nx * width, c2y - T.ny * width, c1x - T.nx * width * 0.5, c1y - T.ny * width * 0.5, T.x, T.y);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      } else {
        const len = 0.3 * L;
        const flare = 0.75 + tailWave * 0.12;
        ctx.globalAlpha = 0.75;
        const tip1x = T.x + (bx * Math.cos(flare) - by * Math.sin(flare)) * len;
        const tip1y = T.y + (bx * Math.sin(flare) + by * Math.cos(flare)) * len;
        const tip2x = T.x + (bx * Math.cos(-flare) - by * Math.sin(-flare)) * len;
        const tip2y = T.y + (bx * Math.sin(-flare) + by * Math.cos(-flare)) * len;
        const midX = T.x + bx * len * 0.85 + T.nx * tailWave * len * 0.2;
        const midY = T.y + by * len * 0.85 + T.ny * tailWave * len * 0.2;
        ctx.beginPath();
        ctx.moveTo(T.x, T.y);
        ctx.lineTo(tip1x, tip1y);
        ctx.quadraticCurveTo(midX, midY, tip2x, tip2y);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }
  };
  function closedSmooth(ctx, p) {
    const n = p.length;
    ctx.beginPath();
    ctx.moveTo((p[0].x + p[1].x) / 2, (p[0].y + p[1].y) / 2);
    for (let i = 1; i <= n; i++) {
      const a = p[i % n];
      const b = p[(i + 1) % n];
      ctx.quadraticCurveTo(a.x, a.y, (a.x + b.x) / 2, (a.y + b.y) / 2);
    }
    ctx.closePath();
  }

  // src/pond/pond.ts
  var Pond = class {
    constructor() {
      __publicField(this, "width", 0);
      __publicField(this, "height", 0);
      __publicField(this, "time", 0);
      __publicField(this, "fish", []);
      __publicField(this, "food", []);
      __publicField(this, "particles", []);
      __publicField(this, "ripples", []);
      __publicField(this, "texts", []);
      __publicField(this, "pointer", { x: -1e3, y: -1e3, inside: false });
      __publicField(this, "swarm", null);
      __publicField(this, "stats", { dropped: 0, eaten: 0 });
      __publicField(this, "onStats");
      __publicField(this, "bg", null);
      __publicField(this, "foodId", 0);
      __publicField(this, "initialized", false);
      __publicField(this, "combo", 0);
      __publicField(this, "lastEatAt", -10);
      __publicField(this, "swarmCooldown", rand(7, 12));
      __publicField(this, "emit", (x, y, kind, color, count = 1) => {
        for (let i = 0; i < count; i++) {
          if (this.particles.length > 900) return;
          if (kind === "trail") {
            this.particles.push({
              x,
              y,
              vx: rand(-6, 6),
              vy: rand(-6, 6),
              life: rand(0.9, 1.8),
              maxLife: 1.8,
              size: rand(0.8, 2),
              color,
              kind,
              seed: rand(0, 100)
            });
          } else if (kind === "puff") {
            this.particles.push({
              x,
              y,
              vx: rand(-5, 5),
              vy: -rand(10, 20),
              life: rand(1.2, 2),
              maxLife: 2,
              size: rand(1.6, 3.2),
              color,
              kind,
              seed: rand(0, 100)
            });
          } else {
            const a = rand(0, Math.PI * 2);
            const s = rand(20, 80);
            this.particles.push({
              x,
              y,
              vx: Math.cos(a) * s,
              vy: Math.sin(a) * s,
              life: rand(0.4, 0.9),
              maxLife: 0.9,
              size: rand(1, 2.4),
              color,
              kind,
              seed: rand(0, 100)
            });
          }
        }
      });
    }
    resize(w, h, dpr) {
      const first = !this.initialized;
      this.width = w;
      this.height = h;
      if (!this.bg) this.buildBackground(dpr);
      if (first) {
        this.initialized = true;
        this.spawnFish();
        this.spawnAmbient();
      } else {
        for (const f of this.fish) {
          f.x = clamp(f.x, 20, w - 20);
          f.y = clamp(f.y, 20, h - 20);
        }
      }
    }
    spawnFish() {
      const scale = clamp(Math.min(this.width, this.height) / 620, 0.72, 1.15);
      ROSTER.forEach((spec, i) => {
        const x = rand(this.width * 0.2, this.width * 0.8);
        const y = rand(this.height * 0.2, this.height * 0.8);
        const s = scale * (i < 3 ? 1 : 0.86) * (spec.personality.quirk === "glutton" ? 1.08 : 1);
        this.fish.push(new Fish(spec.form, x, y, s, spec.personality));
      });
    }
    spawnAmbient() {
      const area = this.width * this.height / (900 * 600);
      const motes = Math.round(36 * area);
      for (let i = 0; i < motes; i++) {
        this.particles.push({
          x: rand(0, this.width),
          y: rand(0, this.height),
          vx: rand(-4, 4),
          vy: rand(-6, 2),
          life: Infinity,
          maxLife: Infinity,
          size: rand(0.6, 1.8),
          color: Math.random() < 0.3 ? "#67e8f9" : "#cfeeff",
          kind: "mote",
          seed: rand(0, 100)
        });
      }
      const bubbles = Math.round(10 * area);
      for (let i = 0; i < bubbles; i++) this.particles.push(this.makeBubble(true));
    }
    makeBubble(anywhere = false) {
      return {
        x: rand(0, this.width),
        y: anywhere ? rand(0, this.height) : this.height + 10,
        vx: 0,
        vy: -rand(10, 26),
        life: Infinity,
        maxLife: Infinity,
        size: rand(1.5, 4),
        color: "#bff6ff",
        kind: "bubble",
        seed: rand(0, 100)
      };
    }
    buildBackground(dpr) {
      const c = document.createElement("canvas");
      c.width = Math.max(1, Math.round(this.width * dpr));
      c.height = Math.max(1, Math.round(this.height * dpr));
      const ctx = c.getContext("2d");
      ctx.scale(dpr, dpr);
      const W = this.width;
      const H = this.height;
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, "#1a2338");
      g.addColorStop(0.3, "#15354a");
      g.addColorStop(0.65, "#0f5a70");
      g.addColorStop(0.9, "#0a8ba5");
      g.addColorStop(1, "#0fb7d4");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      const r = ctx.createRadialGradient(W * 0.5, H * 0.46, 0, W * 0.5, H * 0.46, Math.max(W, H) * 0.5);
      r.addColorStop(0, "rgba(140, 215, 235, 0.22)");
      r.addColorStop(0.5, "rgba(100, 190, 215, 0.08)");
      r.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = r;
      ctx.fillRect(0, 0, W, H);
      const v = ctx.createRadialGradient(W * 0.5, H * 0.5, Math.min(W, H) * 0.35, W * 0.5, H * 0.5, Math.max(W, H) * 0.75);
      v.addColorStop(0, "rgba(0,0,0,0)");
      v.addColorStop(1, "rgba(3, 10, 20, 0.45)");
      ctx.fillStyle = v;
      ctx.fillRect(0, 0, W, H);
      this.bg = c;
    }
    // ---------- Interaction: release live shrimp ----------
    dropFood(x, y, count, scatter = 18) {
      for (let i = 0; i < count; i++) {
        const a = rand(0, Math.PI * 2);
        const d = Math.sqrt(Math.random()) * scatter;
        const heading = rand(0, Math.PI * 2);
        this.food.push({
          id: this.foodId++,
          kind: "shrimp",
          x: clamp(x + Math.cos(a) * d, 10, this.width - 10),
          y: clamp(y + Math.sin(a) * d, 10, this.height - 10),
          vx: Math.cos(heading) * rand(25, 60),
          vy: Math.sin(heading) * rand(25, 60),
          age: 0,
          life: rand(22, 32),
          size: rand(2.5, 3.4),
          claims: 0,
          eaten: false,
          sway: rand(0, 6),
          heading,
          energy: rand(0.78, 1),
          turnT: rand(0.2, 0.7),
          trickCooldown: rand(1.2, 2.6),
          trick: "none",
          trickTimer: 0,
          trickSide: Math.random() < 0.5 ? -1 : 1,
          trickTurned: false,
          shimmer: 1
        });
      }
      this.stats.dropped += count;
      this.onStats?.({ ...this.stats });
      if (count >= 3 && !this.swarm && this.swarmCooldown <= 0) this.startSwarm(x, y);
    }
    splash(x, y) {
      this.ripples.push({ x, y, r: 4, maxR: rand(34, 48), life: 0.8, maxLife: 0.8 });
      this.ripples.push({ x, y, r: 2, maxR: rand(16, 24), life: 0.5, maxLife: 0.5 });
      this.emit(x, y, "spark", "#cffafe", 6);
      for (const f of this.fish) {
        const d = Math.hypot(f.x - x, f.y - y);
        if (d < (22 + (1 - f.personality.boldness) * 32) * f.scale) f.startle(x, y);
      }
    }
    sprinkle() {
      const n = randInt(5, 8);
      for (let i = 0; i < n; i++) {
        const x = rand(this.width * 0.12, this.width * 0.88);
        const y = rand(this.height * 0.14, this.height * 0.72);
        this.dropFood(x, y, 1, 0);
        this.ripples.push({ x, y, r: 2, maxR: rand(12, 20), life: 0.5, maxLife: 0.5 });
      }
      if (!this.swarm && this.swarmCooldown <= 0) {
        this.startSwarm(rand(this.width * 0.35, this.width * 0.65), rand(this.height * 0.35, this.height * 0.65));
      }
    }
    hoveredFish() {
      if (!this.pointer.inside) return null;
      let best = null;
      let bestD = Infinity;
      for (const f of this.fish) {
        for (let i = 0; i < f.spine.length; i += 2) {
          const p = f.spine[i];
          const d = Math.hypot(p.x - this.pointer.x, p.y - this.pointer.y);
          if (d < 18 * f.scale && d < bestD) {
            bestD = d;
            best = f;
          }
        }
      }
      return best;
    }
    // ---------- Swarm ----------
    startSwarm(x, y) {
      const leader = this.fish.find((f) => f.personality.quirk === "leader") || this.fish[0];
      this.swarm = {
        x: clamp(x, 90, this.width - 90),
        y: clamp(y, 80, this.height - 90),
        life: 7,
        maxLife: 7,
        leaderId: leader ? leader.id : -1,
        radius: 78
      };
      this.swarmCooldown = 24;
      this.emit(this.swarm.x, this.swarm.y, "spark", "#7dd3fc", 14);
      this.ripples.push({ x: this.swarm.x, y: this.swarm.y, r: 6, maxR: 75, life: 0.9, maxLife: 0.9 });
    }
    updateSwarm(dt) {
      if (!this.swarm) {
        this.swarmCooldown -= dt;
        if (this.swarmCooldown <= 0) {
          this.startSwarm(rand(this.width * 0.25, this.width * 0.75), rand(this.height * 0.25, this.height * 0.75));
        }
        return;
      }
      const s = this.swarm;
      s.life -= dt;
      const shrimp = this.food.filter((fd) => fd.kind === "shrimp" && !fd.eaten);
      if (shrimp.length) {
        let ax = 0;
        let ay = 0;
        for (const fd of shrimp) {
          ax += fd.x;
          ay += fd.y;
        }
        ax /= shrimp.length;
        ay /= shrimp.length;
        const k = damp(0.55, dt);
        s.x = lerp(s.x, ax, k);
        s.y = lerp(s.y, ay, k);
      } else {
        const leader = this.fish.find((f) => f.id === s.leaderId);
        if (leader) {
          const k = damp(0.28, dt);
          s.x = lerp(s.x, leader.x + Math.cos(leader.angle) * 35, k);
          s.y = lerp(s.y, leader.y + Math.sin(leader.angle) * 35, k);
        } else {
          s.x += Math.sin(this.time * 0.6) * 12 * dt;
          s.y += Math.cos(this.time * 0.45) * 9 * dt;
        }
      }
      s.x = clamp(s.x, 70, this.width - 70);
      s.y = clamp(s.y, 70, this.height - 70);
      if (Math.random() < dt * 5) {
        this.emit(s.x + rand(-50, 50), s.y + rand(-50, 50), "trail", "#7dd3fc");
      }
      if (s.life <= 0) {
        this.swarm = null;
        this.swarmCooldown = rand(16, 28);
      }
    }
    // ---------- Shrimp AI ----------
    spawnDecoy(shrimp, pursuer) {
      const ghost = {
        ...shrimp,
        id: this.foodId++,
        kind: "decoy",
        vx: 0,
        vy: 0,
        age: 0,
        life: 1.35,
        size: shrimp.size * 1.25,
        claims: 0,
        eaten: false,
        trick: "rest",
        trickTimer: 0,
        trickCooldown: 99,
        shimmer: 1
      };
      this.food.push(ghost);
      this.emit(shrimp.x, shrimp.y, "spark", "#ffd1e0", 7);
      this.ripples.push({ x: shrimp.x, y: shrimp.y, r: 2, maxR: 14, life: 0.4, maxLife: 0.4 });
      if (pursuer) {
        const p = pursuer.personality;
        const foolChance = 0.2 + p.curiosity * 0.5 + p.boldness * 0.16 - p.agility * 0.22;
        if (Math.random() < foolChance) pursuer.forceTarget(ghost);
      }
    }
    updateFood(fd, dt) {
      fd.age += dt;
      if (fd.kind === "decoy") {
        fd.x += fd.vx * dt;
        fd.y += fd.vy * dt;
        fd.vx *= 1 - Math.min(1, dt * 4);
        fd.vy *= 1 - Math.min(1, dt * 4);
        fd.shimmer = clamp((fd.life - fd.age) / 0.45, 0, 1);
        return;
      }
      const W = this.width;
      const H = this.height;
      let pursuer = null;
      for (const f of this.fish) {
        if (f.target === fd) {
          pursuer = f;
          break;
        }
      }
      if (pursuer && fd.trick === "none") {
        const d = Math.hypot(fd.x - pursuer.x, fd.y - pursuer.y);
        if (d < 22 * pursuer.scale && d > 0.01) {
          const pull = Math.min(1, dt * 11);
          fd.x += (pursuer.x - fd.x) * pull;
          fd.y += (pursuer.y - fd.y) * pull;
          return;
        }
      }
      let threatX = 0;
      let threatY = 0;
      let nearest = null;
      let nearestD = Infinity;
      for (const f of this.fish) {
        const dx = fd.x - f.x;
        const dy = fd.y - f.y;
        const d = Math.hypot(dx, dy);
        if (d > 0 && d < 125) {
          const w = (125 - d) / 125;
          threatX += dx / d * w;
          threatY += dy / d * w;
          if (d < nearestD) {
            nearestD = d;
            nearest = f;
          }
        }
      }
      const threatMag = Math.hypot(threatX, threatY);
      fd.energy = clamp(fd.energy + dt * 0.13, 0, 1);
      fd.trickCooldown -= dt;
      fd.trickTimer -= dt;
      if (fd.trick === "none" && pursuer && fd.trickCooldown <= 0 && fd.energy > 0.3 && nearest && nearestD < 72) {
        fd.trickSide = Math.random() < 0.5 ? -1 : 1;
        fd.trickTurned = false;
        const side = fd.trickSide;
        if (Math.random() < 0.48) {
          this.spawnDecoy(fd, pursuer);
          const away = Math.atan2(threatY, threatX);
          fd.heading = away + side * rand(0.8, 1.45);
          fd.vx = Math.cos(fd.heading) * rand(150, 190);
          fd.vy = Math.sin(fd.heading) * rand(150, 190);
          fd.trick = "feint";
          fd.trickTimer = 0.45;
          fd.trickCooldown = rand(3, 5);
          fd.energy -= 0.36;
          this.emit(fd.x, fd.y, "puff", "#ffd1e0", 3);
        } else {
          const toHunter = Math.atan2(pursuer.y - fd.y, pursuer.x - fd.x);
          fd.heading = toHunter + side * 0.88;
          fd.vx = Math.cos(fd.heading) * rand(150, 195);
          fd.vy = Math.sin(fd.heading) * rand(150, 195);
          fd.trick = "juke";
          fd.trickTimer = 0.54;
          fd.trickCooldown = rand(2.6, 4.5);
          fd.energy -= 0.3;
          pursuer.miss(0.72);
          this.emit(fd.x, fd.y, "puff", "#ffd1e0", 2);
        }
      }
      if (fd.trick === "juke" && !fd.trickTurned && fd.trickTimer <= 0.28) {
        fd.trickTurned = true;
        fd.heading += fd.trickSide * rand(2, 2.7);
        fd.vx = Math.cos(fd.heading) * rand(165, 205);
        fd.vy = Math.sin(fd.heading) * rand(165, 205);
        this.emit(fd.x, fd.y, "puff", "#ffd1e0", 2);
      }
      if (fd.trick !== "none" && fd.trickTimer <= 0) fd.trick = "none";
      let dirX;
      let dirY;
      let maxSpeed;
      if (fd.trick !== "none") {
        dirX = Math.cos(fd.heading);
        dirY = Math.sin(fd.heading);
        maxSpeed = 185;
      } else {
        if (threatMag > 0.04) {
          dirX = threatX / threatMag;
          dirY = threatY / threatMag;
        } else {
          fd.turnT -= dt;
          if (fd.turnT <= 0) {
            fd.heading += rand(-1.3, 1.3);
            fd.turnT = rand(0.3, 0.95);
          }
          dirX = Math.cos(fd.heading);
          dirY = Math.sin(fd.heading);
        }
        const wobble = Math.sin(this.time * 3.2 + fd.sway) * (0.22 + threatMag * 0.16);
        let ax = dirX - dirY * wobble;
        let ay = dirY + dirX * wobble;
        const margin = 42;
        if (fd.x < margin) ax += (margin - fd.x) / margin * 2.2;
        if (fd.x > W - margin) ax -= (fd.x - (W - margin)) / margin * 2.2;
        if (fd.y < margin) ay += (margin - fd.y) / margin * 2.2;
        if (fd.y > H - margin) ay -= (fd.y - (H - margin)) / margin * 2.2;
        const al = Math.hypot(ax, ay) || 1;
        dirX = ax / al;
        dirY = ay / al;
        maxSpeed = (54 + Math.min(1, threatMag * 1.6) * 92) * (0.55 + fd.energy * 0.55);
        if (fd.energy < 0.22) maxSpeed *= 0.68;
        fd.heading = Math.atan2(dirY, dirX);
      }
      fd.vx = lerp(fd.vx, dirX * maxSpeed, damp(fd.trick !== "none" ? 12 : 5.5, dt));
      fd.vy = lerp(fd.vy, dirY * maxSpeed, damp(fd.trick !== "none" ? 12 : 5.5, dt));
      fd.x += fd.vx * dt;
      fd.y += fd.vy * dt;
      if (fd.x < 8) {
        fd.x = 8;
        fd.vx = Math.abs(fd.vx);
        fd.heading = Math.atan2(fd.vy, fd.vx);
      }
      if (fd.x > W - 8) {
        fd.x = W - 8;
        fd.vx = -Math.abs(fd.vx);
        fd.heading = Math.atan2(fd.vy, fd.vx);
      }
      if (fd.y < 8) {
        fd.y = 8;
        fd.vy = Math.abs(fd.vy);
        fd.heading = Math.atan2(fd.vy, fd.vx);
      }
      if (fd.y > H - 24) {
        fd.y = H - 24;
        fd.vy = -Math.abs(fd.vy);
        fd.heading = Math.atan2(fd.vy, fd.vx);
      }
      if (fd.trick === "none" && Math.hypot(fd.vx, fd.vy) > 5) fd.heading = Math.atan2(fd.vy, fd.vx);
    }
    // ---------- Simulation ----------
    update(dt) {
      this.time += dt;
      this.updateSwarm(dt);
      for (const fd of this.food) this.updateFood(fd, dt);
      this.food = this.food.filter((fd) => !fd.eaten && fd.age < fd.life);
      const env = {
        width: this.width,
        height: this.height,
        time: this.time,
        food: this.food,
        fish: this.fish,
        pointer: this.pointer,
        swarm: this.swarm,
        emit: this.emit,
        onEat: (fish, food, result) => {
          this.ripples.push({
            x: food.x,
            y: food.y,
            r: 2,
            maxR: (result === "decoy" ? 12 : 18) * fish.scale,
            life: 0.45,
            maxLife: 0.45
          });
          if (result === "decoy") {
            this.combo = 0;
            this.texts.push({
              x: fish.x,
              y: fish.y - 28 * fish.scale,
              life: 0.9,
              maxLife: 0.9,
              text: "?!",
              color: "#d9f8ff"
            });
            return;
          }
          this.stats.eaten += 1;
          this.onStats?.({ ...this.stats });
          this.combo = this.time - this.lastEatAt < 3 ? this.combo + 1 : 1;
          this.lastEatAt = this.time;
          this.texts.push({
            x: fish.x,
            y: fish.y - 16 * fish.scale,
            life: 1,
            maxLife: 1,
            text: this.combo > 1 ? `combo \xD7${this.combo}` : "+1",
            color: fish.form.colors.core
          });
        }
      };
      for (const f of this.fish) f.update(dt, env);
      const next = [];
      for (const p of this.particles) {
        if (p.kind === "mote") {
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          if (p.x < -5) p.x = this.width + 5;
          if (p.x > this.width + 5) p.x = -5;
          if (p.y < -5) p.y = this.height + 5;
          if (p.y > this.height + 5) p.y = -5;
          next.push(p);
        } else if (p.kind === "bubble") {
          p.y += p.vy * dt;
          p.x += Math.sin(this.time * 1.5 + p.seed) * 10 * dt;
          if (p.y < -10) Object.assign(p, this.makeBubble());
          next.push(p);
        } else if (p.kind === "puff") {
          p.life -= dt;
          if (p.life <= 0) continue;
          p.y += p.vy * dt;
          p.x += (p.vx + Math.sin(this.time * 2 + p.seed) * 8) * dt;
          p.vy *= 1 - Math.min(1, dt * 0.4);
          next.push(p);
        } else {
          p.life -= dt;
          if (p.life <= 0) continue;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.vx *= 1 - Math.min(1, dt * 2.5);
          p.vy *= 1 - Math.min(1, dt * 2.5);
          if (p.kind === "trail") p.vy -= 4 * dt;
          next.push(p);
        }
      }
      this.particles = next;
      for (const r of this.ripples) {
        r.life -= dt;
        r.r += (r.maxR - r.r) * Math.min(1, dt * 4);
      }
      this.ripples = this.ripples.filter((r) => r.life > 0);
      for (const tx of this.texts) {
        tx.life -= dt;
        tx.y -= 20 * dt;
      }
      this.texts = this.texts.filter((tx) => tx.life > 0);
    }
    // ---------- Rendering ----------
    render(ctx) {
      const W = this.width;
      const H = this.height;
      if (this.bg) {
        ctx.save();
        ctx.globalAlpha = 0.38;
        ctx.drawImage(this.bg, 0, 0, W, H);
        ctx.restore();
      }
      for (const p of this.particles) {
        if (p.kind === "mote") {
          const tw = 0.35 + 0.35 * Math.sin(this.time * 1.2 + p.seed);
          ctx.globalAlpha = tw;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.kind === "bubble") {
          ctx.globalAlpha = 0.28;
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.stroke();
          ctx.globalAlpha = 0.5;
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(p.x - p.size * 0.35, p.y - p.size * 0.35, p.size * 0.25, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.kind === "puff") {
          const a = p.life / p.maxLife;
          ctx.globalAlpha = a * 0.55;
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * (1.6 - a * 0.6), 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
      for (const r of this.ripples) {
        const a = r.life / r.maxLife;
        ctx.globalAlpha = a * 0.55;
        ctx.strokeStyle = "#a5f3fc";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      this.drawSwarm(ctx);
      for (const fd of this.food) this.drawShrimp(ctx, fd);
      const sorted = [...this.fish].sort((a, b) => a.speed - b.speed);
      for (const f of sorted) f.draw(ctx);
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      for (const p of this.particles) {
        if (p.kind !== "trail" && p.kind !== "spark") continue;
        const a = p.life / p.maxLife;
        ctx.globalAlpha = a * (p.kind === "spark" ? 1 : 0.8);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (0.4 + a * 0.6), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      ctx.save();
      ctx.font = "700 12px ui-sans-serif, system-ui, sans-serif";
      ctx.textAlign = "center";
      for (const tx of this.texts) {
        const a = clamp(tx.life / tx.maxLife, 0, 1);
        ctx.globalAlpha = a;
        ctx.fillStyle = tx.color;
        ctx.shadowColor = tx.color;
        ctx.shadowBlur = 8;
        ctx.fillText(tx.text, tx.x, tx.y);
      }
      ctx.restore();
      ctx.globalAlpha = 1;
      const pulse = 0.5 + 0.5 * Math.sin(this.time * 1.4);
      ctx.save();
      ctx.globalAlpha = 0.28;
      const band = ctx.createLinearGradient(0, H - 70, 0, H);
      band.addColorStop(0, "rgba(34, 211, 238, 0)");
      band.addColorStop(1, `rgba(34, 211, 238, ${0.35 + pulse * 0.15})`);
      ctx.fillStyle = band;
      ctx.fillRect(0, H - 70, W, 70);
      ctx.fillStyle = "#22d3ee";
      ctx.fillRect(0, H - 16, W, 16);
      ctx.fillStyle = `rgba(207, 250, 254, ${0.45 + pulse * 0.25})`;
      ctx.fillRect(0, H - 16, W, 1.5);
      ctx.restore();
      const hovered = this.hoveredFish();
      if (hovered) this.drawTooltip(ctx, hovered);
    }
    drawSwarm(ctx) {
      const s = this.swarm;
      if (!s) return;
      const a = clamp(s.life / s.maxLife, 0, 1) * clamp((s.maxLife - s.life) * 2, 0, 1);
      ctx.save();
      const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, 120);
      g.addColorStop(0, `rgba(125, 211, 252, ${a * 0.1})`);
      g.addColorStop(1, "rgba(125, 211, 252, 0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(s.x, s.y, 120, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = `rgba(165, 243, 252, ${a * 0.35})`;
      ctx.lineWidth = 1.2;
      ctx.setLineDash([4, 12]);
      ctx.lineDashOffset = -this.time * 28;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius + Math.sin(this.time * 1.2) * 8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }
    drawShrimp(ctx, fd) {
      const ghost = fd.kind === "decoy";
      const fade = ghost ? 1 : clamp((fd.life - fd.age) / 2.5, 0, 1);
      const shimmer = ghost ? fd.shimmer * (0.55 + 0.35 * Math.sin(this.time * 16 + fd.sway)) : 1;
      const alpha = fade * (ghost ? shimmer : 1);
      if (alpha <= 0) return;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(fd.x, fd.y);
      ctx.rotate(fd.heading);
      const s = fd.size;
      const flick = Math.sin(this.time * 22 + fd.sway) * 0.55;
      const tired = fd.energy < 0.25;
      if (ghost) {
        ctx.strokeStyle = "#d8f7ff";
        ctx.lineWidth = 1.2;
        ctx.setLineDash([2.5, 2.5]);
        ctx.beginPath();
        ctx.ellipse(0, 0, s * 1.15, s * 0.65, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-s * 0.9, 0);
        ctx.lineTo(-s * 2, -s * 0.7 + flick * s * 0.5);
        ctx.moveTo(-s * 0.9, 0);
        ctx.lineTo(-s * 2, s * 0.7 + flick * s * 0.5);
        ctx.moveTo(s * 0.9, -s * 0.2);
        ctx.quadraticCurveTo(s * 2, -s * 0.8, s * 2.5, -s * 1.1 + flick * s * 0.5);
        ctx.moveTo(s * 0.9, s * 0.2);
        ctx.quadraticCurveTo(s * 2, s * 0.8, s * 2.5, s * 1.1 + flick * s * 0.5);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
        return;
      }
      ctx.shadowColor = "#fb8fab";
      ctx.shadowBlur = 7;
      ctx.fillStyle = tired ? "#ffd9e6" : "#ffabc6";
      ctx.strokeStyle = tired ? "#f4a7c0" : "#f472a0";
      ctx.beginPath();
      ctx.moveTo(-s * 0.8, 0);
      ctx.lineTo(-s * 1.9, -s * 0.75 + flick * s * 0.5);
      ctx.lineTo(-s * 1.45, 0);
      ctx.lineTo(-s * 1.9, s * 0.75 + flick * s * 0.5);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(0, 0, s * 1.15, s * 0.68, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.lineWidth = 0.8;
      for (const i of [-0.5, 0, 0.5]) {
        ctx.beginPath();
        ctx.moveTo(i * s, -s * 0.55);
        ctx.quadraticCurveTo(i * s + s * 0.2, 0, i * s, s * 0.55);
        ctx.stroke();
      }
      ctx.lineWidth = 0.9;
      for (let i = 0; i < 3; i++) {
        const lx = (i - 1) * s * 0.55;
        const kick = Math.sin(this.time * 18 + fd.sway + i) * s * 0.22;
        ctx.beginPath();
        ctx.moveTo(lx, s * 0.45);
        ctx.lineTo(lx - s * 0.3 + kick, s * 1.15);
        ctx.stroke();
      }
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(s * 0.9, -s * 0.2);
      ctx.quadraticCurveTo(s * 2.1, -s * 0.9, s * 2.6, -s * 1.15 + flick * s * 0.4);
      ctx.moveTo(s * 0.9, s * 0.2);
      ctx.quadraticCurveTo(s * 2.1, s * 0.9, s * 2.6, s * 1.15 + flick * s * 0.4);
      ctx.stroke();
      ctx.fillStyle = "#5c1838";
      ctx.beginPath();
      ctx.arc(s * 0.68, -s * 0.25, s * 0.22, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(s * 0.74, -s * 0.31, s * 0.09, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.globalAlpha = 1;
    }
    drawTooltip(ctx, f) {
      const label = `${f.name} \xB7 ${f.personality.label}`;
      const sub = `${f.form.label} \xB7 ${f.actionLabel()}`;
      ctx.save();
      ctx.font = "600 12px ui-sans-serif, system-ui, sans-serif";
      const lw = ctx.measureText(label).width;
      ctx.font = "400 10px ui-sans-serif, system-ui, sans-serif";
      const sw = ctx.measureText(sub).width;
      const w = Math.max(lw, sw, 120) + 24;
      const h = 58;
      let x = f.x - w / 2;
      let y = f.y - 34 * f.scale - h;
      x = clamp(x, 8, this.width - w - 8);
      y = clamp(y, 8, this.height - h - 8);
      ctx.fillStyle = "rgba(8, 18, 32, 0.82)";
      ctx.strokeStyle = "rgba(165, 243, 252, 0.25)";
      ctx.lineWidth = 1;
      roundRect(ctx, x, y, w, h, 10);
      ctx.fill();
      ctx.stroke();
      ctx.textBaseline = "top";
      ctx.textAlign = "left";
      ctx.font = "600 12px ui-sans-serif, system-ui, sans-serif";
      ctx.fillStyle = "#e2f6ff";
      ctx.fillText(label, x + 12, y + 8);
      ctx.font = "400 10px ui-sans-serif, system-ui, sans-serif";
      ctx.fillStyle = "rgba(210, 242, 254, 0.62)";
      ctx.fillText(sub, x + 12, y + 25);
      const full = 1 - f.hunger;
      const barW = w - 24;
      ctx.fillStyle = "rgba(255,255,255,0.12)";
      roundRect(ctx, x + 12, y + 44, barW, 5, 3);
      ctx.fill();
      ctx.fillStyle = full > 0.5 ? "#34d399" : full > 0.25 ? "#fbbf24" : "#fb7185";
      roundRect(ctx, x + 12, y + 44, Math.max(5, barW * full), 5, 3);
      ctx.fill();
      ctx.restore();
    }
  };
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // src/entry.ts
  window.IELTSFishPond = { Pond };
})();
