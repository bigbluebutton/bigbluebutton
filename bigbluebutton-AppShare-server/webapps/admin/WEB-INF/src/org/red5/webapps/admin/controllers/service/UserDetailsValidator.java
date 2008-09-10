package org.red5.webapps.admin.controllers.service;

import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.validation.Errors;
import org.springframework.validation.Validator;

public class UserDetailsValidator implements Validator {

	protected static Logger log = LoggerFactory.getLogger(UserDetailsValidator.class);
	
	private int minLength = 4;

	public boolean supports(Class clazz) {
		return UserDetails.class.equals(clazz);
	}

	public void validate(Object obj, Errors errors) {
		log.debug("validate");
		UserDetails ud = (UserDetails) obj;
		if (ud == null) {
			log.debug("User details were null");
			errors.rejectValue("username", "error.not-specified", null,
					"Value required.");
		} else {
			log.debug("User details were null");
			if (StringUtils.isEmpty(ud.getUsername())) {
				errors.rejectValue("username", "error.missing-username",
						new Object[] {}, "Username Required.");
			}
			if (StringUtils.isEmpty(ud.getPassword())) {
				errors.rejectValue("password", "error.missing-password",
						new Object[] {}, "Password Required.");
			} else if (ud.getPassword().length() < minLength) {
				errors.rejectValue("password", "error.too-low",
						new Object[] { new Integer(minLength) },
						"Password Length Is Too Small.");
			}
		}
	}

	public void setMinLength(int i) {
		minLength = i;
	}

	public int getMinLength() {
		return minLength;
	}
}