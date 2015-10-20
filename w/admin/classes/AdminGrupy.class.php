<?php

class AdminGrupy extends Content {

    protected $template="grupy";
    protected $groups;
	protected $group;
	
    function __construct() {
		db_connect();

		$selected_group = (int)@$_REQUEST['selected_group'];
		$add_new = @$_REQUEST['selected_group']=='new';
		
		if(isset($_GET['delete']))
		{
			$id = (int)$_GET['delete'];
			$query="DELETE FROM `groups` WHERE id=$id";
			if(!($result=mysql_query($query)))
				die(mysql_error());
			
			unlink("../costumes/groups/$id.jpg");
			
			header('Location: grupy');
		}
		
		if(count($_POST))
		{
			$group = mysql_escape_string($_POST['group']);
			$sort = (int)$_POST['sort'];
			
			if($add_new==true)
			{
				$query="INSERT INTO `groups` (`id`, `group`, `sort`) VALUES (0, '$group', $sort)";
				if(!($result=mysql_query($query)))
					die(mysql_error());
					
				$selected_group = mysql_insert_id();
			}
			else
			{
				$query="UPDATE `groups` SET `group`='$group', `sort`=$sort WHERE `id`=$selected_group";
				if(!($result=mysql_query($query)))
					die(mysql_error());
			}
			if(@$_FILES['cover']['tmp_name'])
			{
				Obrazek::zmniejsziwytnij($_FILES['cover']['tmp_name'], "../costumes/groups/$selected_group.jpg", 120, 180);
			}
			header('Location: grupy#group-'.$selected_group);
		}
		
		
		if($selected_group==0 && $add_new==false) {
			
			$this->groups=array();
		  	$query="SELECT * FROM `groups` ORDER BY sort ASC";
		  	$result=mysql_query($query);
		  	while($row=mysql_fetch_array($result)){
		  		$this->groups[]=$row;
		  	}
		}
		else {
						
			$this->template = "grupa";
			
			if($add_new)
			{
				$this->group = array('id'=>'new', 'group'=>'', 'sort'=>'');
			}
			else {
				$query="SELECT * FROM `groups` WHERE id=$selected_group";
			  	$result=mysql_query($query);
			  	$row=mysql_fetch_array($result);
			  	$this->group=$row;
			}			
			$this->show();
			exit();
			
		}
		  
}
    
    
}
?>