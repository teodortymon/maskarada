---
layout: t
---
<div class="container">
  <nav class="navbar">
    <div class="container-fluid">
      <h2>Kalendarz ✨</h2>
      <div
        class="btn-group"
        role="group"
        aria-label="Basic radio toggle button group">
        <input
          type="radio"
          class="btn-check"
          name="btnradio"
          id="btnradio1"
          autocomplete="off"
          checked>
        <label class="btn btn-outline-primary" for="btnradio1">Wszystkie 💫</label>
        <input
          type="radio"
          class="btn-check"
          name="btnradio"
          id="btnradio2"
          autocomplete="off">
        <label class="btn btn-outline-primary" for="btnradio2">Dla rodzin 👨‍👩‍👧</label>

        <input
          type="radio"
          class="btn-check"
          name="btnradio"
          id="btnradio3"
          autocomplete="off">
        <label class="btn btn-outline-primary" for="btnradio3">Dla szkol i przedszkoli 🏫</label>
      </div>
    </div>
  </nav>
  <hr>
  <p>
    Gramy dla was w Pałacu Staszica przy
    <i>ul. Nowy Świat 72</i>
  </p>
  {% assign current_month_num = 'now' | date: "%-m" | minus: 1 %}
  {% assign all_miesiace = "styczen,luty,marzec,kwiecien,maj,czerwiec,lipiec,sierpien,wrzesien,pazdziernik,listopad,grudzien" | split: ',' %}
  {% assign miesiace_rest = all_miesiace | slice: current_month_num, 12 %}
  {% assign miesiace_start = all_miesiace | slice: 0, current_month_num %}
  {% assign miesiace = miesiace_rest | concat: miesiace_start %}
  {% for miesiac in miesiace %}

    {% if site.data.spektakle\[miesiac\].repertuar.size > 0 %}

      <div class="card my-2 ">

        <div class="card-body">
          <h4>{{ site.data.spektakle\[miesiac\].title }}</h4>
          <div class="table-responsive">

            <table class="table table-borderles table-sm">
              {% assign spektakle = site.data.spektakle\[miesiac\].repertuar | sort: 'data' %}
              {% for spektakl in spektakle %}
                {% assign dzien_tygodnia = spektakl.data | date: "%w" | minus: 1 | plus: 1 %}
                <tr>
                  <th>{{ spektakl.data | date: "%-d.%m" }}<br>{{ site.data.dni_tygodnia.dni\[dzien_tygodnia\] }} {{ spektakl.data | date: "%R" }}</th>
                  <th>{{ spektakl.tytul }}</th>
                  <th>
                    {% if spektakl.manual_price == true %}
                      {{ spektakl.link }}
                    {% else %}
                      {% if dzien_tygodnia == 0 or dzien_tygodnia == 6 %}
                        {% if spektakl.link == "-" %}
                          <i>Bilety online wkrótce</i>
                        {% else %}
                          <button
                            type="button"
                            href="{{ spektakl.link }}"
                            onclick="fbq('track', 'OpenBuy');"
                            class="btn btn-sm btn-outline-primary">Kup bilet 🎫</button>
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
          </div>
        </div>
      </div>
    {% endif %}

  {% endfor %}

  <br/><br/>

</div>

<!-- <tr>  <th><strike>10.06.2018 niedziela</strike></th>  <th><strike>12.30</strike></th>  <th><strike>Urodziny Turli-Taja</strike></th>  <th>Spektatkl odwołany</th>  </tr> -->
<!-- <tr>  <th>24.06.2018 niedziela</th>  <th>12.30</th>  <th>Calineczka</th>  <th><a href="https://kicket.com/embedded/rezerwacja/107628">Kup bilet</a></th>  </tr> -->
<!-- ## Zapraszamy na
  
  ## Wielki Bal Karnawałowych Rycerzy i Księżniczek
  
  ## już 11.02.2018
  
  ### Dzięki Wypożyczalni Kostiumów Maskarada dzieci bęgą mogły przebrać się za swoich ulubionych bohaterów wziąć udział w karnawałowej zabawie prowadzonej przez naszych aktorów
  
  <br />
  <br />
  <ul class="photos">
  <a id="single_image" rel="1000" href='lay/img/bal_big.jpg'><img src="lay/img/bal_small.jpg"/></a>
  </ul> -->