const DEFAULT_MAX_RETRIES = 10;
const DEFAULT_RETRY_TIMEOUT = 500;

const playAndRetry = async (mediaElement, maxRetries = DEFAULT_MAX_RETRIES) => {
  let attempt = 0;
  let played = false;

  const playElement = () => new Promise((resolve, reject) => {
    setTimeout(() => {
      mediaElement.play().then(resolve).catch(reject);
    }, DEFAULT_RETRY_TIMEOUT);
  });

  while (!played && attempt < maxRetries && mediaElement.paused) {
    try {
      await playElement();
      played = true;
      return played;
    } catch (error) {
      attempt += 1;
    }
  }

  return played || mediaElement.paused;
};

export default playAndRetry;
