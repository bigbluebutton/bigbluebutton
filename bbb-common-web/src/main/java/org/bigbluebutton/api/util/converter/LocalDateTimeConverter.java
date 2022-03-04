package org.bigbluebutton.api.util.converter;

import com.thoughtworks.xstream.converters.*;
import com.thoughtworks.xstream.io.*;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;

public class LocalDateTimeConverter implements Converter {

    public void marshal(Object source, HierarchicalStreamWriter writer, MarshallingContext context) {
        LocalDateTime dateTime = (LocalDateTime) source;
        Instant instant = dateTime.atZone(ZoneId.systemDefault()).toInstant();
        writer.setValue(String.valueOf(instant.toEpochMilli()));
    }

    public Object unmarshal(HierarchicalStreamReader reader, UnmarshallingContext context) {
        return LocalDateTime.parse(reader.getValue());
    }

    public boolean canConvert(Class type) {
        return type.equals(LocalDateTime.class);
    }
}
