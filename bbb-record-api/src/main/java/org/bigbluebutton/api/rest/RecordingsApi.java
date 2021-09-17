package org.bigbluebutton.api.rest;

import com.github.fge.jsonpatch.JsonPatch;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.bigbluebutton.api.model.response.InlineResponse200;
import org.bigbluebutton.api.model.response.InlineResponse201;
import org.bigbluebutton.api.model.response.InlineResponse405;
import org.bigbluebutton.api.model.response.ResponseEnvelope;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@Validated
public interface RecordingsApi {

    @Operation(summary = "Delete a recording", description = "", security = {
        @SecurityRequirement(name = "api_key")    }, tags={ "recording" })
    @ApiResponses(value = { 
        @ApiResponse(responseCode = "204", description = "Recording was successfully deleted"),
        @ApiResponse(responseCode = "404", description = "The specified resource could not be found",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = InlineResponse405.class))),
        @ApiResponse(responseCode = "405", description = "Validation error",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = InlineResponse405.class))) })
    @RequestMapping(value = "/recordings/{recordingId}",
        produces = { "application/json", "application/xml" }, 
        method = RequestMethod.DELETE)
    ResponseEntity<ResponseEnvelope> deleteRecording(@Parameter(in = ParameterIn.PATH, description = "ID of the recording to be deleted", required=true,
            schema=@Schema()) @PathVariable("recordingId") String recordingId);


    @Operation(summary = "Retrieve a single recording", description = "", security = {
        @SecurityRequirement(name = "api_key")    }, tags={ "recording" })
    @ApiResponses(value = { 
        @ApiResponse(responseCode = "200", description = "Recording successfully retrieved",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = InlineResponse200.class))),
        @ApiResponse(responseCode = "404", description = "The specified resource could not be found",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = InlineResponse405.class))),
        @ApiResponse(responseCode = "405", description = "Validation error",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = InlineResponse405.class))) })
    @RequestMapping(value = "/recordings/{recordingId}",
        produces = { "application/json", "application/xml" }, 
        method = RequestMethod.GET)
    ResponseEntity<ResponseEnvelope> getRecording(@Parameter(in = ParameterIn.PATH, description = "ID of the recording to be retrieved", required=true,
            schema=@Schema()) @PathVariable("recordingId") String recordingId);


    @Operation(summary = "Returns recordings", description = "", security = {
        @SecurityRequirement(name = "api_key")    }, tags={ "recording" })
    @ApiResponses(value = { 
        @ApiResponse(responseCode = "200", description = "Request successful",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = InlineResponse201.class))),
        @ApiResponse(responseCode = "404", description = "No resources could be found",
                content = @Content(mediaType = "application/json")),
        @ApiResponse(responseCode = "405", description = "Validation error",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = InlineResponse405.class))) })
    @RequestMapping(value = "/recordings/search",
        produces = { "application/json", "application/xml" },
        method = RequestMethod.GET)
    ResponseEntity<ResponseEnvelope> searchRecordings(@Parameter(in = ParameterIn.QUERY, description = "Search filters for recordings",
            schema = @Schema()) @RequestParam(value = "query", required = false) String query, @Parameter(in = ParameterIn.QUERY, description = "Page number",
            schema = @Schema()) @RequestParam(value = "page", required = false) Integer page, @Parameter(in = ParameterIn.QUERY, description = "Page size",
            schema = @Schema()) @RequestParam(value = "size", required = false) Integer size);

    @Operation(summary = "Returns recordings", description = "", security = {
            @SecurityRequirement(name = "api_key")    }, tags={ "recording" })
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Request successful",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = InlineResponse201.class))),
            @ApiResponse(responseCode = "404", description = "No resources could be found",
                    content = @Content(mediaType = "application/json")),
            @ApiResponse(responseCode = "405", description = "Validation error",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = InlineResponse405.class))) })
    @RequestMapping(value = "/recordings/metadata/search",
            produces = { "application/json", "application/xml" },
            method = RequestMethod.GET)
    ResponseEntity<ResponseEnvelope> searchMetadata(@Parameter(in = ParameterIn.QUERY, description = "XPath formatted metadata query",
            schema = @Schema()) @RequestParam(value = "query", required = false) String query, @Parameter(in = ParameterIn.QUERY, description = "Page number",
            schema = @Schema()) @RequestParam(value = "page", required = false) Integer page, @Parameter(in = ParameterIn.QUERY, description = "Page size",
            schema = @Schema()) @RequestParam(value = "size", required = false) Integer size);


    @Operation(summary = "Update an existing recording", description = "", security = {
        @SecurityRequirement(name = "api_key")    }, tags={ "recording" })
    @ApiResponses(value = { 
        @ApiResponse(responseCode = "200", description = "Request successful",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = InlineResponse201.class))),
        @ApiResponse(responseCode = "404", description = "The specified resource could not be found",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = InlineResponse405.class))),
        @ApiResponse(responseCode = "405", description = "Validation error",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = InlineResponse405.class))) })
    @RequestMapping(value = "/recordings/{recordingId}",
        produces = { "application/json", "application/xml" }, 
        consumes = { "application/json-patch+json"},
        method = RequestMethod.PATCH)
    ResponseEntity<ResponseEnvelope> updateRecording(@Parameter(in = ParameterIn.PATH, description = "ID of the recording to be updated", required=true,
            schema=@Schema()) @PathVariable("recordingId") String recordingId, @Parameter(in = ParameterIn.DEFAULT, description = "Recording object to be updated",
            required=true, schema=@Schema()) @Valid @RequestBody JsonPatch patch);

}

