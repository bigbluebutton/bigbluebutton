/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
* 
* Copyright (c) 2018 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 3.0 of the License, or (at your option) any later
* version.
* 
* BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
*
*/

package org.bigbluebutton.common2.redis;

import org.apache.commons.pool2.impl.GenericObjectPoolConfig;

import io.lettuce.core.RedisClient;

public abstract class RedisAwareCommunicator {

    protected RedisClient redisClient;

    protected String host;
    protected String password;
    protected int port;
    protected String clientName;
    protected int expireKey;

    public abstract void start();

    public abstract void stop();

    public void setPassword(String password) {
        this.password = password;
    }

    public void setClientName(String clientName) {
        this.clientName = clientName;
    }

    public void setHost(String host) {
        this.host = host;
    }

    public void setPort(int port) {
        this.port = port;
    }

    public void setExpireKey(int expireKey) {
        this.expireKey = expireKey;
    }

    protected GenericObjectPoolConfig createPoolingConfig() {
        GenericObjectPoolConfig config = new GenericObjectPoolConfig();
        config.setMaxTotal(32);
        config.setMaxIdle(8);
        config.setMinIdle(1);
        config.setTestOnBorrow(true);
        config.setTestOnReturn(true);
        config.setTestWhileIdle(true);
        config.setNumTestsPerEvictionRun(12);
        config.setMaxWaitMillis(5000);
        config.setTimeBetweenEvictionRunsMillis(60000);
        config.setBlockWhenExhausted(true);
        return config;
    }
}
