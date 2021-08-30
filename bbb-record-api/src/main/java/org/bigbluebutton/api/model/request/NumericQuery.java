package org.bigbluebutton.api.model.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import org.springframework.validation.annotation.Validated;

import javax.validation.Valid;
import java.util.Objects;

@Validated
@Data
public class NumericQuery {

    public enum QueryType {
        LESS_THAN,
        LESS_THAN_DESC,
        GREATER_THAN,
        GREATER_THAN_DESC,
        BOTH,
        BOTH_DESC
    }

    @JsonProperty("lowerBound")
    @Valid
    private Long lowerBound;

    @JsonProperty("upperBound")
    @Valid
    private Long upperBound;

    @JsonProperty("order")
    @Valid
    private String order;

    public QueryType determineQueryType() {
        if(lowerBound != null && upperBound != null) {
            if(order.equals("desc")) {
                return QueryType.BOTH_DESC;
            } else {
                return QueryType.BOTH;
            }
        } else if(lowerBound != null && upperBound == null) {
            if(order.equals("desc")) {
                return QueryType.GREATER_THAN_DESC;
            } else {
                return QueryType.GREATER_THAN;
            }
        } else if(lowerBound == null || upperBound != null) {
            if(order.equals("desc")) {
                return QueryType.LESS_THAN_DESC;
            } else {
                return QueryType.LESS_THAN;
            }
        } else {
            return null;
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        NumericQuery numericQuery = (NumericQuery) o;
        return Objects.equals(this.lowerBound, numericQuery.lowerBound) &&
                Objects.equals(this.upperBound, numericQuery.upperBound) &&
                Objects.equals(this.order, numericQuery.order);
    }

    @Override
    public int hashCode() {
        return Objects.hash(lowerBound, upperBound, order);
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append("class NumericQuery {\n");

        sb.append("    startBound: ").append(toIndentedString(lowerBound)).append("\n");
        sb.append("    endBound: ").append(toIndentedString(upperBound)).append("\n");
        sb.append("    order: ").append(toIndentedString(order)).append("\n");
        sb.append("}");
        return sb.toString();
    }

    /**
     * Convert the given object to string with each line indented by 4 spaces
     * (except the first line).
     */
    private String toIndentedString(Object o) {
        if (o == null) {
            return "null";
        }
        return o.toString().replace("\n", "\n    ");
    }
}
