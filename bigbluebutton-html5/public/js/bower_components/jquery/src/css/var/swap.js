define(() =>
// A method for quickly swapping in/out CSS properties to get correct calculations.
   function (elem, options, callback, args) {
     let ret,
       name,
       old = {};

	// Remember the old values, and insert the new ones
     for (name in options) {
       old[name] = elem.style[name];
       elem.style[name] = options[name];
     }

     ret = callback.apply(elem, args || []);

	// Revert the old values
     for (name in options) {
       elem.style[name] = old[name];
     }

     return ret;
   });
