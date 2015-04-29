package local.ua;


import org.zoolu.sip.address.NameAddress;


/** Listener of UserAgent */
public interface UserAgentListener
{
   /** When a new call is incoming */
   public void onUaCallIncoming(UserAgent ua, NameAddress callee, NameAddress caller);
   
   /** When an incoming call is cancelled */
   public void onUaCallCancelled(UserAgent ua);

   /** When an ougoing call is remotly ringing */
   public void onUaCallRinging(UserAgent ua);
   
   /** When an ougoing call has been accepted */
   public void onUaCallAccepted(UserAgent ua);
   
   /** When a call has been trasferred */
   public void onUaCallTrasferred(UserAgent ua);

   /** When an ougoing call has been refused or timeout */
   public void onUaCallFailed(UserAgent ua);

   /** When a call has been locally or remotly closed */
   public void onUaCallClosed(UserAgent ua);
   
}