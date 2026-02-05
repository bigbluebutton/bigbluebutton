package org.bigbluebutton.api.model.validator;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.bigbluebutton.api.model.constraint.ContentTypeConstraint;
import org.bigbluebutton.api.model.constraint.UrlConstraint;

import java.net.MalformedURLException;
import java.net.URISyntaxException;
import java.net.URL;

public class UrlValidator implements ConstraintValidator<UrlConstraint,String> {
    @Override
    public void initialize(UrlConstraint constraintAnnotation) {}

    @Override
    public boolean isValid(String url, ConstraintValidatorContext context) {
        if (url == null) return true;
        String newUrl = url;
        newUrl = newUrl.replace("%%MEETINGID%%", "123");
        newUrl = newUrl.replace("%%USERID%%", "456");
        newUrl = newUrl.replace("%%USERNAME%%", "John Doe");
        try {
            new URL(newUrl).toURI();
            return true;
        } catch (MalformedURLException | URISyntaxException e) {
            return false;
        }
    }
}
