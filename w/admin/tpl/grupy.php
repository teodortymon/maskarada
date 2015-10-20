<h2>Grupy</h2>

<ul class="lista-grup">
<?php foreach($this->groups as $group): ?>

<li id="group-<?php echo $group["id"];?>" ><a href="grupy?selected_group=<?php echo $group["id"];?>" >
	<img src="../costumes/groups/<?php echo $group["id"];?>.jpg" />
	<?php echo $group["group"];?>
	</a>
</li>

<?php endforeach; ?>

<li id="group-new" ><a href="grupy?selected_group=new" >
	<span style="display: block; font-size: 72px; height: 120px; padding-top: 70px;" >+</span>
	Dodaj nową
	</a>
</li>

</ul>
