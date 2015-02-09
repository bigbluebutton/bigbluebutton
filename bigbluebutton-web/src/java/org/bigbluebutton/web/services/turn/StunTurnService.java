package org.bigbluebutton.web.services.turn;

import java.util.HashSet;
import java.util.Set;

public class StunTurnService {

  private Set<StunServer> stunServers;
  private Set<TurnServer> turnServers;

  public Set<StunServer> getStunServers() {
    return stunServers;
  }

  public Set<TurnEntry> getStunAndTurnServersFor(String userId) {
    Set<TurnEntry> turns = new HashSet<TurnEntry>();

    for (TurnServer ts : turnServers) {
      TurnEntry entry = ts.generatePasswordFor(userId);
      if (entry != null) {
        turns.add(entry);
      }
    }
    
    return turns;
  }

  public void setStunServers(Set<StunServer> stuns) {
    stunServers = stuns;
  }

  public void setTurnServers(Set<TurnServer> turns) {
    turnServers = turns;
  }

}
