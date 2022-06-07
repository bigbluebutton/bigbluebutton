function GetURLParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1));
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++) {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam) {
            return sParameterName[1];
        }
    }
}

function AutoClose() {
    window.close();
}

function escapeHTML(text) {
  if (text != null) {
    return text.replace(/&/g, '').
      replace(/</g, ''). 
      replace(/"/g, '').
      replace(/]/g, '').
      replace(/'/g, '');
  }
}

$(document).ready(function() {
    var sClose = GetURLParameter('close');
    var sErrors = GetURLParameter('errors');

    if (typeof sClose != 'undefined') {
        if ( sClose.toLowerCase() === "true" ) {
            AutoClose();
        }
    } else if (typeof sErrors != 'undefined') {
        var errors = $.parseJSON(sErrors);
        //Validate if the json object is correct

        // Render error messages
        $.each(errors, function( index, error ) {
            error.message = escapeHTML(error.message);
            $("#messages").append("<div class='alert alert-danger fade in' style='margin-top:18px;'><a href='#' class='close' data-dismiss='alert' aria-label='close' title='close'>&times;</a><strong><span id='error-key'>Error:</span></strong>&nbsp;<span id='error-message'>"+error.message+"</span></div>");
        });
        $('#messages').removeClass('hidden');
    }
});
