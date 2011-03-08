package local.server;


import org.zoolu.sip.message.Message;


/** CallLogger keeps a complete trace of processed calls.
  */
public interface CallLogger
{
   /** Updates log with the present message. */
   public void update(Message msg);
}