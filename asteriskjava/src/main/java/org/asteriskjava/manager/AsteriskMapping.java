package org.asteriskjava.manager;

import static java.lang.annotation.ElementType.FIELD;
import static java.lang.annotation.ElementType.METHOD;
import java.lang.annotation.Retention;
import static java.lang.annotation.RetentionPolicy.RUNTIME;
import java.lang.annotation.Target;

/**
 * Customized the mapping to Asterisk. In general the mapping is done implicitly based
 * on reflection but there are certain action that are using headers with specical
 * characters that can not be represented in Java. In those cases you can annotate
 * the property (getter, setter or field) and provide the header name that Asterisk expects.
 *
 * @since 1.0.0
 */
@Target({METHOD, FIELD})
@Retention(RUNTIME)
public @interface AsteriskMapping
{
    public abstract String value();
}