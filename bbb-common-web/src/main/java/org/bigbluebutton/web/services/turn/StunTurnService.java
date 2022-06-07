package org.bigbluebutton.web.services.turn;

import java.util.HashSet;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class StunTurnService {
  private static Logger log = LoggerFactory.getLogger(StunTurnService.class);

  private Set<StunServer> stunServers;
  private Set<TurnServer> turnServers;
  private Set<RemoteIceCandidate> remoteIceCandidates;

  public Set<StunServer> getStunServers() {
    log.info("\nStunTurnService::getStunServers \n");
    return stunServers;
  }

  public Set<TurnEntry> getStunAndTurnServersFor(String userId) {
    log.info("\nStunTurnService::getStunAndTurnServersFor " + userId + "\n");
    Set<TurnEntry> turns = new HashSet<TurnEntry>();

    for (TurnServer ts : turnServers) {
      TurnEntry entry = ts.generatePasswordFor(userId);
      if (entry != null) {
        turns.add(entry);
      }
    }
    
    return turns;
  }

  public Set<RemoteIceCandidate> getRemoteIceCandidates() {
    return remoteIceCandidates;
  }

  public void setStunServers(Set<StunServer> stuns) {
    stunServers = stuns;
  }

  public void setTurnServers(Set<TurnServer> turns) {
    turnServers = turns;
  }

  public void setRemoteIceCandidates(Set<RemoteIceCandidate> candidates) {
    remoteIceCandidates = candidates;
  }

}
