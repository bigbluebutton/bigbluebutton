export const privateMessageVisible = (id: string) => {
  const privateInputSpace = document.getElementById(id);
  if (privateInputSpace) {
    if (privateInputSpace.style.display === 'block') {
      privateInputSpace.style.display = 'none';
    } else {
      privateInputSpace.style.display = 'block';
    }
  }
};

export const getNameInitials = (name: string) => {
  const nameInitials = name.slice(0, 2);

  return nameInitials.replace(/^\w/, (c: string) => c.toUpperCase());
};

export default {
  privateMessageVisible,
  getNameInitials,
};
