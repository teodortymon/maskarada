#!/bin/sh

if [ -z $1 ]
then
    echo "
You need to pass a prefix. For example:
 ${0##*/} -file.txt
"
    exit 1
fi

list=`ls *${1} | sort -n`
echo $list

processing='to-be-renamed'
i=1
for f in $list
do
    #DEBUG MODE
    # echo "mv $f ${i}${1}"
    #LIVE MODE
    mv $f ${processing}${i}${1}
    echo "Set to rename: $f ${i}${1}"
    i=$(($i + 1))
done

list=`ls *${1} | sort -n`

i=1
for f in $list
do
    #DEBUG MODE
    # echo "mv $f ${i}${1}"
    #LIVE MODE
    mv $f ${i}${1}
    # echo "Renamed: $f ${i}${1}"
    i=$(($i + 1))
done