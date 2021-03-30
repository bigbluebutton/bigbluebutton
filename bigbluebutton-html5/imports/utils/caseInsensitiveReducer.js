const caseInsensitiveReducer = (acc, item) => {
  const index = acc.findIndex(ans => ans.key.toLowerCase() === item.key.toLowerCase());
  if(index !== -1) {
    if(acc[index].numVotes >= item.numVotes) acc[index].numVotes += item.numVotes;
    else {
      const tempVotes = acc[index].numVotes;
      acc[index] = item;
      acc[index].numVotes += tempVotes;
    }
  } else {
    acc.push(item);
  }
  return acc;
};

export default caseInsensitiveReducer;
  