package local.media;


/** Listener for AudioClipPlayer.
  * It captures onAudioClipStop() events, fired when the sound stops.  
  */
public interface AudioClipPlayerListener
{
   /** When the sound stops. */
   public void onAudioClipStop(AudioClipPlayer player);
   
}


