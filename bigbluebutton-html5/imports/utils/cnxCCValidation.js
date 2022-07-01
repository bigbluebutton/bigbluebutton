var validStart = ['3', '4', '5', '6'];
const checkIsCreditCardNo = (value) => {
var value1 = value.replace(/\s/g, '');
var ccNumSt = value1.replace("[^\\d]", "");
ccNumSt = ccNumSt.replace("\\s+", "");
ccNumSt = ccNumSt.replace(/-/g, "");
    ccNumSt = ccNumSt.replace(/\*/g, "");
    ccNumSt = ccNumSt.replace(/\./g, "");
    ccNumSt = ccNumSt.replace(/_/g, "");
    ccNumSt = ccNumSt.replace(/\//g, "");
    var length = ccNumSt.length;
    if (ccNumSt.length < 13) {
        return false;
    }
    var positTocheck = ccNumSt.length - 13;
    var isValid = false;
    if (positTocheck > 0) {
        var firstDigit = ccNumSt.charAt(0);
        isValid = checkForvalidStart(firstDigit);
        if (isValid) {
            var secDigit = ccNumSt.charAt(1);
            switch (firstDigit) {
                case '3': {
                    if (((secDigit === '4' || secDigit === '7') && length === 15) || ((secDigit === '0' || secDigit === '6' || secDigit === '8') && length === 14)) {

                        isValid = true;
                    } else {
                        isValid = false;
                    }
                    break;
                }
                case '4': {
                    if (length === 13 || length === 16) {
                        isValid = true;
                    } else {
                        isValid = false;
                    }
                    break;
                }
                case '5': {

                    var secnum = parseInt("" + secDigit, 36);
                    if (secnum >= 1 && secnum <= 5 && length === 16) {
                        isValid = true;
                    } else {
                        isValid = false;
                    }
                    break;
                }
                default: {

                }
            }

            isValid = validCreditCardCheck(ccNumSt);


        }
        return isValid;
    }

}
const validCreditCardCheck = (value) => {

    var isValid = true;
    var ints = new Array(value.length);
    for (let i = 0; i < value.length; i += 1) {
        ints[i] = parseInt(value.substring(i, i + 1));
    }
    for (let i = ints.length - 2; i >= 0; i = i - 2) {
        var j = ints[i];
        j = parseInt(j) * 2;
        if (j > 9) {
            j = j % 10 + 1;
        }
        ints[i] = j;
    }

    var sum = 0;
    for (let i = 0; i < ints.length; i += 1) {
        sum += ints[i];
    }
    if (sum % 10 === 0) {
        isValid = true;

    } else {
        isValid = false;
    }
    return isValid;

}
const maskCreditCard = (parsedMessage) => {
    var maskedtext = parsedMessage;
    var re19 = /\b(\d[ *-._/]?){18}\d\b/g;
    var re18 = /\b(\d[ *-._/]?){17}\d\b/g;
    var re17 = /\b(\d[ *-._/]?){16}\d\b/g;
    var re16 = /\b(\d[ *-._/]?){15}\d\b/g;
    var re15 = /\b(\d[ *-._/]?){14}\d\b/g;
    var re14 = /\b(\d[ *-._/]?){13}\d\b/g;
    var re13 = /\b(\d[ *-._/]?){12}\d\b/g;
    var digit_19_numbers = maskedtext.match(re19);
    if (digit_19_numbers !== null) {
        digit_19_numbers.forEach((number) => {
            var isCreditCard = checkIsCreditCardNo(number);
            if (isCreditCard) {
                maskedtext = maskedtext.replace(number, "XXXX-XXXX-XXXX-XXXX-" + (number.substring(number.length - 3)));
            }
        });
    }
    var digit_18_numbers = maskedtext.match(re18);
    if (digit_18_numbers !== null) {
        digit_18_numbers.forEach((number) => {
            var isCreditCard = checkIsCreditCardNo(number);
            if (isCreditCard) {
                maskedtext = maskedtext.replace(number, "XXXX-XXXX-XXXXX-" + (number.substring(number.length - 5)));
            }
        });
    }
    var digit_17_numbers = maskedtext.match(re17);
    if (digit_17_numbers !== null) {
        digit_17_numbers.forEach((number) => {
            var isCreditCard = checkIsCreditCardNo(number);
            if (isCreditCard) {
                maskedtext = maskedtext.replace(number, "XXXX-XXXX-XXXX-" + (number.substring(number.length - 5)));
            }
        });
    }
    var digit_16_numbers = maskedtext.match(re16);
    if (digit_16_numbers !== null) {
        digit_16_numbers.forEach((number) => {
            var isCreditCard = checkIsCreditCardNo(number);
            if (isCreditCard) {
                maskedtext = maskedtext.replace(number, "XXXX-XXXX-XXXX-" + (number.substring(number.length - 4)));
            }
        });
    }
    var digit_14_numbers = maskedtext.match(re14);
    if (digit_14_numbers !== null) {
        digit_14_numbers.forEach((number) => {
            var isCreditCard = checkIsCreditCardNo(number);
            if (isCreditCard) {
                maskedtext = maskedtext.replace(number, "XXXX-XXXXXX-" + (number.substring(number.length - 4)));
            }
        });
    }
    var digit_13_numbers = maskedtext.match(re13);
    if (digit_13_numbers !== null) {
        digit_13_numbers.forEach((number) => {
            var isCreditCard = checkIsCreditCardNo(number);
            if (isCreditCard) {
                maskedtext = maskedtext.replace(number, "XXXX-XXXX-" + + (number.substring(number.length - 5)));
            }
        });
    }
    var digit_15_numbers = maskedtext.match(re15);
    if (digit_15_numbers !== null) {
        digit_15_numbers.forEach((number) => {
            var isCreditCard = checkIsCreditCardNo(number);
            if (isCreditCard) {
                maskedtext = maskedtext.replace(number, "XXXX-XXXX-XXXX-" + (number.substring(number.length - 3)));
            }


        });
    }
    return maskedtext;
}

checkForvalidStart = (firstDigit) => {
    var isValid = false;
    validStart.forEach((char) => {
        if (char === firstDigit) {
            console.log('coming inside for Each of');
            isValid = true;

        }
    });
    return isValid;
}

const cnxCCValidation = {


maskCreditCard

}


export default cnxCCValidation
