package org.bigbluebutton.api.dao;

import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.core.types.dsl.NumberPath;
import com.querydsl.core.types.dsl.PathBuilder;
import com.querydsl.core.types.dsl.StringPath;
import lombok.Data;
import org.bigbluebutton.api.model.entity.Recording;

@Data
public class RecordingPredicate {

    private SearchCriteria searchCriteria;

    public BooleanExpression getPredicate() {
        PathBuilder<Recording> recordingPath = new PathBuilder<>(Recording.class, "recording");

        if(isNumeric(searchCriteria.getValue().toString())) {
            final NumberPath<Long> path = recordingPath.getNumber(searchCriteria.getKey(), Long.class);
            final Long value = Long.parseLong(searchCriteria.getValue().toString());

            switch(searchCriteria.getOperation()) {
                case ":":
                    return path.eq(value);
                case ">":
                    return path.goe(value);
                case "<":
                    return path.loe(value);
            }
        } else {
            StringPath path = recordingPath.getString(searchCriteria.getKey());
            if(searchCriteria.getOperation().equalsIgnoreCase(":")) {
                return path.containsIgnoreCase(searchCriteria.getValue().toString());
            }
        }

        return null;
    }

    public static boolean isNumeric(String s) {
        try {
            Long.parseLong(s);
        } catch(NumberFormatException e) {
            return false;
        }

        return true;
    }
}
