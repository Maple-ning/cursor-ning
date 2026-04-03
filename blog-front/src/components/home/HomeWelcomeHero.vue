<script setup lang="ts">
import { onMounted, ref } from 'vue';

const visible = ref(false);

onMounted(() => {
  requestAnimationFrame(() => {
    visible.value = true;
  });
});
</script>

<template>
  <div class="home-welcome" :class="{ 'home-welcome--visible': visible }">
    <div class="home-welcome__aurora" aria-hidden="true" />
    <div class="home-welcome__mesh" aria-hidden="true" />
    <div class="home-welcome__grid" aria-hidden="true" />
    <div class="home-welcome__scan" aria-hidden="true" />

    <div class="home-welcome__content">
      <p class="home-welcome__badge">
        <span class="home-welcome__badge-dot" />
        枫叶小站
      </p>
      <h2 class="home-welcome__title">欢迎来到枫叶小站</h2>
      <p class="home-welcome__tagline">学习记录 · 学习笔记 · 项目展示</p>
    </div>

    <div class="home-welcome__particles" aria-hidden="true">
      <span v-for="n in 14" :key="n" class="home-welcome__particle" :style="{ '--d': `${n * 0.35}s` }" />
    </div>
  </div>
</template>

<style scoped>
.home-welcome {
  position: relative;
  overflow: hidden;
  min-height: 168px;
  padding: 1.75rem 1.5rem 2rem;
  border-radius: 10px;
  isolation: isolate;
  background: linear-gradient(145deg, #0f172a 0%, #1e1b4b 45%, #0c4a6e 100%);
}

@media (min-width: 1024px) {
  .home-welcome {
    min-height: 188px;
    padding: 2rem 2.25rem 2.25rem;
  }
}

.home-welcome__aurora {
  position: absolute;
  inset: -40%;
  background:
    radial-gradient(ellipse 80% 50% at 20% 40%, rgba(99, 102, 241, 0.45), transparent 55%),
    radial-gradient(ellipse 60% 40% at 80% 60%, rgba(14, 165, 233, 0.4), transparent 50%),
    radial-gradient(ellipse 50% 60% at 50% 100%, rgba(168, 85, 247, 0.35), transparent 45%);
  animation: home-welcome-aurora 14s ease-in-out infinite;
  z-index: 0;
}

.home-welcome__mesh {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    125deg,
    rgba(255, 255, 255, 0.07) 0%,
    transparent 40%,
    transparent 60%,
    rgba(255, 255, 255, 0.05) 100%
  );
  animation: home-welcome-mesh 10s ease-in-out infinite alternate;
  z-index: 1;
}

.home-welcome__grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
  background-size: 28px 28px;
  mask-image: radial-gradient(ellipse 85% 75% at 50% 45%, black 20%, transparent 70%);
  z-index: 2;
}

.home-welcome__scan {
  position: absolute;
  left: 0;
  right: 0;
  height: 120%;
  top: -10%;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(56, 189, 248, 0.12) 48%,
    rgba(56, 189, 248, 0.12) 52%,
    transparent 100%
  );
  transform: translateY(-100%);
  animation: home-welcome-scan 5.5s ease-in-out infinite;
  z-index: 3;
  pointer-events: none;
}

.home-welcome__content {
  position: relative;
  z-index: 4;
  text-align: center;
  opacity: 0;
  transform: translateY(12px);
  transition:
    opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
}

.home-welcome--visible .home-welcome__content {
  opacity: 1;
  transform: translateY(0);
}

.home-welcome__badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin: 0 0 0.75rem;
  padding: 0.35rem 0.9rem;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(224, 231, 255, 0.95);
  border: 1px solid rgba(129, 140, 248, 0.45);
  border-radius: 9999px;
  background: rgba(15, 23, 42, 0.35);
  backdrop-filter: blur(8px);
  box-shadow: 0 0 24px rgba(99, 102, 241, 0.25);
}

.home-welcome__badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: linear-gradient(135deg, #22d3ee, #a78bfa);
  box-shadow: 0 0 10px rgba(34, 211, 238, 0.9);
  animation: home-welcome-pulse 2s ease-in-out infinite;
}

.home-welcome__title {
  margin: 0;
  font-size: clamp(1.65rem, 4.5vw, 2.35rem);
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: -0.02em;
  background: linear-gradient(
    100deg,
    #e0e7ff 0%,
    #a5b4fc 18%,
    #22d3ee 40%,
    #c4b5fd 62%,
    #e0e7ff 85%,
    #a5b4fc 100%
  );
  background-size: 220% auto;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: home-welcome-shimmer 7s linear infinite;
  filter: drop-shadow(0 2px 20px rgba(99, 102, 241, 0.35));
}

.home-welcome__tagline {
  margin: 0.85rem 0 0;
  font-size: 0.9rem;
  color: rgba(199, 210, 254, 0.82);
  letter-spacing: 0.28em;
  text-indent: 0.28em;
}

.home-welcome__particles {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
}

.home-welcome__particle {
  position: absolute;
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.85);
  box-shadow: 0 0 6px rgba(125, 211, 252, 0.9);
  opacity: 0;
  animation: home-welcome-spark 3.2s ease-in-out infinite;
  animation-delay: var(--d, 0s);
}

.home-welcome__particle:nth-child(1) {
  top: 18%;
  left: 12%;
}
.home-welcome__particle:nth-child(2) {
  top: 28%;
  left: 88%;
}
.home-welcome__particle:nth-child(3) {
  top: 62%;
  left: 8%;
}
.home-welcome__particle:nth-child(4) {
  top: 72%;
  left: 92%;
}
.home-welcome__particle:nth-child(5) {
  top: 12%;
  left: 48%;
}
.home-welcome__particle:nth-child(6) {
  top: 85%;
  left: 42%;
}
.home-welcome__particle:nth-child(7) {
  top: 45%;
  left: 6%;
}
.home-welcome__particle:nth-child(8) {
  top: 38%;
  left: 94%;
}
.home-welcome__particle:nth-child(9) {
  top: 22%;
  left: 68%;
}
.home-welcome__particle:nth-child(10) {
  top: 78%;
  left: 58%;
}
.home-welcome__particle:nth-child(11) {
  top: 52%;
  left: 78%;
}
.home-welcome__particle:nth-child(12) {
  top: 48%;
  left: 22%;
}
.home-welcome__particle:nth-child(13) {
  top: 8%;
  left: 28%;
}
.home-welcome__particle:nth-child(14) {
  top: 90%;
  left: 18%;
}

@keyframes home-welcome-aurora {
  0%,
  100% {
    transform: translate(0, 0) rotate(0deg);
  }
  33% {
    transform: translate(4%, -3%) rotate(3deg);
  }
  66% {
    transform: translate(-3%, 2%) rotate(-2deg);
  }
}

@keyframes home-welcome-mesh {
  0% {
    opacity: 0.6;
  }
  100% {
    opacity: 1;
  }
}

@keyframes home-welcome-scan {
  0%,
  12% {
    transform: translateY(-100%);
  }
  45% {
    transform: translateY(0%);
  }
  88%,
  100% {
    transform: translateY(100%);
  }
}

@keyframes home-welcome-shimmer {
  0% {
    background-position: 0% center;
  }
  100% {
    background-position: 200% center;
  }
}

@keyframes home-welcome-pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.15);
    opacity: 0.85;
  }
}

@keyframes home-welcome-spark {
  0%,
  100% {
    opacity: 0;
    transform: scale(0.4);
  }
  35% {
    opacity: 0.95;
    transform: scale(1);
  }
  70% {
    opacity: 0.35;
    transform: scale(0.7);
  }
}
</style>
