package org.bigbluebutton.core.filters

import org.bigbluebutton.core.api.{ DisconnectUser2x, EjectUserFromMeeting }
import org.bigbluebutton.core.domain.MeetingExtensionStatus
import org.bigbluebutton.core.{ OutMessageGateway, UnitSpec }
import org.bigbluebutton.core.models.{ MeetingStateModel, MeetingStatus, RegisteredUsers2x, Users3x }
import org.scalatest.mock.MockitoSugar
import org.mockito.Mockito._

class UsersHandlerFilterDummy(val state: MeetingStateModel, val outGW: OutMessageGateway) extends UsersHandlerFilter

class UserAuthzFilterTests extends UnitSpec with MockitoSugar {
  it should "eject user if user has ability" in {

    val testRegUsers = new RegisteredUsers2x
    testRegUsers.add(du30RegisteredUser)
    testRegUsers.add(mdsRegisteredUser)
    testRegUsers.add(marRegisteredUser)

    val testUsers = new Users3x
    testUsers.save(du30User)
    testUsers.save(mdsUser)
    testUsers.save(marUser)

    val state: MeetingStateModel = new MeetingStateModel(piliProps,
      abilities, testRegUsers, testUsers, chats, layouts,
      polls, whiteboards, presentations, breakoutRooms, captions,
      new MeetingStatus)

    val mockOutGW = mock[OutMessageGateway]
    // Create the class under test and pass the mock to it
    val classUnderTest = new UsersHandlerFilterDummy(state, mockOutGW)

    val ejectUserMsg = new EjectUserFromMeeting(piliIntMeetingId, marIntUserId, du30IntUserId)

    // Use the class under test
    classUnderTest.handleEjectUserFromMeeting(ejectUserMsg)

    // Then verify the class under test used the mock object as expected
    // The disconnect user shouldn't be called as user has ability to eject another user
    verify(mockOutGW, never()).send(new DisconnectUser2x(ejectUserMsg.meetingId, ejectUserMsg.ejectedBy))
  }

  it should "not eject user if user has no ability" in {
    val testRegUsers = new RegisteredUsers2x
    testRegUsers.add(du30RegisteredUser)
    testRegUsers.add(mdsRegisteredUser)
    testRegUsers.add(marRegisteredUser)

    val testUsers = new Users3x
    testUsers.save(du30User)
    testUsers.save(mdsUser)
    testUsers.save(marUser)

    val state: MeetingStateModel = new MeetingStateModel(piliProps,
      abilities,
      testRegUsers,
      testUsers,
      chats,
      layouts,
      polls,
      whiteboards,
      presentations,
      breakoutRooms,
      captions,
      new MeetingStatus)

    val mockOutGW = mock[OutMessageGateway]
    // Create the class under test and pass the mock to it
    val classUnderTest = new UsersHandlerFilterDummy(state, mockOutGW)

    val ejectUserMsg = new EjectUserFromMeeting(piliIntMeetingId, marIntUserId, mdsIntUserId)

    // Use the class under test
    classUnderTest.handleEjectUserFromMeeting(ejectUserMsg)

    // Then verify the class under test used the mock object as expected
    // The disconnect user should be called as user has no ability to eject another user
    verify(mockOutGW).send(new DisconnectUser2x(ejectUserMsg.meetingId, ejectUserMsg.ejectedBy))
    verify(mockOutGW, times(1)).send(new DisconnectUser2x(ejectUserMsg.meetingId, ejectUserMsg.ejectedBy))
  }
}
