package org.bigbluebutton.api.domain;

import java.util.Vector;

public class Group {

    private String groupId = "";
    private String name = "";
    private Vector<String> usersExtId;

    public Group(String groupId,
                 String name,
                 Vector<String> usersExtId) {
        this.groupId = groupId;
        this.name = name;
        this.usersExtId = usersExtId;
    }

    public String getGroupId() {
        return groupId;
    }

    public void setGroupId(String groupId) {
        this.groupId = groupId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Vector<String> getUsersExtId() {
        return usersExtId;
    }

    public void setUsersExtId(Vector<String> usersExtId) {
        this.usersExtId = usersExtId;
    }
}