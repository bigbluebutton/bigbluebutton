package org.bigbluebutton.api.rest;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.bigbluebutton.api.model.request.Join;
import org.bigbluebutton.api.model.request.MeetingRequest;
import org.bigbluebutton.api.model.request.MeetingSearchBody;
import org.bigbluebutton.api.model.response.InlineResponse200;
import org.bigbluebutton.api.model.response.InlineResponse201;
import org.bigbluebutton.api.model.response.InlineResponse405;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@Validated
public interface MeetingsApi {

    @Operation(summary = "Create a new meeting", description = "", security = {
        @SecurityRequirement(name = "api_key")    }, tags={ "meeting" })
    @ApiResponses(value = { 
        @ApiResponse(responseCode = "201", description = "Request successful",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = InlineResponse201.class))),
        @ApiResponse(responseCode = "405", description = "Validation error",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = InlineResponse405.class))) })
    @RequestMapping(value = "/meetings",
        produces = { "application/json", "application/xml" }, 
        consumes = { "application/json", "application/xml" }, 
        method = RequestMethod.POST)
    ResponseEntity<InlineResponse201> createMeeting(@Parameter(in = ParameterIn.DEFAULT, description = "Meeting object to be created", required=true,
            schema=@Schema()) @Valid @RequestBody MeetingRequest body);


    @Operation(summary = "End a meeting", description = "", security = {
        @SecurityRequirement(name = "api_key")    }, tags={ "meeting" })
    @ApiResponses(value = { 
        @ApiResponse(responseCode = "204", description = "Meeting was successfully ended"),
        @ApiResponse(responseCode = "404", description = "The specified resource could not be found",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = InlineResponse405.class))),
        @ApiResponse(responseCode = "405", description = "Validation error",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = InlineResponse405.class))) })
    @RequestMapping(value = "/meetings/{meetingId}",
        produces = { "application/json", "application/xml" }, 
        method = RequestMethod.DELETE)
    ResponseEntity<Void> endMeeting(@Parameter(in = ParameterIn.PATH, description = "ID of the meeting to be ended", required=true,
            schema=@Schema()) @PathVariable("meetingId") String meetingId, @Parameter(in = ParameterIn.HEADER, description = "" , required=true,
            schema=@Schema()) @RequestHeader(value="X-Meeting-PW", required=true) String xMeetingPW);


    @Operation(summary = "Retrieve a single meeting", description = "", security = {
        @SecurityRequirement(name = "api_key")    }, tags={ "meeting" })
    @ApiResponses(value = { 
        @ApiResponse(responseCode = "200", description = "Meeting successfully retrieved",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = InlineResponse200.class))),
        @ApiResponse(responseCode = "404", description = "The specified resource could not be found",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = InlineResponse405.class))),
        @ApiResponse(responseCode = "405", description = "Validation error",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = InlineResponse405.class))) })
    @RequestMapping(value = "/meetings/{meetingId}",
        produces = { "application/json", "application/xml" }, 
        method = RequestMethod.GET)
    ResponseEntity<InlineResponse200> findMeetingById(@Parameter(in = ParameterIn.PATH, description = "ID of the meeting to retrieve", required=true,
            schema=@Schema()) @PathVariable("meetingId") String meetingId);


    @Operation(summary = "Retrieve meetings", description = "", security = {
        @SecurityRequirement(name = "api_key")    }, tags={ "meeting" })
    @ApiResponses(value = { 
        @ApiResponse(responseCode = "200", description = "Request successful",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = InlineResponse201.class))),
        @ApiResponse(responseCode = "405", description = "Validation error",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = InlineResponse405.class))) })
    @RequestMapping(value = "/meetings/search",
        produces = { "application/json", "application/xml" }, 
        consumes = { "application/json", "application/xml" }, 
        method = RequestMethod.POST)
    ResponseEntity<InlineResponse201> getMeetings(@Parameter(in = ParameterIn.DEFAULT, description = "Search filters for meetings",
            schema=@Schema()) @Valid @RequestBody MeetingSearchBody body);


    @Operation(summary = "Join a meeting", description = "", security = {
        @SecurityRequirement(name = "api_key")    }, tags={ "meeting" })
    @ApiResponses(value = { 
        @ApiResponse(responseCode = "200", description = "Request successful",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = InlineResponse201.class))),
        @ApiResponse(responseCode = "404", description = "The specified resource could not be found",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = InlineResponse405.class))),
        @ApiResponse(responseCode = "405", description = "Validation error",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = InlineResponse405.class))) })
    @RequestMapping(value = "/meetings/{meetingId}/join",
        produces = { "application/json", "application/xml" }, 
        consumes = { "application/json", "application/xml" }, 
        method = RequestMethod.POST)
    ResponseEntity<InlineResponse201> joinMeeting(@Parameter(in = ParameterIn.PATH, description = "The ID of the meeting the user wishes to join", required=true,
            schema=@Schema()) @PathVariable("meetingId") String meetingId, @Parameter(in = ParameterIn.DEFAULT, description = "", required=true,
            schema=@Schema()) @Valid @RequestBody Join body);


    @Operation(summary = "Retrieve the recordings of a specified meeting", description = "", security = {
        @SecurityRequirement(name = "api_key")    }, tags={ "meeting" })
    @ApiResponses(value = { 
        @ApiResponse(responseCode = "200", description = "Request successful",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = InlineResponse201.class))),
        @ApiResponse(responseCode = "404", description = "The specified resource could not be found",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = InlineResponse405.class))),
        @ApiResponse(responseCode = "405", description = "Validation error",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = InlineResponse405.class))) })
    @RequestMapping(value = "/meetings/{meetingId}/recordings",
        produces = { "application/json", "application/xml" }, 
        method = RequestMethod.GET)
    ResponseEntity<InlineResponse201> meetingRecording(@Parameter(in = ParameterIn.PATH, description = "The ID of the meeting the user wishes to join",
            required=true, schema=@Schema()) @PathVariable("meetingId") String meetingId);


    @Operation(summary = "Update an existing meeting", description = "", security = {
        @SecurityRequirement(name = "api_key")    }, tags={ "meeting" })
    @ApiResponses(value = { 
        @ApiResponse(responseCode = "200", description = "Request successful",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = InlineResponse201.class))),
        @ApiResponse(responseCode = "404", description = "The specified resource could not be found",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = InlineResponse405.class))),
        @ApiResponse(responseCode = "405", description = "Validation error",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = InlineResponse405.class))) })
    @RequestMapping(value = "/meetings/{meetingId}",
        produces = { "application/json", "application/xml" }, 
        consumes = { "application/json", "application/xml" }, 
        method = RequestMethod.PATCH)
    ResponseEntity<InlineResponse201> updateMeeting(@Parameter(in = ParameterIn.PATH, description = "ID of the meeting to be updated", required=true,
            schema=@Schema()) @PathVariable("meetingId") String meetingId, @Parameter(in = ParameterIn.DEFAULT, description = "Meeting object to be updated", required=true, schema=@Schema()) @Valid @RequestBody MeetingRequest body);

}

