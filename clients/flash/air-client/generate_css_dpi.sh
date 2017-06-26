#!/bin/bash

# Install bc binary to use this command line tool `sudo apt-get install bc`
# Then install cssbeautify-cli node.js library `sudo npm install -g cssbeautify-cli`
# Resolution arrays declaration
declare -a files=("ldpi" "mdpi" "hdpi" "xxhdpi" "xxxhdpi")
declare -a resolutions=("120" "160" "240" "480" "640")
declare -a ratios=("0.375" "0.5" "0.75" "1.5" "2")

# Loop over resolution array
for i in "${!files[@]}"
do
	echo "Generating file ${files[$i]}.css with ${resolutions[$i]} dpi resolution"
	# Delete the old file
	rm src/css/tmp.css 2> /dev/null
    while IFS='' read line || [[ -n "$line" ]]; do
        regex="(.*):(\s*)([0-9]*);"
		# Find any digit that matches the regex
        if [[ $line =~ $regex ]]
        then
			# Calculate the new value
            res_value=$(echo "scale=2; ${BASH_REMATCH[3]}*${ratios[$i]}" | bc -l)
			# Replace the matched regex
            echo $line | sed "s/${BASH_REMATCH[3]}/${res_value}/g" >> src/css/tmp.css
        else
			# Or write the line as it is
            echo $line >> src/css/tmp.css
        fi
	# Always use xhdpi.css as base to generate css files
    done < src/css/xhdpi.css
	
	# Write the new resolution to the generated file
	sed -ri "s/(application-dpi:\s*)[0-9]*/\1${resolutions[$i]}/g" src/css/tmp.css
	echo "Running CSS beautifier on ${files[$i]}.css"
	cssbeautify-cli -i4 -f "src/css/tmp.css" -w "src/css/output.css"
	# Remove the first commented line
	sed '1d' src/css/output.css > "src/css/${files[$i]}.css";
	rm src/css/output.css
done

# Finally delete the temporary file
rm src/css/tmp.css
