package local.net;


/** Listener for UdpRelay.
  */
public interface UdpRelayListener
{
   /** When the remote source address changes. */
   public void onUdpRelaySourceChanged(UdpRelay udp_relay, String remote_src_addr, int remote_src_port);

   /** When UdpRelay stops relaying UDP datagrams. */
   public void onUdpRelayTerminated(UdpRelay udp_relay);   
}
