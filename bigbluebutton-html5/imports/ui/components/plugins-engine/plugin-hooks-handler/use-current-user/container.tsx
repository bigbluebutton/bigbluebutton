import { useEffect, useState } from 'react';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';
import { User } from '/imports/ui/Types/user';

const projectCurrentUser = (
  currentUser: Partial<User> | undefined,
): PluginSdk.User | undefined => {
  let currentUserToPluginHookProjection: PluginSdk.User | undefined;
  if (currentUser?.userId) {
    currentUserToPluginHookProjection = {
      userId: currentUser.userId,
      extId: currentUser.extId,
      name: currentUser.name,
      isModerator: currentUser.isModerator,
      isOnline: currentUser.isOnline,
      role: currentUser.role,
      color: currentUser.color,
      avatar: currentUser.avatar,
      emoji: currentUser.emoji,
      presenter: currentUser.presenter,
      pinned: currentUser.pinned,
      guest: currentUser.guest,
      mobile: currentUser.mobile,
      whiteboardAccess: currentUser.whiteboardAccess,
      voice: {
        joined: currentUser.voice?.joined,
        listenOnly: currentUser.voice?.listenOnly,
        talking: currentUser.voice?.talking,
        muted: currentUser.voice?.muted,
        voiceUserId: currentUser.voice?.voiceUserId,
        callerName: currentUser.voice?.callerName,
        callerNum: currentUser.voice?.callerNum,
        callingWith: currentUser.voice?.callingWith,
        color: currentUser.voice?.color,
        endTime: currentUser.voice?.endTime,
        floor: currentUser.voice?.floor,
        lastFloorTime: currentUser.voice?.lastFloorTime,
        lastSpeakChangedAt: currentUser.voice?.lastSpeakChangedAt,
        meetingId: currentUser.voice?.meetingId,
        spoke: currentUser.voice?.spoke,
        startTime: currentUser.voice?.startTime,
      } as PluginSdk.Voice,
      locked: currentUser.locked,
      lastBreakoutRoom: currentUser.lastBreakoutRoom,
      cameras: currentUser.cameras,
      presPagesWritable: currentUser.presPagesWritable,
      speechLocale: currentUser.speechLocale,
    } as PluginSdk.User;
  }
  return currentUserToPluginHookProjection;
};

const CurrentUserHookContainer = () => {
  const [sendSignal, setSendSignal] = useState(false);

  const currentUser = useCurrentUser(
    (currentUser: Partial<User>) => currentUser,
  );

  const updateUserForPlugin = () => {
    const currentUserProjection:
      PluginSdk.User | undefined = projectCurrentUser(currentUser);
    window.dispatchEvent(
      new CustomEvent(
        PluginSdk.Internal.BbbHookEvents.Update,
        {
          detail: {
            data: currentUserProjection,
            hook: PluginSdk.Internal.BbbHooks.UseCurrentUser,
          },
        },
      ),
    );
  };

  useEffect(() => {
    updateUserForPlugin();
  }, [currentUser, sendSignal]);

  useEffect(() => {
    const updateHookUseCurrentUser = () => {
      setSendSignal(!sendSignal);
    };
    window.addEventListener(
      PluginSdk.Internal.BbbHookEvents.Subscribe, updateHookUseCurrentUser,
    );
    return () => {
      window.removeEventListener(
        PluginSdk.Internal.BbbHookEvents.Subscribe, updateHookUseCurrentUser,
      );
    };
  }, []);

  return null;
};

export default CurrentUserHookContainer;
