<?php
define ("DB_USER","maskarad_admin");
define ("DB_HOST","localhost");
define ("DB_NAME","maskarad_strona");
define ("DB_PASS","998896");
define ("BASE_HREF","http://maskarada.waw.pl");

function db_connect(){
	mysql_connect(DB_HOST,DB_USER,DB_PASS);
		  mysql_select_db(DB_NAME);
		  mysql_query("set names UTF8");
}
?>

