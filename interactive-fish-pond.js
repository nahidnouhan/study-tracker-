/* Compatibility bridge: runs the live shrimp pond inside the existing JLPT canvas. */
(function () {
  'use strict';

  const Pond = window.IELTSFishPond && window.IELTSFishPond.Pond;
  if (typeof Pond !== 'function') return;

  class InteractiveFishPond {
    constructor(canvasId = 'elemental-koi-canvas') {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d', { alpha: true });
      if (!this.ctx) return;

      this.wrapper = this.canvas.parentElement;
      this.pointerRoot = this.wrapper || this.canvas;
      this.pond = new Pond();
      this.bounds = { left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0 };
      this.orbitCenter = { x: 0, y: 0 };
      this.currentSectionId = 'vocabulary';
      this.currentElement = 'spirit';
      this.evolutionStage = 1;
      this.dpr = 1;
      this.lastFrame = performance.now();
      this.raf = 0;
      this.dragging = false;
      this.lastDragDrop = 0;
      this.resizeObserver = new ResizeObserver(() => this.resizeCanvas());
      if (this.wrapper) this.resizeObserver.observe(this.wrapper);
      window.addEventListener('resize', this.resizeCanvas);
      this.pointerRoot.addEventListener('pointermove', this.onPointerMove);
      this.pointerRoot.addEventListener('pointerdown', this.onPointerDown);
      this.pointerRoot.addEventListener('pointerup', this.onPointerUp);
      this.pointerRoot.addEventListener('pointercancel', this.onPointerUp);
      this.pointerRoot.addEventListener('pointerleave', this.onPointerLeave);
      this.resizeCanvas();
      this.raf = requestAnimationFrame(this.animate);
    }

    getFocusCard() {
      return document.querySelector('.pillar-card.is-expanded')
        || document.getElementById(`card-${this.currentSectionId}`)
        || this.wrapper;
    }

    getFocusBounds() {
      const canvasRect = this.canvas.getBoundingClientRect();
      const cardRect = this.getFocusCard()?.getBoundingClientRect();
      if (!cardRect || cardRect.width < 100 || cardRect.height < 100) {
        return { left: 0, top: 0, right: canvasRect.width, bottom: canvasRect.height, width: canvasRect.width, height: canvasRect.height };
      }
      const left = Math.max(0, cardRect.left - canvasRect.left);
      const top = Math.max(0, cardRect.top - canvasRect.top);
      const right = Math.min(canvasRect.width, cardRect.right - canvasRect.left);
      const bottom = Math.min(canvasRect.height, cardRect.bottom - canvasRect.top);
      return { left, top, right, bottom, width: Math.max(1, right - left), height: Math.max(1, bottom - top) };
    }

    resizeCanvas = () => {
      if (!this.canvas || !this.ctx) return;
      const rect = this.canvas.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) return;
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);
      const pixelWidth = Math.round(rect.width * this.dpr);
      const pixelHeight = Math.round(rect.height * this.dpr);
      if (this.canvas.width !== pixelWidth || this.canvas.height !== pixelHeight) {
        this.canvas.width = pixelWidth;
        this.canvas.height = pixelHeight;
      }
      this.syncFocusBounds();
    };

    scaleSimulation(oldWidth, oldHeight, newWidth, newHeight) {
      if (oldWidth < 1 || oldHeight < 1 || newWidth < 1 || newHeight < 1) return;
      const sx = newWidth / oldWidth;
      const sy = newHeight / oldHeight;
      const sr = Math.sqrt(sx * sy);
      const scalePoint = (point) => { point.x *= sx; point.y *= sy; };
      for (const fish of this.pond.fish) {
        fish.x *= sx;
        fish.y *= sy;
        fish.anchorX *= sx;
        fish.anchorY *= sy;
        fish.spine.forEach(scalePoint);
      }
      for (const food of this.pond.food) {
        food.x *= sx; food.y *= sy;
        food.vx *= sx; food.vy *= sy;
      }
      for (const item of this.pond.particles) {
        item.x *= sx; item.y *= sy;
        item.vx *= sx; item.vy *= sy;
        item.size *= sr;
      }
      for (const ripple of this.pond.ripples) {
        ripple.x *= sx; ripple.y *= sy;
        ripple.r *= sr; ripple.maxR *= sr;
      }
      for (const label of this.pond.texts) {
        label.x *= sx; label.y *= sy;
      }
      if (this.pond.swarm) {
        this.pond.swarm.x *= sx; this.pond.swarm.y *= sy;
        this.pond.swarm.radius *= sr;
      }
    }

    syncFocusBounds() {
      const next = this.getFocusBounds();
      const oldWidth = this.pond.width;
      const oldHeight = this.pond.height;
      const changed = Math.abs(next.width - oldWidth) > 0.35 || Math.abs(next.height - oldHeight) > 0.35;
      this.bounds = next;
      this.orbitCenter = { x: next.left + next.width / 2, y: next.top + next.height / 2 };
      if (changed) {
        this.scaleSimulation(oldWidth, oldHeight, next.width, next.height);
        this.pond.resize(next.width, next.height, this.dpr);
      }
      const card = this.getFocusCard();
      if (this.lastFocusCard && this.lastFocusCard !== card) {
        this.lastFocusCard.style.cursor = '';
        this.lastFocusCard.style.touchAction = '';
      }
      this.lastFocusCard = card;
    }

    animate = (now) => {
      if (!this.ctx || !this.canvas) return;
      this.syncFocusBounds();
      const dt = Math.min(0.033, Math.max(0, (now - this.lastFrame) / 1000));
      this.lastFrame = now;
      this.pond.update(dt);

      const width = this.canvas.width / this.dpr;
      const height = this.canvas.height / this.dpr;
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      this.ctx.clearRect(0, 0, width, height);
      this.ctx.save();
      this.roundedFocusClip(this.ctx, this.bounds.left, this.bounds.top, this.bounds.width, this.bounds.height, 24);
      this.ctx.clip();
      this.ctx.translate(this.bounds.left, this.bounds.top);
      this.pond.render(this.ctx);
      this.ctx.restore();

      const card = this.getFocusCard();
      if (card?.classList.contains('is-expanded')) {
        card.style.cursor = this.pond.hoveredFish() ? 'pointer' : 'crosshair';
        card.style.touchAction = 'none';
      }
      this.raf = requestAnimationFrame(this.animate);
    };

    roundedFocusClip(ctx, x, y, width, height, radius) {
      const r = Math.min(radius, width / 2, height / 2);
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + width - r, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + r);
      ctx.lineTo(x + width, y + height - r);
      ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
      ctx.lineTo(x + r, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
    }

    pondPoint(event) {
      const rect = this.canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const inside = x >= this.bounds.left && x <= this.bounds.right && y >= this.bounds.top && y <= this.bounds.bottom;
      return { x: x - this.bounds.left, y: y - this.bounds.top, inside };
    }

    onPointerMove = (event) => {
      const point = this.pondPoint(event);
      this.pond.pointer = point;
      if (!this.dragging || !point.inside) return;
      const now = performance.now();
      if (now - this.lastDragDrop < 110) return;
      this.lastDragDrop = now;
      this.pond.dropFood(point.x, point.y, 1 + Math.floor(Math.random() * 2), 8);
      this.pond.ripples.push({ x: point.x, y: point.y, r: 2, maxR: 14, life: 0.4, maxLife: 0.4 });
    };

    onPointerDown = (event) => {
      if (event.button !== undefined && event.button !== 0) return;
      const target = event.target;
      if (target?.closest?.('button, a, input, select, textarea, .card-controls-container, .card-time-display, .expanded-card-top, .card-tools-popover')) return;
      const point = this.pondPoint(event);
      if (!point.inside) return;
      this.dragging = true;
      this.lastDragDrop = performance.now();
      this.pond.pointer = point;
      this.pond.splash(point.x, point.y);
      this.pond.dropFood(point.x, point.y, 4 + Math.floor(Math.random() * 3));
      try { this.pointerRoot.setPointerCapture(event.pointerId); } catch (_) {}
    };

    onPointerUp = () => { this.dragging = false; };
    onPointerLeave = () => { if (!this.dragging) this.pond.pointer.inside = false; };

    calculateUsablePondBounds() { return this.bounds; }

    jumpToPond(sectionId, element) {
      this.currentSectionId = sectionId || 'vocabulary';
      this.currentElement = element || 'spirit';
      this.pond.fish.forEach((fish) => { fish.excite = Math.max(fish.excite, 0.42); });
      requestAnimationFrame(() => this.syncFocusBounds());
    }

    setMode(mode) {
      if (mode === 'yin-yang' && !this.pond.swarm && this.pond.swarmCooldown <= 0) {
        this.pond.startSwarm(this.pond.width / 2, this.pond.height / 2);
      }
      this.pond.fish.forEach((fish) => { fish.excite = Math.max(fish.excite, mode === 'yin-yang' ? 0.7 : 0.2); });
    }

    setStudyActive(active) {
      if (active) this.pond.fish.forEach((fish) => { fish.excite = Math.max(fish.excite, 0.45); });
    }

    setEvolutionStage(stage) {
      this.evolutionStage = Math.max(1, Math.min(3, Number(stage) || 1));
      const scaleFactor = 1 + (this.evolutionStage - 1) * 0.07;
      this.pond.fish.forEach((fish) => {
        if (typeof fish.studyTimerBaseScale !== 'number') fish.studyTimerBaseScale = fish.scale;
        fish.scale = fish.studyTimerBaseScale * scaleFactor;
      });
    }

    addRipple(x, y, _color = 'rgba(165, 243, 252, 0.7)', maxRadius = 48) {
      this.pond.ripples.push({ x: x - this.bounds.left, y: y - this.bounds.top, r: 2, maxR: Math.max(16, maxRadius), life: 0.8, maxLife: 0.8 });
    }

    addParticle(x, y, color = '#cffafe') {
      this.pond.emit(x - this.bounds.left, y - this.bounds.top, 'spark', color, 1);
    }

    dropFood(x, y, count = 1) {
      // The legacy inspector action passes "pellet"; now it releases live shrimp instead.
      if (typeof count === 'string') {
        this.releaseLiveFeed();
        return;
      }
      this.pond.dropFood(x - this.bounds.left, y - this.bounds.top, Math.max(1, Number(count) || 1), 12);
    }

    releaseLiveFeed() { this.pond.sprinkle(); }

    destroy() {
      cancelAnimationFrame(this.raf);
      this.resizeObserver?.disconnect();
      window.removeEventListener('resize', this.resizeCanvas);
      this.pointerRoot?.removeEventListener('pointermove', this.onPointerMove);
      this.pointerRoot?.removeEventListener('pointerdown', this.onPointerDown);
      this.pointerRoot?.removeEventListener('pointerup', this.onPointerUp);
      this.pointerRoot?.removeEventListener('pointercancel', this.onPointerUp);
      this.pointerRoot?.removeEventListener('pointerleave', this.onPointerLeave);
      if (this.lastFocusCard) {
        this.lastFocusCard.style.cursor = '';
        this.lastFocusCard.style.touchAction = '';
      }
    }
  }

  window.ElementalKoiPond = InteractiveFishPond;
  window.SpiritKoiPond = InteractiveFishPond;
})();
