<?php

// 19 X 2007

class Obrazek
{
	static $obrazki_mime = array('image/png', 'image/gif', 'image/jpeg', 'image/pjpeg');
	static function jest_obrazkiem($obrazek)
	{
		$info = getimagesize($obrazek);
		return in_array($info['mime'], self::$obrazki_mime);
	}
	
	static function zmniejsz($zrodlowy, $docelowy, $newX, $newY, $dopasuj = true, $docelowy_mime = 'image/jpeg')
	{
		if(!file_exists($zrodlowy)) {
			Strona::blad('Brak pliku: '.$zrodlowy);
			return 1;
		}

		$info = getimagesize($zrodlowy);
		if(!preg_match('/image\//', $info['mime']) ) return 0;

		switch( $info['mime'] ){
			case 'image/png': $img = imagecreatefrompng($zrodlowy); break;
			case 'image/gif': $img = imagecreatefromgif($zrodlowy); break;
			case 'image/jpeg': $img = imagecreatefromjpeg($zrodlowy); break;
			case 'image/pjpeg': $img = imagecreatefromjpeg($zrodlowy); break;
			default: $img = imagecreatefromjpeg($zrodlowy); break;
		}

		if($img) {
			$oldX = imagesX($img);
			$oldY = imagesY($img);
			if($newX && $newY && $dopasuj) 
			{
				if($oldX / $oldY > $newX / $newY ) $newY = 0;
				else $newX = 0;
			} 
			if($newX == 0) {
				$newX = $newY * $oldX / $oldY;
			} else if($newY == 0) {
				$newY = $newX * $oldY / $oldX;
			}
			if($oldX > $newX || $oldY > $newY || $info['mime'] != $docelowy_mime ) 
			{
				$im = @imagecreatetruecolor($newX, $newY);
				if(!@imagecopyresampled ($im, $img, 0, 0, 0, 0, $newX, $newY, $oldX, $oldY))
					Strona::blad('Błąd imagecopyresized() '.$zrodlowy);
				else {
					switch( $docelowy_mime )
					{
						case 'image/png': @imagepng($im, $docelowy, 120 ); break;
						case 'image/gif': @imagegif($im, $docelowy); break;
						case 'image/jpeg': @imagejpeg($im, $docelowy, 120 ); break;
						case 'image/pjpeg': @imagejpeg($im, $docelowy, 120 ); break;
						default: @imagejpeg($im, $docelowy, 120 ); break;
					}
					$return = 0;
				}
			} else {
				@copy($zrodlowy, $docelowy);
				$return = 0;
			}
		} else {
			Strona::blad('Błąd imagecreatefrom...() '.$zrodlowy);
		}
		return $return;
	}
	
	static function zmniejsziwytnij($zrodlowy, $docelowy, $newW, $newH, $docelowy_mime = 'image/jpeg')
	{
		if(!file_exists($zrodlowy)) {
			Strona::blad('Brak pliku: '.$zrodlowy);
			return 0;
		}

		$info = getimagesize($zrodlowy);
		if(!preg_match('/image\//', $info['mime']) ) 
			return 0;

		switch( $info['mime'] )
		{
			case 'image/png': $img = imagecreatefrompng($zrodlowy); break;
			case 'image/gif': $img = imagecreatefromgif($zrodlowy); break;
			case 'image/jpeg': $img = imagecreatefromjpeg($zrodlowy); break;
			case 'image/pjpeg': $img = imagecreatefromjpeg($zrodlowy); break;
			default: $img = imagecreatefromjpeg($zrodlowy); break;
		}

		if($img) {
			$orgW = imagesX($img);
			$orgH = imagesY($img);
			if($orgH/$orgW > $newH/$newW)
			{
				// ze srodka w pionie
				$oldX = 0;
				$oldW = $orgW;
				$oldH = (int) ($newH*$oldW/$newW);
				$oldY = (int) (($orgH-$oldH)/2);
			}
			else {
				// se srodka w poziomie
				$oldY = 0;
				$oldH = $orgH;
				$oldW = (int) ($newW*$oldH/$newH);
				$oldX = (int) (($orgW-$oldW)/2);
			}
			
			$im = @imagecreatetruecolor($newW, $newH);
			if(!@imagecopyresampled ($im, $img, 0, 0, $oldX, $oldY, $newW, $newH, $oldW, $oldH))
				Strona::blad('Błąd imagecopyresized() '.$zrodlowy);
			else {
				switch( $docelowy_mime )
				{
					case 'image/png': @imagepng($im, $docelowy, 120 ); break;
					case 'image/gif': @imagegif($im, $docelowy); break;
					case 'image/jpeg': @imagejpeg($im, $docelowy, 120 ); break;
					case 'image/pjpeg': @imagejpeg($im, $docelowy, 120 ); break;
					default: @imagejpeg($im, $docelowy, 120 ); break;
				}
				$return = 1;
			}
		} else {
			Strona::blad('Błąd imagecreatefrom...() '.$zrodlowy);
		}
		return $return;
	}
	
	static function zmniejszidopelnij($zrodlowy, $docelowy, $newW, $newH, $kolot_tla='FFFFFF', $docelowy_mime = 'image/jpeg')
	{
		if(!file_exists($zrodlowy)) {
			Strona::blad('Brak pliku: '.$zrodlowy);
			return 1;
		}

		$info = getimagesize($zrodlowy);
		if(!preg_match('/image\//', $info['mime']) ) 
			return 1;

		switch( $info['mime'] )
		{
			case 'image/png': $img = imagecreatefrompng($zrodlowy); break;
			case 'image/gif': $img = imagecreatefromgif($zrodlowy); break;
			case 'image/jpeg': $img = imagecreatefromjpeg($zrodlowy); break;
			case 'image/pjpeg': $img = imagecreatefromjpeg($zrodlowy); break;
			default: $img = imagecreatefromjpeg($zrodlowy); break;
		}

		if($img) 
		{
			$oldX = imagesX($img);
			$oldY = imagesY($img);
			$newX = $newW;
			$newY = $newH;
			if($newX && $newY)
			{
				if($oldX / $oldY > $newX / $newY ) $newY = 0;
				else $newX = 0;
			} 
			if($newX == 0) {
				$newX = $newY * $oldX / $oldY;
			} else if($newY == 0) {
				$newY = $newX * $oldY / $oldX;
			}
			
			$im = @imagecreatetruecolor($newW, $newH);
			$r = hexdec(substr($kolot_tla, 0, 2));
		    $g = hexdec(substr($kolot_tla, 2, 2));
		    $b = hexdec(substr($kolot_tla, 4, 2));
		    
			$bgcolor = imagecolorallocate($im, $r, $g, $b);
			imagefill($im, 0, 0, $bgcolor);

			if(!@imagecopyresampled($im, $img, floor(($newW-$newX)/2), floor(($newH-$newY)/2), 0, 0, $newX, $newY, $oldX, $oldY))
				Strona::blad('Błąd imagecopyresized() '.$zrodlowy);
			else 
			{
				switch( $docelowy_mime )
				{
					case 'image/png': @imagepng($im, $docelowy, 120 ); break;
					case 'image/gif': @imagegif($im, $docelowy); break;
					case 'image/jpeg': @imagejpeg($im, $docelowy, 120 ); break;
					case 'image/pjpeg': @imagejpeg($im, $docelowy, 120 ); break;
					default: @imagejpeg($im, $docelowy, 120 ); break;
				}
				$return = 0;
			}
		} else {
			Strona::blad('Błąd imagecreatefrom...() '.$zrodlowy);
		}
		return $return;
	}
	
	static function wytnij($zrodlowy, $docelowy, $newX, $newY)
	{
		if(!file_exists($zrodlowy)) {
			Strona::blad('Brak pliku: '.$zrodlowy);
			return 1;
		}
		$return =0;
		if($img = @imagecreatefromjpeg($zrodlowy)) {
			$oldX = imagesX($img);
			$oldY = imagesY($img);
			if($newX == 0) {
				$newX = $oldX;
			}
			if($newY == 0) {
				$newY = $oldY;
			}
			$im = @imagecreatetruecolor($newX, $newY);
			if(!@imagecopy ($im, $img, 0, 0, 0, 0, $newX, $newY))
				Strona::blad('Błąd imagecopyresized() '.$zrodlowy);
			else {
				@imagejpeg($im, $docelowy, 120 );
				$return = 0;
			}
		} else {
			Strona::blad('Błąd imagecreatefromjpeg() '.$zrodlowy);
		}
		return $return;
	}
}

?>