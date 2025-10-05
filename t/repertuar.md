---
layout: t
---

<link crossorigin="anonymous" href="https://unpkg.com/purecss@0.6.2/build/pure-min.css" integrity="sha384-UQiGfs9ICog+LwheBSRCt1o5cbyKIHbwjWscjemyBMT9YCUMZffs6UqUTd0hObXD" rel="stylesheet">

## Repertuar

## Szanowni Widzowie!

Gramy dla was w Pałacu Staszica przy **ul. Nowy Świat 72**

<br/>
<br/>
{% assign miesiace = "styczen,luty,marzec,kwiecien,maj,czerwiec,lipiec,sierpien,wrzesien,pazdziernik,listopad,grudzien" | split: ',' %}
{% for miesiac in miesiace %}

{% if site.data.spektakle\[miesiac\].repertuar.size > 0 %}

## {{site.data.spektakle\[miesiac\].title}}

<table class="pure-table pure-table-horizontal">
{% assign spektakle = site.data.spektakle\[miesiac\].repertuar | sort: 'data' %}
{% for spektakl in spektakle %}
{% assign dzien_tygodnia = spektakl.data | date: "%w" | minus: 1 | plus: 1 %}
<tr>
<th>{{ spektakl.data | date: "%-d.%m" }}<br/>{{ site.data.dni_tygodnia.dni\[dzien_tygodnia\] }}</th>
<th>{{ spektakl.data | date: "%R"  }}</th>
<th style="width: 40%;">{{ spektakl.tytul }}</th>
<th>
{% if spektakl.manual_price == true %}
{{ spektakl.link }}
{% else %}
{% if dzien_tygodnia == 0 or dzien_tygodnia == 6 %}
{% if spektakl.link == "-" %}
<i>Bilety online wkrótce</i>
{% else %}
<a onclick="fbq('track', 'OpenBuy');" href="{{ spektakl.link }}">Kup bilet</a>
{% endif %}
{% else %}
Zapraszamy grupy zorganizowane do rezerwacji tel.
<a href="tel:501-027-278" onclick="fbq('track', 'CallFromEventList');">501 027 278</a>
{% endif %}
{% endif %}
</th>
</tr>
{% endfor %}
</table>
<br /><br />
{% endif %}

{% endfor %}

<br/><br/>

<style>
.pure-table thead {
background-color: rgba(143, 223, 255, 0.19) !important;
color: #000;
text-align: left;
vertical-align: bottom;
}
</style>

<!-- 	<tr>
<th><strike>10.06.2018 niedziela</strike></th>
<th><strike>12.30</strike></th>
<th><strike>Urodziny Turli-Taja</strike></th>
<th>Spektatkl odwołany</th>
</tr> -->
<!-- 	<tr>
<th>24.06.2018 niedziela</th>
<th>12.30</th>
<th>Calineczka</th>
<th><a href="https://kicket.com/embedded/rezerwacja/107628">Kup bilet</a></th>
</tr> -->

<!-- ## Zapraszamy na

## Wielki Bal Karnawałowych Rycerzy i Księżniczek

## już 11.02.2018

### Dzięki Wypożyczalni Kostiumów Maskarada dzieci bęgą mogły przebrać się za swoich ulubionych bohaterów wziąć udział w karnawałowej zabawie prowadzonej przez naszych aktorów

<br />
<br />
<ul class="photos">
<a id="single_image" rel="1000" href='lay/img/bal_big.jpg'><img src="lay/img/bal_small.jpg"/></a>
</ul> -->
