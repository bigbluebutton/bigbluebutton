package org.bigbluebutton.api.dao;

import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.core.types.dsl.Expressions;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

public class RecordingPredicatesBuilder {

    private List<SearchCriteria> params;

    public RecordingPredicatesBuilder() {
        params = new ArrayList<>();
    }

    public RecordingPredicatesBuilder with(String key, String operation, Object value) {
        SearchCriteria searchCriteria = new SearchCriteria();
        searchCriteria.setKey(key);
        searchCriteria.setOperation(operation);
        searchCriteria.setValue(value);
        params.add(searchCriteria);
        return this;
    }

    public BooleanExpression build() {
        if(params.size() == 0) {
            return null;
        }

        List<BooleanExpression> predicates = params.stream().map(param -> {
            RecordingPredicate predicate = new RecordingPredicate(param);
            return predicate.getPredicate();
        }).filter(Objects::nonNull).collect(Collectors.toList());

        BooleanExpression result = Expressions.asBoolean(true).isTrue();

        for(BooleanExpression predicate: predicates) {
            result = result.and(predicate);
        }

        return result;
    }
}
