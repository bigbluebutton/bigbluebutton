import Auth from '/imports/ui/services/auth';

const logoutRouteHandler = () => {
  Auth.logout()
    .then((logoutURL) => {
      if (logoutURL) {
        try {
          const parsedURL = new URL(logoutURL, window.location.origin);
          const isRelativePath = logoutURL.startsWith('/') && !logoutURL.startsWith('//');

          if (isRelativePath || parsedURL.origin === window.location.origin) {
            window.location.href = isRelativePath
              ? `${parsedURL.pathname}${parsedURL.search}${parsedURL.hash}`
              : parsedURL.href;
          }
        } catch {
          window.location.href = '/';
        }
      }
    });
};

export default logoutRouteHandler;
