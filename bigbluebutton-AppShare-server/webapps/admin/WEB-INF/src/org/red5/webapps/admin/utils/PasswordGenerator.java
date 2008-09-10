package org.red5.webapps.admin.utils;

/*
 * RED5 Open Source Flash Server - http://www.osflash.org/red5
 * 
 * Copyright (c) 2006-2008 by respective authors (see below). All rights reserved.
 * 
 * This library is free software; you can redistribute it and/or modify it under the 
 * terms of the GNU Lesser General Public License as published by the Free Software 
 * Foundation; either version 2.1 of the License, or (at your option) any later 
 * version. 
 * 
 * This library is distributed in the hope that it will be useful, but WITHOUT ANY 
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A 
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public License along 
 * with this library; if not, write to the Free Software Foundation, Inc., 
 * 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA 
 */

import org.acegisecurity.providers.encoding.Md5PasswordEncoder;

/**
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Daniel Rossi
 */
public class PasswordGenerator {
	
	private String password;

	private String salt = "secret";

	private Md5PasswordEncoder md5 = new Md5PasswordEncoder();

	public static void main(String args[]) {
		PasswordGenerator generate = new PasswordGenerator(args[0], args[1]);
		generate.run();
	}

	public PasswordGenerator(String password, String salt) {
		this.salt = salt;
		this.password = password;
	}

	public String getPassword() {
		return md5.encodePassword(this.password, this.salt).toString();
	}

	public void run() {
		System.out.println(md5.encodePassword(this.password, this.salt).toString());
	}

}
