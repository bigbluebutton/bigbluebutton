import React, { useRef, useState, useEffect } from 'react';
import Settings from '/imports/ui/services/settings';
import Service from './service';

const EmojiRain = ({ reactions }) => {
  const containerRef = useRef(null);
  const flyingMen = [];
  const [isAnimating, setIsAnimating] = useState(false);
  const EMOJI_SIZE = Meteor.settings.public.app.emojiRain.emojiSize;
  const NUMBER_OF_EMOJIS = Meteor.settings.public.app.emojiRain.numberOfEmojis;
  const emojiRainEnabled = Meteor.settings.public.app.emojiRain.enabled;
  const screenHeight = window.innerHeight;
  const screenWidth = window.innerWidth;

  const { animations } = Settings.application;

  function EmojiObject(face, startx, starty, emojiSize, flyUpMax) {
    this.isAlive = true;
    this.x = startx;
    this.y = starty;
    this.increment = -Math.floor((Math.random() * flyUpMax) + 10);
    this.xincrement = Math.floor((Math.random() * 10) + 1);
    this.xincrement *= Math.floor(Math.random() * 2) === 1 ? 1 : -1;
    this.element = document.createElement('div');
    this.element.innerHTML = face;
    this.element.style.position = 'absolute';
    this.element.style.fontSize = emojiSize + 'px';
    this.element.style.color = 'white';
    this.element.style.pointerEvents = 'none';
    containerRef.current.appendChild(this.element);

    this.refresh = function () {
      if (!this.isAlive) {
        return;
      }

      this.y += this.increment;
      this.x += this.xincrement;
      this.increment += 0.25;

      if (this.y >= screenHeight) {
        if (this.increment <= 5) {
          this.isAlive = false;
          this.element.style.display = 'none';
          return;
        }
        this.increment = -this.increment + 5;
      }

      this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;
    };
  }

  function createFlyingEmojis(face) {
    const coord = Service.getActionsButtonCoordenates();
    const coordX = coord.x;
    const coordY = coord.y;
    Array.from({ length: NUMBER_OF_EMOJIS }).forEach(() => {
      const coolGuy = new EmojiObject(face, coordX, coordY, EMOJI_SIZE, 6);
      flyingMen.push(coolGuy);
    });
  }

  function renderEmojiExplosion() {
    flyingMen.forEach((flyingMan, index) => {
      if (flyingMan.isAlive) {
        flyingMan.refresh();

        const emojiWidth = flyingMan.element.offsetWidth;
        const emojiX = flyingMan.x;
        if (emojiX + emojiWidth < 0 || emojiX > screenWidth) {
          flyingMen.isAlive = false;
        }
      } else {
        flyingMan.element.remove();
        flyingMen.splice(index, 1);
      }
    });

    if (flyingMen.length > 0) {
      requestAnimationFrame(renderEmojiExplosion);
    }
  }

  const handleVisibilityChange = () => {
    if (document.hidden) {
      setIsAnimating(false);
    } else if (emojiRainEnabled && animations) {
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
    if (emojiRainEnabled && animations && !isAnimating && !document.hidden) {
      setIsAnimating(true);
    }
  }, [emojiRainEnabled, animations, isAnimating]);

  useEffect(() => {
    if (isAnimating) {
      reactions.forEach((reaction) => {
        if (Date() == reaction.creationDate && (reaction.reaction !== 'none')) {
          createFlyingEmojis(reaction.reaction);
          renderEmojiExplosion();
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
  };

  return <div ref={containerRef} style={containerStyle} />;
};

export default EmojiRain;
