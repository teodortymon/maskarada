<!DOCTYPE html>
<html>

  <body>

    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"
	"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="pl" >
<head>
	<meta http-equiv="content-type" content="text/html; charset=utf-8" />
	<meta name="Description" content="Szeroki wybór ponad 800 kostiumów i strojów dla dzieci. Nasz adres: Warszawa Zacisze ul. Ewy 5" />
	<meta name="Content-Language" content="pl" />
	<title>MASKARADA Wypożyczalnia kostiumów dla dzieci</title>
	<link rel="stylesheet" href="js/fancybox/jquery.fancybox-1.3.1.css" type="text/css" />
	<link rel="stylesheet" href="lay/style.css" type="text/css" />

	<base href="BASE_HREF"/>

	<script type="text/javascript" src="js/jquery.js"></script>
	<script type="text/javascript" src="js/fancybox/jquery.fancybox-1.3.1.pack.js"></script>
	
	<script type="text/javascript">
    //<![CDATA[
		$(document).ready(function () {
			$(".lista-kostiumow a").fancybox();
		// 	var isshow = localStorage.getItem('bal');
	    // // var isshow = null;
	    // if (isshow== null) {
	    //     localStorage.setItem('bal', 1);

	    //     // Show popup here
	    //     // $.fancybox(
	    //     // 		'<center><br /><br /><br /><h2>Rusza nasza nowa Szkoła Szycia</h2><br /><br /><p>Warsztaty szycia prowadzone przez kostiumologów i krawcowe w Kostiumerii Teatru Maskarada<br />Więcej informacji: <a href="http://www.maskarada.waw.pl/t/warsztaty.html"> Szkoła Szycia <br /><p><img src="../t/lay/img/szycie_big.jpg" alt="Szkoła szycia" /></p></a></p></center>',
	    //     // 		{
	    //     //         		'autoDimensions'	: false,
	    //     // 			'width'         		: 700,
	    //     // 			'height'        		: 900,
	    //     // 			// 'transitionIn'		: 'none',
	    //     // 			// 'transitionOut'		: 'none'
	    //     // 		}
	    //     // 	);

		// 	$.fancybox(
		// 		'<center><br /><br /><br /><h2>Wielki Bal Rycerzy i Księżniczek</h2><br /><br /><p>Teatr Maskarada, księgarnia Tarabuk i Nowy Świat Muzyki zapraszają na bal karnawałowy: Wielki Bal Rycerzy i Księżniczek. <br />Bal poprowadzi król Zbigniew Kozłowski a więc zabawa do utraty tchu gwarantowana. Na miejscu możliwość wypożyczenia kostiumy ze zbiorów Wypożyczalni Kostiumów Maskarada.Zachęcamy dzieci i dorosłych do przebrania w karnawałowe szaty.<br />Więcej informacji: <a href="http://www.maskarada.waw.pl/t/repertuar.html"> Wielki Bal <br /><p><img src="../t/lay/img/bal_big.jpg" alt="Wielki Bal" /></p></a></p></center>',
		// 		{
		// 										'autoDimensions'	: false,
		// 			'width'         		: 700,
		// 			'height'        		: 900,
		// 			// 'transitionIn'		: 'none',
		// 			// 'transitionOut'		: 'none'
		// 		}
		// 	);
	    // }
		});

    //]]>
    </script>
	<script type="text/javascript">

  var _gaq = _gaq || [];
  _gaq.push(['_setAccount', 'UA-28621698-1']);
  _gaq.push(['_trackPageview']);

  (function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
  })();
	
</script>
</head>
<body > 

<div id="page">

<div id="header" class="container" >
	<h1><a href="index.html">MASKARADA Wypożyczalnia kostiumów dla dzieci</a></h1>
	<ul>
		<li><a href="index.html">Strona główna</a></li>
		<li><a href="kostiumy.php">Kostiumy</a></li>
		<li><a href="cennik.html">Cennik</a></li>
		<li><a href="kontakt.html">Kontakt</a></li>
	</ul>
</div>

<div id="main" class="container">
	


        <a href="kostiumy.php" class="button2">Powrót</a>
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

  
    </div></div>
<center><a href="/t/index.html"><img src="lay/img/mini_t.png" style="" alt="MASKARADA Teatr dla dzieci Warszawa" /></a></center>
<div id="footer" class="container">
	Wszelkie prawa zastrzeżone &copy;
	Maskarada 2012  | Wypożyczalnia kostiumów dla dzieci Warszawa
</div>
	
</body>
</html>


  </body>

</html>
