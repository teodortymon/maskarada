---
layout: t
---
<style>
  .card-body {
    padding: 1.5rem 2rem;
  }
  .table {
    width: 95%;
    margin: 0 auto;
  }
  .table td {
    vertical-align: middle;
  }
  .table td:first-child {
    width: 25%;
  }
  .table td:nth-child(2) {
    width: 35%;
  }
  .table td:last-child {
    width: 40%;
  }

  /* Mobile responsive styles */
  @media (max-width: 768px) {
    /* Compact radio buttons for mobile */
    .btn-group {
      display: flex;
      gap: 4px;
      width: 100%;
    }

    .btn-group .btn {
      font-size: 0.7rem;
      padding: 0.4rem 0.3rem;
      white-space: normal;
      word-wrap: break-word;
      flex: 1;
      min-width: 0;
      line-height: 1.2;
      -webkit-tap-highlight-color: transparent;
      -webkit-appearance: none;
      position: relative;
    }

    /* Remove iOS blue background/highlight */
    .btn-group .btn:focus,
    .btn-group .btn:active,
    .btn-group .btn:focus-visible {
      outline: none;
      box-shadow: none;
    }

    /* White text for checked/active buttons */
    .btn-check:checked + .btn-outline-primary,
    .btn-outline-primary:active,
    .btn-outline-primary.active {
      color: #fff !important;
      background-color: #0d6efd !important;
      border-color: #0d6efd !important;
    }

    /* Hide the actual radio input */
    .btn-check {
      position: absolute;
      clip: rect(0, 0, 0, 0);
      pointer-events: none;
    }

    /* Stack table rows vertically on mobile */
    .table {
      width: 100%;
    }

    .table tbody tr {
      display: flex;
      flex-direction: column;
      border: 1px solid #dee2e6;
      margin-bottom: 1rem;
      padding: 0.5rem;
      border-radius: 0.25rem;
    }

    .table td {
      display: block;
      width: 100% !important;
      border: none;
      padding: 0.25rem 0.5rem;
      text-align: left !important;
    }

    .table td:first-child {
      font-weight: bold;
      border-bottom: 1px solid #dee2e6;
      padding-bottom: 0.5rem;
      margin-bottom: 0.5rem;
    }

    .table td:last-child {
      margin-top: 0.5rem;
    }

    /* Make buttons full width on mobile */
    .table td .btn {
      width: 100%;
      display: block;
    }
  }
</style>
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

            <table class="table table-borderles table-sm" style="margin: 0 auto;">
              {% assign spektakle = site.data.spektakle\[miesiac\].repertuar | sort: 'data' %}
              {% assign now_timestamp = 'now' | date: "%s" | plus: 0 %}
              {% for spektakl in spektakle %}
                {% assign event_timestamp = spektakl.data | date: "%s" | plus: 0 %}
                {% comment %} Only show future events {% endcomment %}
                {% if event_timestamp >= now_timestamp %}
                  {% assign dzien_tygodnia = spektakl.data | date: "%w" | minus: 1 | plus: 1 %}
                  {% if dzien_tygodnia == 0 or dzien_tygodnia == 6 %}
                    {% assign event_type = "weekend" %}
                  {% else %}
                    {% assign event_type = "weekday" %}
                  {% endif %}
                  <tr data-event-type="{{ event_type }}">
                  <td style="white-space: nowrap;">{{ spektakl.data | date: "%-d.%m" }} {{ site.data.dni_tygodnia.dni\[dzien_tygodnia\] }} {{ spektakl.data | date: "%R" }}</td>
                  <td>{{ spektakl.tytul }}</td>
                  <td style="text-align: center;">
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
                  </td>
                </tr>
                {% endif %}
              {% endfor %}
            </table>
          </div>
        </div>
      </div>
    {% endif %}

  {% endfor %}

  <br/><br/>

</div>

<script>
  // Filter logic for calendar events
  document.addEventListener('DOMContentLoaded', function() {
    const btnAll = document.getElementById('btnradio1');
    const btnFamilies = document.getElementById('btnradio2');
    const btnSchools = document.getElementById('btnradio3');

    function filterEvents(filterType) {
      const allRows = document.querySelectorAll('tr[data-event-type]');

      allRows.forEach(function(row) {
        const eventType = row.getAttribute('data-event-type');

        if (filterType === 'all') {
          row.style.display = '';
        } else if (filterType === 'families') {
          // Show only weekend events
          row.style.display = (eventType === 'weekend') ? '' : 'none';
        } else if (filterType === 'schools') {
          // Show only weekday events (with "Zapraszamy grupy zorganizowane...")
          row.style.display = (eventType === 'weekday') ? '' : 'none';
        }
      });
    }

    // Add event listeners to radio buttons
    btnAll.addEventListener('change', function() {
      if (this.checked) {
        filterEvents('all');
      }
    });

    btnFamilies.addEventListener('change', function() {
      if (this.checked) {
        filterEvents('families');
      }
    });

    btnSchools.addEventListener('change', function() {
      if (this.checked) {
        filterEvents('schools');
      }
    });

    // Initialize with "All" filter (default)
    filterEvents('all');
  });
</script>

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