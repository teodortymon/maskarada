---
layout: w
---
<a href="kostiumy" class="button2">Powrót</a>
<h2><?php echo $this->group["group"]; ?></h2>

<ul class="lista-kostiumow">
<?php foreach($this->photos as $photo): ?>

<li><a href="costumes/large/<?php echo $photo["id"];?>.jpg" rel="group">
	<img src="costumes/thumb/<?php echo $photo["id"];?>.jpg" alt="<?php echo $photo["name"];?>" />
	<?php echo $photo["name"];?>
	</a>
</li>

<?php endforeach; ?>
</ul>
