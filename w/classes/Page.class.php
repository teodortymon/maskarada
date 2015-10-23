<?php

class Page {

	/**
	 * 
	 */
	private $Content;
	

    function __construct() {
    }
    
    function setContent(Content $Content) {
    	$this -> Content = $Content;
    	
	
	}
    
    function display(){
    	$this ->Content -> show();
    }
    
}
?>
