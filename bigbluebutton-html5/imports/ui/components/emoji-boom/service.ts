import type { ConfettiEmoji, Point } from './types';

/**
 * Generates a cryptographically secure random number between 0 and 1
 * @returns A random number in the range [0, 1)
 */
export const getSecureRandomNumber = (): number => {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return array[0] / (0xFFFFFFFF + 1);
};

export const getCenterPosition = (rect: DOMRect): Point => ({
  x: rect.left + rect.width / 2,
  y: rect.top + rect.height / 2,
});

export const createEmojiElement = (
  emoji: string,
  startPoint: Point,
  emojiSize: number,
): HTMLDivElement => {
  const emojiElement = document.createElement('div');
  Object.assign(emojiElement.style, {
    position: 'fixed',
    fontSize: `${emojiSize}em`,
    pointerEvents: 'none',
    zIndex: '1000',
    left: '0',
    top: '0',
    transform: `translate(${startPoint.x}px, ${startPoint.y}px) translate(-50%, -50%)`,
  });
  emojiElement.textContent = emoji;
  const container = document.getElementById('reactionAnimationContainer') || document.body;
  container.appendChild(emojiElement);
  return emojiElement;
};

export const createAvatarBubble = (
  name: string,
  color: string,
  isModerator: boolean,
  startPoint: Point,
): HTMLDivElement => {
  const avatarElement = document.createElement('div');
  Object.assign(avatarElement.style, {
    position: 'fixed',
    width: '3.25rem',
    height: '3.25rem',
    borderRadius: isModerator ? '5px' : '50%',
    backgroundColor: color,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '150%',
    textTransform: 'capitalize',
    color: 'white',
    pointerEvents: 'none',
    zIndex: '1000',
    left: '0',
    top: '0',
    transform: `translate(${startPoint.x}px, ${startPoint.y}px) translate(-50%, -50%) scale(0)`,
    transition: 'transform 0.3s ease-out',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  });

  const initials = name.substring(0, 2).toLocaleLowerCase();
  avatarElement.textContent = initials;
  const container = document.getElementById('reactionAnimationContainer') || document.body;
  container.appendChild(avatarElement);

  requestAnimationFrame(() => {
    avatarElement.style.transform = `translate(${startPoint.x}px, ${startPoint.y}px) translate(-50%, -50%) scale(1)`;
  });

  return avatarElement;
};

export const animateAvatarBubble = (
  avatarElement: HTMLDivElement,
  startPoint: Point,
  duration: number,
): Promise<Point> => new Promise((resolve) => {
  const targetY = startPoint.y - 150;
  const startTime = performance.now();
  const element = avatarElement;

  const animate = (currentTime: number) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    const easeOutQuad = 1 - (1 - progress) * (1 - progress);
    const currentY = startPoint.y + (targetY - startPoint.y) * easeOutQuad;

    const wobble = Math.sin(progress * Math.PI * 3) * 10;
    const currentX = startPoint.x + wobble;

    element.style.transform = `translate(${currentX}px, ${currentY}px) translate(-50%, -50%) scale(1)`;

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      resolve({ x: currentX, y: currentY });
    }
  };

  requestAnimationFrame(animate);
});

export const explodeAvatar = (
  avatarElement: HTMLDivElement,
): Promise<void> => new Promise((resolve) => {
  const element = avatarElement;
  element.style.transition = 'transform 0.2s ease-out, opacity 0.2s ease-out';
  element.style.transform += ' scale(1.5)';
  element.style.opacity = '0';

  setTimeout(() => {
    element.remove();
    resolve();
  }, 200);
});

export const updateConfettiEmoji = (
  emoji: ConfettiEmoji,
  gravity: number,
  friction: number,
  progress: number,
): void => {
  const e = emoji;

  e.velocityY += gravity;
  e.velocityX *= friction;
  e.velocityY *= friction;

  e.x += e.velocityX;
  e.y += e.velocityY;

  if (progress > 0.7) {
    e.opacity = 1 - (progress - 0.7) / 0.3;
  }

  const translate = `translate(${e.x}px, ${e.y}px) translate(-50%, -50%)`;
  const scale = `scale(${e.scale})`;

  e.element.style.transform = `${translate} ${scale}`;
  e.element.style.opacity = e.opacity.toString();
};
