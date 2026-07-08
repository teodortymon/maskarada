---
layout: t
---
<style>
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

    /* Stack list items better on mobile */
    .list-group-item {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      padding: 0.75rem;
    }

    /* Make buttons full width on mobile */
    .list-group-item .btn {
      width: 100%;
      display: block;
    }

    /* Better card layout on mobile */
    .card-body .row .col-5,
    .card-body .row .col {
      flex: 0 0 100%;
      max-width: 100%;
    }
  }

</style>

<!--
  TODO:
  - migrate videos to vimeo
  - add a toggle for different clients
  - add a floating buy / call button for events (localstorage that defines buy / call logic?)
  - implement a progressive fallback for the vimeo
  
  // -->
<div class="container">
  <nav class="navbar">
    <div class="container-fluid">
      <h2>W tym tygodniu ✨</h2>
      <!-- TEMPORARILY DISABLED: audience filter (Wszystkie / Dla rodzin / Dla szkół…).
           Uncomment to restore. The filter JS below is null-safe when this is absent.
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
      -->

    </div>
  </nav>

  {% comment %}
  Get THIS WEEK's events only (Monday through Sunday)
  {% endcomment %}
  {% assign current_month_num = 'now' | date: "%-m" | minus: 1 %}
  {% assign all_miesiace = "styczen,luty,marzec,kwiecien,maj,czerwiec,lipiec,sierpien,wrzesien,pazdziernik,listopad,grudzien" | split: ',' %}
  {% assign current_month = all_miesiace[current_month_num] %}

  {% comment %} Calculate this week's Monday and next Monday {% endcomment %}
  {% assign today_day = 'now' | date: "%-d" | plus: 0 %}
  {% assign today_month = 'now' | date: "%-m" | plus: 0 %}
  {% assign today_year = 'now' | date: "%Y" | plus: 0 %}
  {% assign today_dow = 'now' | date: "%w" | plus: 0 %}
  {% assign current_hour = 'now' | date: "%-H" | plus: 0 %}

  {% comment %} If it's after 17:00, shift to next day for week calculation {% endcomment %}
  {% if current_hour >= 17 %}
    {% assign today_day = today_day | plus: 1 %}
    {% assign today_dow = today_dow | plus: 1 %}
    {% if today_dow > 7 %}
      {% assign today_dow = 1 %}
    {% endif %}
  {% endif %}

  {% comment %} Convert Sunday=0 to Sunday=7 for easier math {% endcomment %}
  {% if today_dow == 0 %}
    {% assign today_dow = 7 %}
  {% endif %}

  {% comment %} Calculate days since Monday (0=Monday, 6=Sunday) {% endcomment %}
  {% assign days_since_monday = today_dow | minus: 1 %}
  {% assign monday_day = today_day | minus: days_since_monday %}
  {% assign days_until_next_monday = 7 | minus: days_since_monday %}
  {% assign next_monday_day = today_day | plus: days_until_next_monday %}

  {% comment %} Get all events from current month, filter for this week {% endcomment %}
  {% assign this_week_events = "" | split: "" %}
  {% assign now_timestamp = 'now' | date: "%s" | plus: 0 %}

  {% if spektakle[current_month].repertuar %}
    {% assign sorted_events = spektakle[current_month].repertuar | sort: 'data' %}
    {% for spektakl in sorted_events %}
      {% assign event_day = spektakl.data | date: "%-d" | plus: 0 %}
      {% assign event_month = spektakl.data | date: "%-m" | plus: 0 %}
      {% assign event_timestamp = spektakl.data | date: "%s" | plus: 0 %}

      {% comment %} Check if event is in this week (same month, between Monday and next Monday) and in the future {% endcomment %}
      {% if event_month == today_month and event_timestamp >= now_timestamp %}
        {% if event_day >= monday_day and event_day < next_monday_day %}
          {% assign this_week_events = this_week_events | push: spektakl %}
        {% endif %}
      {% endif %}
    {% endfor %}
  {% endif %}

  {% comment %} Group events by title {% endcomment %}
  {% assign unique_titles = "" | split: "" %}
  {% for event in this_week_events %}
    {% unless unique_titles contains event.tytul %}
      {% assign unique_titles = unique_titles | push: event.tytul %}
    {% endunless %}
  {% endfor %}

  <div class="row">
    {% for tytul in unique_titles %}
      {% comment %} Determine if this show has weekend or weekday events {% endcomment %}
      {% assign play_events = this_week_events | where: "tytul", tytul | sort: 'data' %}
      {% assign has_weekend = false %}
      {% assign has_weekday = false %}
      {% for event in play_events %}
        {% assign dzien_tygodnia = event.data | date: "%w" %}
        {% if dzien_tygodnia == '0' or dzien_tygodnia == '6' %}
          {% assign has_weekend = true %}
        {% else %}
          {% assign has_weekday = true %}
        {% endif %}
      {% endfor %}

      {% comment %} Set event type for card {% endcomment %}
      {% if has_weekend and has_weekday %}
        {% assign card_type = "both" %}
      {% elsif has_weekend %}
        {% assign card_type = "weekend" %}
      {% else %}
        {% assign card_type = "weekday" %}
      {% endif %}

      <div class="col-sm" data-event-card="{{ card_type }}">
        <div class="card my-2">
          {% comment %} Video section - look up video from s2 collection {% endcomment %}
          {% assign play_video = nil %}
          {% for s in collections.s2 %}
            {% if s.title contains tytul or tytul contains s.title %}
              {% assign play_video = s %}
              {% break %}
            {% endif %}
          {% endfor %}

          {% if play_video.video and play_video.video != "" %}
            <div class="ratio ratio-16x9">
              {% render "lite_video.html", video: play_video.video, title: tytul, params: "color=white&playsinline=1&rel=0" %}
            </div>
          {% else %}
            <div class="ratio ratio-16x9">
              <div class="video-placeholder d-flex align-items-center justify-content-center">
                <div class="text-center">
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 12L9 8V16L15 12Z" fill="currentColor" opacity="0.3"/>
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" opacity="0.5"/>
                  </svg>
                  <p class="mt-3 mb-0" style="font-size: 0.875rem; opacity: 0.6;">Wideo wkrótce</p>
                </div>
              </div>
            </div>
          {% endif %}
          <div class="card-body">
            <div class="row">
              <div class="col-5">
                <h5>{{ tytul }}</h5>
                {% if play_video %}
                <div class="container">
                  <div class="row">
                    <button
                      type="button"
                      class="btn btn-sm btn-outline-primary my-1"
                      data-bs-toggle="modal"
                      data-bs-target="#{{ play_video.id2 }}">
                      Szczegóły spektaklu 🍥
                    </button>
                  </div>
                </div>
                {% endif %}
              </div>
              <div class="col text-center align-items-center">
                <ul class="list-group list-group-flush">
                  {% for event in play_events %}
                    {% assign dzien_tygodnia = event.data | date: "%w" %}
                    {% if dzien_tygodnia == '0' or dzien_tygodnia == '6' %}
                      {% assign event_type = "weekend" %}
                    {% else %}
                      {% assign event_type = "weekday" %}
                    {% endif %}
                    <li class="list-group-item" data-event-type="{{ event_type }}">
                      {% assign month_num = event.data | date: "%-m" | minus: 1 %}
                      {% assign polish_months = "stycznia,lutego,marca,kwietnia,maja,czerwca,lipca,sierpnia,września,października,listopada,grudnia" | split: ',' %}
                      {{ event.data | date: "%-d" }} {{ polish_months[month_num] }} {{ event.data | date: "%R" }}
                      {% if event_type == "weekend" %}
                        {% if event.link and event.link != "-" %}
                          <a
                            href="{{ event.link }}"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="btn btn-sm btn-outline-primary">Kup bilet 🎫</a>
                        {% else %}
                          <i>Bilety online wkrótce</i>
                        {% endif %}
                      {% else %}
                        Zapraszamy grupy zorganizowane do rezerwacji tel.
                        <a href="tel:501-027-278">501 027 278</a>
                      {% endif %}
                    </li>
                  {% endfor %}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    {% endfor %}

    <div class="col-12">
      <p id="filter-empty" class="text-center my-4" style="display: none;">
        <i>Brak spektakli w wybranej kategorii w tym tygodniu. Wybierz <b>Wszystkie 💫</b> lub zajrzyj do <a href="repertuar.html">Kalendarza</a>.</i>
      </p>
    </div>

    <div class="container">
      <nav class="navbar">
        <div class="container-fluid">
          <h2>Co nowego 🎉</h2>
        </div>
      </nav>
    </div>
    <div class="row">
      <div class="col-sm">
        <div class="card my-2">
          <div class="card-header d-flex justify-content-between align-items-center">
            <span>Piknik Archiwalny</span>
            <span class="badge text-bg-primary">19 czerwca 2026</span>
          </div>
          <div class="card-body">
            <p>Na
              <a href="https://archiwum.pan.pl/index.php?option=com_content&view=article&id=767:juz-za-miesiac-xvi-warszawski-piknik-archiwalny&catid=9&Itemid=145" target="_blank" rel="noopener noreferrer">Pikniku Archiwalnym</a>
              na naszej scenie w Pałacu Staszicu wystawiliśmy nową sztukę razem o Linie Bögli, szwajcarskiej guwernantce, która podróżowała po świecie w XIX wieku.</p>
            <button
              type="button"
              class="btn btn-sm btn-outline-primary my-1"
              data-bs-toggle="modal"
              data-bs-target="#lina_bogli">
              Zobacz spektakl 🍥
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>

  <div class="container">
    <nav class="navbar">
      <div class="container-fluid">
        <h2>Informacje 🧭</h2>
      </div>
    </nav>
  </div>
  <div class="card my-2">
    <div class="map-container">
      <iframe
        src="https://www.google.com/maps/embed/v1/place?q=Teatr+Maskarada+dla+dzieci&key=AIzaSyAj10GiD4y7BTXuxJbZHsQrkio4VBCvoXU"
        loading="lazy"
        allowfullscreen></iframe>
    </div>
    <div class="card-body text-center">
      <p>Gramy dla was przy ul. Nowy Świat 72<br /> Wejście od strony placu przy Pomniku Mikołaja Kopernika </p>
      <p>Kasa czynna godzinę przed spektaklem</p>
      <p>Rezerwacji biletów można dokonać telefonicznie pod numerem:
        <a href="tel:501-027-278">
          501 027 278</a>
        lub
<a href="https://ewejsciowki.pl/warszawa/oferty/teatr-maskarada,333">biletomat</a> /        
<a href="https://www.ebilet.pl/szukaj.php?t=o&oid=1233">ebilet</a> /
<a href="https://biletyna.pl/tag/teatr-maskarada">biletyna</a>
      </p>
    </div>
  </div>
</div>

{% comment %} Modals for play details {% endcomment %}
{% for s in collections.s2 %}
  {% render "spektakl_modal.html", s: s %}
{% endfor %}

<script>
  // Filter logic for calendar events on index page
  document.addEventListener('DOMContentLoaded', function() {
    const btnAll = document.getElementById('btnradio1');
    const btnFamilies = document.getElementById('btnradio2');
    const btnSchools = document.getElementById('btnradio3');

    function filterEvents(filterType) {
      // Filter individual list items
      const allListItems = document.querySelectorAll('li[data-event-type]');
      allListItems.forEach(function(item) {
        const eventType = item.getAttribute('data-event-type');

        if (filterType === 'all') {
          item.style.display = '';
        } else if (filterType === 'families') {
          // Show only weekend events
          item.style.display = (eventType === 'weekend') ? '' : 'none';
        } else if (filterType === 'schools') {
          // Show only weekday events
          item.style.display = (eventType === 'weekday') ? '' : 'none';
        }
      });

      // Filter cards - hide cards that have no visible events after filtering
      const allCards = document.querySelectorAll('[data-event-card]');
      allCards.forEach(function(card) {
        const cardType = card.getAttribute('data-event-card');

        if (filterType === 'all') {
          card.style.display = '';
        } else if (filterType === 'families') {
          // Show cards that have weekend events
          card.style.display = (cardType === 'weekend' || cardType === 'both') ? '' : 'none';
        } else if (filterType === 'schools') {
          // Show cards that have weekday events
          card.style.display = (cardType === 'weekday' || cardType === 'both') ? '' : 'none';
        }
      });

      // Graceful fallback: show a message when the filter hides every card
      const anyCardVisible = Array.prototype.some.call(allCards, function(c) {
        return c.style.display !== 'none';
      });
      const emptyMsg = document.getElementById('filter-empty');
      if (emptyMsg) {
        emptyMsg.style.display = (allCards.length > 0 && !anyCardVisible) ? '' : 'none';
      }
    }

    // Add event listeners to radio buttons (null-safe: the filter UI may be disabled)
    btnAll?.addEventListener('change', function() {
      if (this.checked) {
        filterEvents('all');
      }
    });

    btnFamilies?.addEventListener('change', function() {
      if (this.checked) {
        filterEvents('families');
      }
    });

    btnSchools?.addEventListener('change', function() {
      if (this.checked) {
        filterEvents('schools');
      }
    });

    // Initialize with "All" filter (default)
    filterEvents('all');
  });
</script>