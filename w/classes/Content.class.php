<?php

class Content {

	protected $template;
	
	function show(){
		require "tpl/".$this->template.".php";
	}
    function Content() {
    }
}
?>
