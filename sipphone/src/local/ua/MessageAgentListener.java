package local.ua;


import org.zoolu.sip.address.NameAddress;


/** Listener of MessageAgent */
public interface MessageAgentListener
{
   /** When a new Message is received. */
   public void onMaReceivedMessage(MessageAgent ma, NameAddress sender, NameAddress recipient, String subject, String content_type, String body);

   /** When a message delivery successes. */
   public void onMaDeliverySuccess(MessageAgent ma, NameAddress recipient, String subject, String result);

   /** When a message delivery fails. */
   public void onMaDeliveryFailure(MessageAgent ma, NameAddress recipient, String subject, String result);

}
