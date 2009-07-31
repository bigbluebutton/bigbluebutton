package local.ua;


import org.zoolu.sip.address.NameAddress;


/** Listener of PresenceAgent */
public interface PresenceAgentListener
{
   /** When a new SUBSCRIBE is received. */
   public void onPaSubscriptionRequest(PresenceAgent pa, NameAddress presentity, NameAddress watcher);

   /** When a subscription request successes. */
   public void onPaSubscriptionSuccess(PresenceAgent pa, NameAddress presentity);

   /** When a subscription terminates. */
   public void onPaSubscriptionTerminated(PresenceAgent pa, NameAddress presentity, String reason);


   /** When a new NOTIFY is received. */
   public void onPaNotificationRequest(PresenceAgent pa, NameAddress recipient, NameAddress notifier, String event, String content_type, String body);

   /** When a subscription request successes. */
   public void onPaNotificationFailure(PresenceAgent pa, NameAddress recipient, String reason);

}
