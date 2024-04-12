import React, { useRef, useState, useEffect } from 'react';
import Settings from '/imports/ui/services/settings';
import Service from './service';
import logger from '/imports/startup/client/logger';

const EmojiRain = ({ reactions }) => {
  const containerRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const EMOJI_SIZE = Meteor.settings.public.app.emojiRain.emojiSize;
  const NUMBER_OF_EMOJIS = Meteor.settings.public.app.emojiRain.numberOfEmojis;
  const EMOJI_RAIN_ENABLED = Meteor.settings.public.app.emojiRain.enabled;

  const { animations } = Settings.application;

  function createEmojiRain(emoji) {
    const coord = Service.getInteractionsButtonCoordinates();
    const flyingEmojis = [];

    if (coord == null) {
      logger.warn({
        logCode: 'interactions_emoji_rain_no_coord',
      }, 'No coordinates for interactions button, skipping emoji rain');
      return;
    }

    for (i = 0; i < NUMBER_OF_EMOJIS; i++) {
      const initialPosition = {
        x: coord.x + coord.width / 8,
        y: coord.y + coord.height / 5,
      };
      const endPosition = {
        x: Math.floor(Math.random() * 100) + coord.x - 100 / 2,
        y: Math.floor(Math.random() * 300) + coord.y / 2,
      };
      const scale = Math.floor(Math.random() * (8 - 4 + 1)) - 40;
      const sec = Math.floor(Math.random() * 1700) + 2000;

      const shapeElement = document.createElement('svg');
      const emojiElement = document.createElement('text');
      emojiElement.setAttribute('x', '50%');
      emojiElement.setAttribute('y', '50%');
      emojiElement.innerHTML = emoji;

      shapeElement.style.position = 'absolute';
      shapeElement.style.left = `${initialPosition.x}px`;
      shapeElement.style.top = `${initialPosition.y}px`;
      shapeElement.style.transform = `scaleX(0.${scale}) scaleY(0.${scale})`;
      shapeElement.style.transition = `${sec}ms`;
      shapeElement.style.fontSize = `${EMOJI_SIZE}em`;
      shapeElement.style.pointerEvents = 'none';

      shapeElement.appendChild(emojiElement);
      containerRef.current.appendChild(shapeElement);

      flyingEmojis.push({ shapeElement, endPosition });
    }

    requestAnimationFrame(() => setTimeout(() => flyingEmojis.forEach((emoji) => {
      const { shapeElement, endPosition } = emoji;
      shapeElement.style.left = `${endPosition.x}px`;
      shapeElement.style.top = `${endPosition.y}px`;
      shapeElement.style.transform = 'scaleX(0) scaleY(0)';
    }), 0));

    setTimeout(() => {
      flyingEmojis.forEach((emoji) => emoji.shapeElement.remove());
      flyingEmojis.length = 0;
    }, 2000);
  }

  const handleVisibilityChange = () => {
    if (document.hidden) {
      setIsAnimating(false);
    } else if (EMOJI_RAIN_ENABLED && animations) {
      setIsAnimating(true);
    }
  };

  useEffect(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (EMOJI_RAIN_ENABLED && animations && !isAnimating && !document.hidden) {
      setIsAnimating(true);
    } else if (!animations) {
      setIsAnimating(false);
    }
  }, [EMOJI_RAIN_ENABLED, animations, isAnimating]);

  useEffect(() => {
    if (isAnimating) {
      reactions.forEach((reaction) => {
        const currentTime = new Date().getTime();
        const secondsSinceCreated = (currentTime - reaction.creationDate.getTime()) / 1000;
        if (secondsSinceCreated <= 1 && (reaction.reaction !== 'none')) {
          createEmojiRain(reaction.reaction);
        }
      });
    }
  }, [isAnimating, reactions]);

  const containerStyle = {
    width: '100vw',
    height: '100vh',
    position: 'fixed',
    top: 0,
    left: 0,
    overflow: 'hidden',
    pointerEvents: 'none',
    zIndex: 2,
  };

  return <div ref={containerRef} style={containerStyle} />;
};

export default EmojiRain;
