
<form action="grupy" method="post" enctype="multipart/form-data" class="admin" >
	<fieldset class="img" >
		<p>
			<input type="hidden" name="selected_group" value="<?php echo $this->group['id']; ?>" />
<?php if ($this->group['id'] != 'new'): ?>
			<img alt="" src="../costumes/groups/<?php echo $this->group['id']; ?>.jpg" />
			x <a href="grupy?delete=<?php echo $this->group['id']; ?>" >Skasuj grupę</a>
<?php endif;?>
		</p>
	</fieldset>
	<fieldset >
		<p>
			<label for="f-cover" >Okładka:</label>
			<input type="file" id="f-cover" name="cover" size="30" />
		</p>
		<p>
			<label for="f-group" >Opis:</label>
			<input type="text" id="f-group" name="group" value="<?php echo htmlspecialchars($this->group['group']); ?>" size="20" maxlength="250" />
		</p>
		<p>
			<label for="f-sort" >Kolejność:</label>
			<input type="text" id="f-sort" name="sort" value="<?php echo $this->group['sort']; ?>" size="10" maxlength="3" />
		</p>
		<p>
			<input type="submit" value="Zapisz" class="button" />
		</p>
	</fieldset>
</form>