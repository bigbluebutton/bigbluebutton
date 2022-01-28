function GetURLParameter(sParam) {
    const sPageURL = decodeURIComponent(window.location.search.substring(1));
    const sURLVariables = sPageURL.split('&');
    for (let i = 0; i < sURLVariables.length; i++) {
        const sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam) {
            return sParameterName[1];
        }
    }
}

function AutoClose() {
    window.close();
}

function removeErrorElement(){
    let msgs = document.getElementById('messages');
    while (msgs.firstChild) {
        msgs.removeChild(msgs.firstChild);
    }
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

const sClose = GetURLParameter('close');
const sErrors = GetURLParameter('errors');
if (typeof sClose != 'undefined') {
    if ( sClose.toLowerCase() === "true" ) {
        AutoClose();
    }
} else if (typeof sErrors != 'undefined') {
    let errors = [];
    try {
        errors = JSON.parse(sErrors);
    } catch(err) {
        errors = [{
            message: "Error message could not be read (" + err + ")",
            key: "unreadbleErrorMessage"
        }];
    }

    //Render error message
    for(errorObj of errors){
        if(errorObj.message){
            let errorElement = document.createElement('div');

            errorElement.innerHTML =
            "<div class='alert alert-danger fade in' style='margin-top:18px;'><a href='#' class='close' data-dismiss='alert' aria-label='close' title='close' onClick=removeErrorElement()>&times;</a><strong><span id='error-key'>Error:</span></strong>&nbsp;<span id='error-message'>"
            + errorObj.message
            + "</span></div>";

            let msgs = document.getElementById('messages');
            msgs.appendChild(errorElement);
        }
    }  
}
