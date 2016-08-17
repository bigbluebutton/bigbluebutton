// Used in Flash and HTML to show a legitimate break in the line
const BREAK_LINE = '<br/>';

// Soft return in HTML to signify a broken line without
// displaying the escaped '<br/>' line break text
const CARRIAGE_RETURN = '\r';

// Handle this the same as carriage return, in case text copied has this
const NEW_LINE = '\n';

export { BREAK_LINE, CARRIAGE_RETURN, NEW_LINE };
