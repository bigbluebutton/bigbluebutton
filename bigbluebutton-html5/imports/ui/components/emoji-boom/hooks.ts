import { useCallback, useEffect, useRef } from 'react';
import {
  createEmojiElement,
  getCenterPosition,
  updateConfettiEmoji,
  createAvatarBubble,
  animateAvatarBubble,
  explodeAvatar,
  getSecureRandomNumber,
} from './service';
import type { ConfettiEmoji } from './types';

/**
 * Custom hook for confetti-like emoji animations.
 */
export const useEmojiThrow = () => {
  const animationRef = useRef<number>();
  const particlesRef = useRef<ConfettiEmoji[]>([]);

  const throwEmoji = useCallback(
    async (
      reactionEmoji: string,
      nameSortable: string,
      color: string,
      isModerator: boolean,
      sourceId: string,
      numberOfEmojis: number,
      emojiSize: number,
    ) => {
      const sourceEl = document.getElementById(sourceId);

      if (!sourceEl) return;

      const startRect = sourceEl.getBoundingClientRect();
      const startPoint = getCenterPosition(startRect);

      const avatarElement = createAvatarBubble(nameSortable, color, isModerator, startPoint);

      const avatarDuration = 800;
      const explosionPoint = await animateAvatarBubble(
        avatarElement,
        startPoint,
        avatarDuration,
      );

      explodeAvatar(avatarElement);

      const particles: ConfettiEmoji[] = [];

      for (let i = 0; i < numberOfEmojis; i += 1) {
        const emojiElement = createEmojiElement(reactionEmoji, explosionPoint, emojiSize);

        const angle = (Math.PI * 2 * i) / numberOfEmojis
          + (getSecureRandomNumber() - 0.5) * 0.5;
        const speed = 1 + getSecureRandomNumber() * 2;

        const particle: ConfettiEmoji = {
          element: emojiElement,
          x: explosionPoint.x,
          y: explosionPoint.y,
          velocityX: Math.cos(angle) * speed,
          velocityY: Math.sin(angle) * speed - 16,
          scale: 0.6 + getSecureRandomNumber() * 0.6,
          opacity: 1,
        };

        particles.push(particle);
      }

      particlesRef.current.push(...particles);

      let startTime = performance.now();
      const duration = 5000;
      const gravity = 0.3;
      const friction = 0.99;

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        particles.forEach((particle) => {
          updateConfettiEmoji(particle, gravity, friction, progress);
        });

        if (progress < 1) {
          const frameId = requestAnimationFrame(animate);
          animationRef.current = frameId;
        } else {
          particles.forEach((particle) => {
            particle.element.remove();
          });
          particlesRef.current = particlesRef.current.filter(
            (p) => !particles.includes(p),
          );
        }
      };

      requestAnimationFrame(() => {
        startTime = performance.now();
        animate(startTime);
      });
    },
    [],
  );

  const cleanup = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    animationRef.current = undefined;

    particlesRef.current.forEach((particle) => {
      particle.element.remove();
    });
    particlesRef.current = [];
  }, []);

  useEffect(() => () => {
    cleanup();
  }, []);

  return { throwEmoji, cleanup };
};

export default { useEmojiThrow };
