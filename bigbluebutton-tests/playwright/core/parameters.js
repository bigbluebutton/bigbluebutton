const bbbUrl = process.env.BBB_URL;

module.exports = exports = {
  server: bbbUrl,
  secret: process.env.BBB_SECRET,
  welcome: '%3Cbr%3EWelcome+to+%3Cb%3E%25%25CONFNAME%25%25%3C%2Fb%3E%21',
  fullName: 'User1',
  moderatorPW: 'mp',
  attendeePW: 'ap',
  hostname: bbbUrl ? new URL(bbbUrl).hostname : undefined,
};
