package org.bigbluebutton.messages;

import org.junit.Assert;
import org.junit.Test;

import com.google.gson.Gson;

public class BreakoutRoomsListTest {

	@Test
	public void testEmptyBreakoutRoomsListTest() {
		String message = "{\"payload\":{\"meetingId\":\"183f0bf3a0982a127bdb8161e0c44eb696b3e75c-1452849036428\",\"rooms\":{\"startIndex\":0,\"endIndex\":0,\"focus\":0,\"dirty\":false,\"depth\":0}},\"header\":{\"timestamp\":33619724,\"name\":\"BreakoutRoomsList\",\"current_time\":1452849043547,\"version\":\"0.0.1\"}}";
		/*
		 * BreakoutRoomsList emptyBreakoutRooms = new BreakoutRoomsList( new
		 * BreakoutRoomsListPayload(
		 * "183f0bf3a0982a127bdb8161e0c44eb696b3e75c-1452849036428", new
		 * ArrayList<BreakoutRoomPayload>())); String converted =
		 * emptyBreakoutRooms.toJson();
		 */
		Gson gson = new Gson();
		BreakoutRoomsList brl = gson.fromJson(message, BreakoutRoomsList.class);
		Assert.assertEquals(message, brl);

		String updateUsers = "{\"payload\":{\"users\":{\"startIndex\":0,\"endIndex\":0,\"focus\":0,\"dirty\":false,\"depth\":0},\"recorded\":false,\"meetingId\":\"183f0bf3a0982a127bdb8161e0c44eb696b3e75c-1452856525319\",\"breakoutId\":\"183f0bf3a0982a127bdb8161e0c44eb696b3e75c-1452856525319-1\"},\"header\":{\"timestamp\":39885849,\"name\":\"UpdateBreakoutUsers\",\"current_time\":1452856548908,\"version\":\"0.0.1\"}}";
		UpdateBreakoutUsers ubu = gson.fromJson(updateUsers,
				UpdateBreakoutUsers.class);
		Assert.assertEquals(updateUsers, ubu);

	}
}
