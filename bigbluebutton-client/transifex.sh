#!/bin/bash

for i in * ; do
        if [ -d "$i" ]; then
                # echo "processing $i"
                if [ -f $i.properties ]; then
                        if [ "$1" == "-test" ]; then
                                echo "mv -f $i.properties $i/bbbResources.properties"
                        else
                                #echo "no"
                                mv -f $i.properties $i/bbbResources.properties
                        fi
                fi
        fi
done

