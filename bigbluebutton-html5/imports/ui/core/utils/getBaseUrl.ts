function getBaseUrl() {
  // @ts-ignore
  const webApi = window.meetingClientSettings.public.app.bbbWebBase;

  return webApi;
}

export default getBaseUrl;
