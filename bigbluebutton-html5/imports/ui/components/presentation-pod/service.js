import PresentationPods from '/imports/api/presentation-pods';
import Auth from '/imports/ui/services/auth';

const getPresentationPodIds = () => {
  const podIds = PresentationPods.find(
    {
      meetingId: Auth.meetingID,
    },
    {
      fields: {
        podId: 1,
      },
    },
  ).fetch();

  return podIds;
};

export default {
  getPresentationPodIds,
};
