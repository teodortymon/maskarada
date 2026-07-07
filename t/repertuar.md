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

  /* Whole play title as a themed (rose) clickable button */
  .play-title-btn {
    --bs-btn-color: var(--bs-primary);
    --bs-btn-hover-color: var(--bs-secondary);
    padding: 0.15rem 0.4rem;
    margin-left: -0.4rem;
    font-weight: 600;
    text-decoration: none;
    white-space: normal;
    border-radius: 0.4rem;
    transition: background-color 0.15s ease;
  }
  .play-title-btn:hover {
    background-color: rgba(224, 123, 120, 0.12);
    color: var(--bs-primary);
  }
  .play-title-more {
    font-size: 0.8em;
    font-weight: 500;
    opacity: 0.75;
    white-space: nowrap;
    margin-left: 0.25rem;
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
      background-color: #e0736f !important;
      border-color: #e0736f !important;
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
        <label class="btn btn-outline-primary" for="btnradio3">Dla szkół, przedszkoli i firm 🏫</label>
      </div>
    </div>
  </nav>
  <hr>
  <div class="card my-2">
    <div class="card-body">
      Gramy dla was w Pałacu Staszica przy
      <i>ul. Nowy Świat 72</i>
    </div>
  </div>
  {% assign current_month_num = 'now' | date: "%-m" | minus: 1 %}
  {% assign all_miesiace = "styczen,luty,marzec,kwiecien,maj,czerwiec,lipiec,sierpien,wrzesien,pazdziernik,listopad,grudzien" | split: ',' %}
  {% assign miesiace_rest = all_miesiace | slice: current_month_num, 12 %}
  {% assign miesiace_start = all_miesiace | slice: 0, current_month_num %}
  {% assign miesiace = miesiace_rest | concat: miesiace_start %}
  {% assign now_timestamp = 'now' | date: "%s" | plus: 0 %}
  {% assign shown_months = 0 %}
  {% for miesiac in miesiace %}
    {% assign month_data = site.data.spektakle[miesiac] %}
    {% if month_data.repertuar.size > 0 %}
      {% assign spektakle = month_data.repertuar | sort: 'data' %}
      {% comment %} Build the future-event rows first so we can skip months with none {% endcomment %}
      {% capture month_rows %}
        {% for spektakl in spektakle %}
          {% assign event_timestamp = spektakl.data | date: "%s" | plus: 0 %}
          {% if event_timestamp >= now_timestamp %}
            {% assign dzien_tygodnia = spektakl.data | date: "%w" | plus: 0 %}
            {% if dzien_tygodnia == 0 or dzien_tygodnia == 6 %}
              {% assign event_type = "weekend" %}
            {% else %}
              {% assign event_type = "weekday" %}
            {% endif %}
            {% comment %} Match this event to its play (_s2) by title so the title
               can open the same details modal used on the Spektakle page. {% endcomment %}
            {% assign matched_play = nil %}
            {% for play in site.s2 %}
              {% if play.title == spektakl.tytul %}
                {% assign matched_play = play %}
                {% break %}
              {% endif %}
            {% endfor %}
            <tr data-event-type="{{ event_type }}">
              <td style="white-space: nowrap;">{{ site.data.dni_tygodnia.dni[dzien_tygodnia] | capitalize }} {{ spektakl.data | date: "%-d.%m" }} - {{ spektakl.data | date: "%R" }}</td>
              <td>
                {% if matched_play %}
                  <button
                    type="button"
                    class="btn play-title-btn text-start"
                    data-bs-toggle="modal"
                    data-bs-target="#{{ matched_play.id2 }}">{{ spektakl.tytul }} <span class="play-title-more" aria-hidden="true">więcej →</span></button>
                {% else %}
                  {{ spektakl.tytul }}
                {% endif %}
              </td>
              <td style="text-align: center;">
                {% if spektakl.manual_price == true %}
                  {{ spektakl.link }}
                {% else %}
                  {% if event_type == "weekend" %}
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
      {% endcapture %}

      {% comment %} Only render the month card when it actually has upcoming events {% endcomment %}
      {% if month_rows contains "<tr" %}
        {% assign shown_months = shown_months | plus: 1 %}
        <div class="card my-2 ">
          <div class="card-body">
            <h4>{{ month_data.title }}</h4>
            <div class="table-responsive">
              <table class="table table-borderles table-sm" style="margin: 0 auto;">
                {{ month_rows }}
              </table>
            </div>
          </div>
        </div>
      {% endif %}
    {% endif %}
  {% endfor %}

  {% if shown_months == 0 %}
    <p class="text-center my-4"><i>Aktualnie nie mamy zaplanowanych spektakli. Zajrzyj wkrótce!</i></p>
  {% endif %}

  <p id="filter-empty" class="text-center my-4" style="display: none;">
    <i>Brak spektakli w wybranej kategorii. Wybierz <b>Wszystkie 💫</b>, aby zobaczyć pełny repertuar.</i>
  </p>

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

      // Hide month cards that have no visible rows after filtering
      document.querySelectorAll('.card').forEach(function(card) {
        const rows = card.querySelectorAll('tr[data-event-type]');
        if (rows.length) {
          const anyVisible = Array.prototype.some.call(rows, function(r) {
            return r.style.display !== 'none';
          });
          card.style.display = anyVisible ? '' : 'none';
        }
      });

      // Graceful fallback: show a message when the filter hides everything
      const anyRowVisible = Array.prototype.some.call(allRows, function(r) {
        return r.style.display !== 'none';
      });
      const emptyMsg = document.getElementById('filter-empty');
      if (emptyMsg) {
        emptyMsg.style.display = (allRows.length > 0 && !anyRowVisible) ? '' : 'none';
      }
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

{% comment %} Play details modals — same include as the Spektakle page, so a
   Kalendarz play title opens the identical popup. {% endcomment %}
{% for s in site.s2 %}
  {% include spektakl_modal.html s=s %}
{% endfor %}

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
