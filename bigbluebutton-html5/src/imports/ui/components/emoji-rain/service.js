const getInteractionsButtonCoordinates = () => {
  const el = document.getElementById('interactionsButton');

  if (!el) return null;

  const coordinate = el.getBoundingClientRect();

  return coordinate;
};

export default {
  getInteractionsButtonCoordinates,
};
