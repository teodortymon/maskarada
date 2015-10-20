<h2>Kostiumy</h2>

<h1>1</h1><div class="group-1 g"><ul class="lista-kostiumow">

<?php 
$pphoto = $this->photos[0];
foreach($this->photos as $photo): 
	if($photo['id_group'] != $pphoto['id_group']){
		echo '</ul></div><br /><br /><h1>' . $photo['id_group'] . '</h1><div class="g group-' . $photo['id_group'] . '"><ul class="lista-kostiumow">';}?>

<li id="costume-<?php echo $photo["id"];?>" ><a href="?selected_photo=<?php echo $photo["id"];?>" >
	<img src="http://www.maskarada.waw.pl/w/costumes/thumb/<?php echo $photo["id"];?>.jpg" />
	<?php echo $photo["name"];
	$pphoto = $photo;?>
	</a>
</li>
<?php ?>
<?php endforeach; ?>
</ul></div>
<ul class="lista-kostiumow">
<li id="costume-new" ><a href="?selected_photo=new" >
	<span style="display: block; font-size: 72px; height: 120px; padding-top: 70px;" >+</span>
	Dodaj nowy
	</a>
	</li></ul>

	
<script>
$( document ).ready(function() {
	$(".g").toggle();
	$( "h1" ).click(function() {
	  $(".group-"+$(this).html()).toggle();
	});
});
</script>
