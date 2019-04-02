const sortUsers = (a, b) => {
  const sortByResponse = (a, b) => {
    if (a.answer.toLowerCase() > b.answer.toLowerCase()) {
      return -1;
    } else if (a.answer.toLowerCase() < b.answer.toLowerCase()) {
      return 1;
    }
    return 0;
  };

  const sortByName = (a, b) => {
    if (a.name.toLowerCase() < b.name.toLowerCase()) {
      return -1;
    } else if (a.name.toLowerCase() > b.name.toLowerCase()) {
      return 1;
    }
    return 0;
  };

  let sort = sortByResponse(a, b);
  if (sort === 0) sort = sortByName(a, b);
  return sort;
};

export default {
  sortUsers,
};
