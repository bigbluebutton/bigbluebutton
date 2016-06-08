package org.bigbluebutton.core.models

import org.bigbluebutton.core.UnitSpec
import org.bigbluebutton.core.domain.{ Abilities2x, CanEjectUser, CanRaiseHand }
import org.bigbluebutton.core.filters.DefaultAbilitiesFilter

class EventStoreTests extends UnitSpec {
  it should "eject user" in {
    val eventStore = new EventStore
    val eventNumber = new EventNumber
    var eventNum = eventNumber.increment()
    eventStore.add(new Event(eventNum))

    println(eventStore.getAll)
    eventStore.add(new Event(eventNumber.increment()))
    println(eventStore.getAll)
    assert(eventStore.getAll.length == 2)
  }
}
