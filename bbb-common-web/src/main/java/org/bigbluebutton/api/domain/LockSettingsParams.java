package org.bigbluebutton.api.domain;

public class LockSettingsParams {
	public final Boolean disableCam;
	public final Boolean disableMic;
	public final Boolean disablePrivateChat;
	public final Boolean disablePublicChat;
	public final Boolean disableNote;
	public final Boolean hideUserList;
	public final Boolean lockedLayout;
	public final Boolean lockOnJoin;
	public final Boolean lockOnJoinConfigurable;

	public LockSettingsParams(Boolean disableCam,
					Boolean disableMic,
					Boolean disablePrivateChat,
					Boolean disablePublicChat,
					Boolean disableNote,
					Boolean hideUserList,
					Boolean lockedLayout,
					Boolean lockOnJoin,
					Boolean lockOnJoinConfigurable) {
		this.disableCam = disableCam;
		this.disableMic = disableMic;
		this.disablePrivateChat = disablePrivateChat;
		this.disablePublicChat = disablePublicChat;
		this.disableNote = disableNote;
		this.hideUserList = hideUserList;
		this.lockedLayout = lockedLayout;
		this.lockOnJoin = lockOnJoin;
		this.lockOnJoinConfigurable = lockOnJoinConfigurable;
	}
}
