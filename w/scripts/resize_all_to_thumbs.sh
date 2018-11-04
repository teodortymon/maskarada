#!/bin/bash
for d in */*/ ; do (cd "$d" && mogrify -resize 120x180 *.jpg); done