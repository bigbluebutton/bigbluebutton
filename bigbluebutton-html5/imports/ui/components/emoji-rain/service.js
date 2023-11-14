const getInteractionsButtonCoordenates = () => {
  const el = document.getElementById('interactionsButton');
  const coordenada = el.getBoundingClientRect();
  return coordenada;
};

export default {
  getInteractionsButtonCoordenates,
};
