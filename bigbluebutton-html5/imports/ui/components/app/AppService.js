let AppService = function () {
  const poll = Polls.findOne({});
  return { pollExists: !!poll };
};

export default AppService;
