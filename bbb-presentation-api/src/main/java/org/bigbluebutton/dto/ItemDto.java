package org.bigbluebutton.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.*;
import lombok.Data;

@Data
@JsonInclude(Include.NON_NULL)
public class ItemDto {

    String number;
    String name;
    String thumb;
    String textFile;

    public String getNumber() {
        return number;
    }

    public void setNumber(String number) {
        this.number = number;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getThumb() {
        return thumb;
    }

    public void setThumb(String thumb) {
        this.thumb = thumb;
    }

    public String getTextFile() {
        return textFile;
    }

    public void setTextFile(String textFile) {
        this.textFile = textFile;
    }
}
