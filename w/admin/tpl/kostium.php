
<form action="kostiumy" method="post" enctype="multipart/form-data" class="admin" >
	<fieldset class="img" >
		<p>
			<input type="hidden" name="selected_photo" value="<?php echo $this->photo['id']; ?>" />
<?php if ($this->photo['id'] != 'new'): ?>
			<img alt="" src="http://www.maskarada.waw.pl/w/costumes/thumb/<?php echo $this->photo['id']; ?>.jpg" />
			x <a href="kostiumy?delete=<?php echo $this->photo['id']; ?>" >Skasuj kostium</a>
<?php endif; ?>
		</p>
	</fieldset>
	<fieldset >
		<p>
			<label for="f-photo" >Zdjęcie:</label>
			<input type="file" id="f-photo" name="photo" size="30" />
		</p>
		<p>
			<label for="f-id_group" >Grupa:</label>
			<select id="f-id_group" name="id_group" >
<?php foreach($this->groups as $group): ?>
				<option value="<?php echo $group['id']; ?>" <?php if($group['id'] == $this->photo['id_group']) echo 'selected="selected"' ?> ><?php echo $group['group']; ?></option>
<?php endforeach; ?>
			</select>
		</p>
		<p>
			<label for="f-name" >Opis:</label>
			<input type="text" id="f-name" name="name" value="<?php echo htmlspecialchars($this->photo['name']); ?>" size="20" maxlength="250" />
		</p>
		<p>
			<label for="f-stars" >Ocena (1-10):</label>
			<input type="text" id="f-stars" name="stars" value="<?php echo $this->photo['stars']; ?>" size="10" maxlength="3" />
		</p>
		<p>
			<input type="submit" value="Zapisz" class="button" />
		</p>
	</fieldset>
</form>