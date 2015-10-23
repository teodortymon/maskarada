<?php

class ContentKostiumy extends Content {

    protected $template="kostiumy";
    protected $photos;
	protected $group;
	protected $groups;
	    
    function __construct() {
		  db_connect();
		
		  
		  $selected_group=(int)@$_GET["group"];
		  
		  if($selected_group==0){
		  	$this->template="kostiumy_wybor";
		  	$this->groups=array();
		  	$query="SELECT * FROM `groups` ORDER BY sort ASC";
		  	$result=mysql_query($query);
		  	while($row=mysql_fetch_array($result)){
		  		$this->groups[]=$row;
			  }
		  }
		  else{
		  	$this->photos=array();
		  	$query="SELECT * FROM `photos` WHERE id_group=$selected_group ORDER BY stars DESC";
		  	$result=mysql_query($query);
		  	while($row=mysql_fetch_array($result)){
		  		$this->photos[]=$row;
		  	}
		  	
		  	$query="SELECT * FROM `groups` WHERE id=$selected_group";
		  	$result=mysql_query($query);
		  	$row=mysql_fetch_array($result);
		  	$this->group=$row;
		  		  	
		  }
		 
		  
		  
}
    
    
}
?>