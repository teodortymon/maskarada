#!/bin/bash
set -e # halt script on error
lftp -c "open -u maskarad,tmfev2101 s84.vdl.pl; set ftp:ssl-allow off; mirror --reverse --only-newer ../_site /domains/maskarad.linuxpl.info/public_html"
