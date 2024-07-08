function getBaseUrl(cluster = false) {
  // @ts-ignore
  const webApi = window.meetingClientSettings.public.app.bbbWebBase;

  if (cluster) {
    const pathMatch = window.location.pathname.match('^(.*)/html5client/join$');
    if (pathMatch == null) {
      throw new Error('Failed to match BBB client URI');
    }
    const serverPathPrefix = pathMatch[1];
    return `${serverPathPrefix}${webApi}`;
  }

  return webApi;
}

export default getBaseUrl;
