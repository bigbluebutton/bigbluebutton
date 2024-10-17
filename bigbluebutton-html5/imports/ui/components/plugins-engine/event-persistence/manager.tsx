import { useEffect } from 'react';
import { EventPersistenceDetails } from 'bigbluebutton-html-plugin-sdk/dist/cjs/event-persistence/types';
import { EventPersistenceEvents } from 'bigbluebutton-html-plugin-sdk/dist/cjs/event-persistence/enums';
import { useMutation } from '@apollo/client';
import PLUGIN_EVENT_PERSISTENCE_MUTATION from './mutations';
import { PluginEventPersistenceManagerProps } from './types';

const PluginEventPersistenceManager: React.ElementType<
  PluginEventPersistenceManagerProps> = ((
    props: PluginEventPersistenceManagerProps,
  ) => {
    const { pluginName } = props;

    const [persistEvent] = useMutation(
      PLUGIN_EVENT_PERSISTENCE_MUTATION,
    );

    const handlePersistEventForPlugin: EventListener = (
    (event: CustomEvent<EventPersistenceDetails>) => {
      if (event.detail.pluginName === pluginName) {
        const eventDetails = event.detail as EventPersistenceDetails;
        persistEvent({
          variables: {
            pluginName: eventDetails.pluginName,
            eventName: eventDetails.eventName,
            payload: eventDetails.payload,
          },
        });
      }
    }) as EventListener;

    useEffect(() => {
      window.addEventListener(
        EventPersistenceEvents.EVENT_PERSISTED, handlePersistEventForPlugin,
      );
      return () => {
        window.removeEventListener(
          EventPersistenceEvents.EVENT_PERSISTED, handlePersistEventForPlugin,
        );
      };
    }, []);
  }) as React.ElementType<PluginEventPersistenceManagerProps>;

export default PluginEventPersistenceManager;
