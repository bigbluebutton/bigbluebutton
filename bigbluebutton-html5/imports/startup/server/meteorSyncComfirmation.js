

export const dependencies = {
  MEETING: 'meeting',
  USERS: 'users',
  PRESENTATION_PODS: 'presentationPods',
  GROUP_CHATS: 'groupChats',
  VOICE_USERS: 'voiceUsers',
  LOCK_SETTINGS: 'lockSettings',
};
export let syncResolver = null;

export const serverSynced = new Promise(resolve => syncResolver = resolve);

class MeteorSyncComfirmation {
  constructor() {
    this.synced = false;
    this.promises = null;
    this.resolvers = {};
    this.setPromises = this.setPromises.bind(this);
    this.setMeetingResolver = this.setMeetingResolver.bind(this);
    this.meetingResolve = this.meetingResolve.bind(this);
    this.isSynced = this.isSynced.bind(this);
  }

  setMeetingDependenciesResolvers(meetingId, dependence) {
    const executor = (resolve) => {
      this.resolvers[meetingId] = {
        ...this.resolvers[meetingId],
        [dependence]: resolve,
      };
    };
    return new Promise(executor);
  }

  setMeetingResolver(meetingId) {
    const executor = (resolver) => {
      Promise.all(
        Object.values(dependencies).map(i => this.setMeetingDependenciesResolvers(meetingId, i)),
      )
        .then(() => resolver());
    };
    return new Promise(executor);
  }

  setPromises(meetingsRunning) {
    if (!meetingsRunning.length) {
      syncResolver();
      return this.synced = true;
    }

    this.promises = meetingsRunning.map(this.setMeetingResolver);
    Promise.all(this.promises)
      .then(() => {
        this.synced = true;
        syncResolver();
      });
  }

  meetingResolve(meetingId, dependence) {
    const meetingDependencies = this.resolvers[meetingId];
    if (meetingDependencies) {
      meetingDependencies[dependence]();
      return true;
    }

    return false;
  }

  isSynced() {
    return this.synced;
  }
}

export default new MeteorSyncComfirmation();
