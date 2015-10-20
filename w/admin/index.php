<?php

error_reporting(E_ALL);
ini_set('display_errors','On');

function __autoload($class){
	if(file_exists("classes/$class.class.php"))
		include "classes/$class.class.php";
	else
		include "../classes/$class.class.php";
}

include "../config.php";

if(!isset($_SERVER['PHP_AUTH_USER']) || !($_SERVER['PHP_AUTH_USER'] == ADMIN_USER && $_SERVER['PHP_AUTH_PW'] == ADMIN_PASS)) 
{
	header('WWW-Authenticate: Basic realm="Logowanie"');
	header('HTTP/1.0 401 Unauthorized');
	echo 'Dostep ograniczony';
	exit;
}




$Page=new Page();

$cmd=@$_REQUEST["cmd"];


switch($cmd)
{
	default:
	case "kostiumy":
		$Page->setContent(new AdminKostiumy());
		break;
	
	case "grupy":
		$Page->setContent(new AdminGrupy());
		break;
}


$Page->display();


?>
