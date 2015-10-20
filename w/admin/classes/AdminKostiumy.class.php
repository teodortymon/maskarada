<?php

class AdminKostiumy extends Content {

    protected $template="kostiumy";
    protected $photos;
	protected $groups;
    protected $photo;
	
    function __construct() {
		db_connect();

		// wyrbane zdjecie
		$selected_photo = (int)@$_REQUEST['selected_photo'];
		//czy jest to opcja dodawania
		$add_new = @$_REQUEST['selected_photo']=='new';
		
		// kasowanie elementu
		if(isset($_GET['delete']))
		{
			$id = (int)$_GET['delete'];
			
			//wyrzucamy wpis z bazy
			$query="DELETE FROM `photos` WHERE id=$id";
			if(!($result=mysql_query($query)))
				die(mysql_error());
			
			//kasujemy pliki
			unlink("../costumes/large/$id.jpg");
			unlink("../costumes/thumb/$id.jpg");
			
			//przekierowujemy z powrotem na liste
			header('Location: kostiumy');
		}
		
		// jeżeli został wysłany formularz to edytujemy/zmieniamy
		if(count($_POST))
		{
			// pobieramy wysłane wartosci 
			$id_group = (int)$_POST['id_group'];
			$name = mysql_escape_string($_POST['name']);
			$stars = (int)$_POST['stars'];
			
			// jezeli dodajemy
			if($add_new==true)
			{
				$query="INSERT INTO photos (id, id_group, name, stars) VALUES (0, $id_group, '$name', $stars)";
				if(!($result=mysql_query($query)))
					die(mysql_error());
					
				$selected_photo = mysql_insert_id();
			}
			// jezeli nie dodajemy to zmieniamy
			else
			{
				$query="UPDATE photos SET id_group=$id_group, name='$name', stars=$stars WHERE id=$selected_photo";
				if(!($result=mysql_query($query)))
					die(mysql_error());
			}
			
			// jezeli został wrzucony plik
			if(@$_FILES['photo']['tmp_name'])
			{
				// to robimy miniaturkę i prevke
				Obrazek::zmniejsz($_FILES['photo']['tmp_name'], "../costumes/large/$selected_photo.jpg", 800, 600);
				Obrazek::zmniejsziwytnij($_FILES['photo']['tmp_name'], "../costumes/thumb/$selected_photo.jpg", 120, 180);
			}
			
			// przekierowywujemy na liste kostiumów w odpowienie miejsce
			// wpis po # odnosi automatcyznie do elementu o takim id na stronie 
			header('Location: kostiumy#costume-'.$selected_photo);
		}
		
		// jezeli nie ma wybranego zdjecia to wyrzucamy listę
		if($selected_photo==0 && $add_new==false) 
		{
			$selected_group = 1;
			$this->photos=array();
		  	$query="SELECT * FROM `photos` ORDER BY id_group ASC, stars DESC";
		  	$result=mysql_query($query);
		  	while($row=mysql_fetch_array($result)){
		  		$this->photos[]=$row;
		  	}
		}
		// jezeli jest to pojedynczy element 
		else {
			$this->template = "kostium";
			
			// jezeli nowy to zwracamy tablicę z pustymi wartosciami
			if($add_new)
			{
				$this->photo = array('id'=>'new', 'name'=>'', 'id_group'=>0, 'stars'=>'');
			}
			// jak nie to wyciagamy z bazy
			else {
				$query="SELECT * FROM `photos` WHERE id=$selected_photo";
			  	$result=mysql_query($query);
			  	$row=mysql_fetch_array($result);
			  	$this->photo=$row;
			}
			
			// pobieramy grupy żeby wyświetlić selectboxa z wyborem
			$this->groups=array();
			$query="SELECT * FROM `groups` ORDER BY sort ASC";
		  	$result=mysql_query($query);
		  	while($row=mysql_fetch_array($result)){
		  		$this->groups[]=$row;
			}
			
			// wypisujemy ( tak jak w indexie tylko że bez headera i footera )
			$this->show();
			// i kończymy dalsze wykonywanie
			exit();
			
		}
		  
}
    
    
}
?>