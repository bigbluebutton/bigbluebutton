import Auth from '/imports/ui/services/auth';

const setLearningDashboardCookie = (token) => {
  if (token !== null) {
    const lifetime = new Date();
    lifetime.setTime(lifetime.getTime() + (3600000)); // 1h (extends 7d when open Dashboard)
    document.cookie = `ld-${Auth.meetingID}=${token}; expires=${lifetime.toGMTString()}; path=/`;
    return true;
  }
  return false;
};

const openLearningDashboardUrl = (lang, token) => {
  const APP = window.meetingClientSettings.public.app;
  if (token && setLearningDashboardCookie(token)) {
    window.open(`${APP.learningDashboardBase}/?meeting=${Auth.meetingID}&lang=${lang}`, '_blank');
  } else {
    window.open(`${APP.learningDashboardBase}/?meeting=${Auth.meetingID}&sessionToken=${Auth.sessionToken}&lang=${lang}`, '_blank');
  }
};

export default {
  setLearningDashboardCookie,
  openLearningDashboardUrl,
};
