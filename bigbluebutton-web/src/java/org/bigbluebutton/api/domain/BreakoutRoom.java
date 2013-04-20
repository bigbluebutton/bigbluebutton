package org.bigbluebutton.api.domain;

public class BreakoutRoom {
	
	private String name;
	private String number;
	
	
	public BreakoutRoom(String name, String number) {
		this.name = name;
		this.number = number;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public String getNumber() {
		return number;
	}
	public void setNumber(String number) {
		this.number = number;
	}
	
}
