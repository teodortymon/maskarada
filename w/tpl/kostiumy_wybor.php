---
layout: w
---
<h2>Kostiumy</h2>

<ul class="lista-grup">
<?php foreach($this->groups as $group): ?>

<li><a href="kostiumy.php?group=<?php echo $group["id"];?>">
	<img src="costumes/groups/<?php echo $group["id"];?>.jpg" alt="<?php echo $group["group"];?>" />
	<?php echo $group["group"];?>
	</a>
</li>

<?php endforeach; ?>
</ul>
