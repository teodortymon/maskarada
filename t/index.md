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
      <h2>Najbliższe spektakle ✨</h2>
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
    Najbliższe spektakle: the next ~3 distinct plays across ALL months
    (not just this week), ordered by their soonest upcoming showtime.
  {% endcomment %}
  {% assign all_miesiace = "styczen,luty,marzec,kwiecien,maj,czerwiec,lipiec,sierpien,wrzesien,pazdziernik,listopad,grudzien" | split: ',' %}
  {% assign now_timestamp = 'now' | date: "%s" | plus: 0 %}

  {% comment %} Collect every upcoming event across all months, then sort by date {% endcomment %}
  {% assign upcoming_events = "" | split: "" %}
  {% for miesiac in all_miesiace %}
    {% if spektakle[miesiac].repertuar %}
      {% for event in spektakle[miesiac].repertuar %}
        {% assign event_timestamp = event.data | date: "%s" | plus: 0 %}
        {% if event_timestamp >= now_timestamp %}
          {% assign upcoming_events = upcoming_events | push: event %}
        {% endif %}
      {% endfor %}
    {% endif %}
  {% endfor %}
  {% assign upcoming_events = upcoming_events | sort: 'data' %}

  {% comment %} Pick the next 3 distinct play titles, in chronological order {% endcomment %}
  {% assign next_titles = "" | split: "" %}
  {% for event in upcoming_events %}
    {% unless next_titles contains event.tytul %}
      {% if next_titles.size < 3 %}
        {% assign next_titles = next_titles | push: event.tytul %}
      {% endif %}
    {% endunless %}
  {% endfor %}

  <div class="row justify-content-center">
    {% for tytul in next_titles %}
      <div class="col-12 col-md-6 col-lg-4">
        {% comment %} This play's next few upcoming showtimes (already sorted) {% endcomment %}
        {% assign play_events = upcoming_events | where: "tytul", tytul | slice: 0, 3 %}

        {% comment %} Look up the play in the s2 collection for media/details {% endcomment %}
        {% assign play_video = nil %}
        {% for s in collections.s2 %}
          {% if s.title contains tytul or tytul contains s.title %}
            {% assign play_video = s %}
            {% break %}
          {% endif %}
        {% endfor %}

        {% render "play_card.html", title: tytul, s: play_video, events: play_events, show_meta: false, params: "color=white&playsinline=1&rel=0" %}
      </div>
    {% endfor %}
  </div>

  {% if next_titles.size == 0 %}
    <p class="text-center my-4">
      <i>Brak zaplanowanych spektakli. Zajrzyj do <a href="repertuar.html">Kalendarza</a>.</i>
    </p>
  {% endif %}

  <div class="text-center my-4">
    <a href="repertuar.html" class="repertuar-cta">Cały repertuar →</a>
  </div>

  <div class="container">
      <nav class="navbar">
        <div class="container-fluid">
          <h2>Co nowego 🎉</h2>
        </div>
      </nav>
    </div>
    <div class="row">
      <div class="col-sm-6">
        <div class="card my-2">
          <div class="card-header">
            <span>Piknik Archiwalny — 19 czerwca 2026</span>
          </div>
          <div class="card-body">
            <p>Na
              <a href="https://archiwum.pan.pl/index.php?option=com_content&view=article&id=767:juz-za-miesiac-xvi-warszawski-piknik-archiwalny&catid=9&Itemid=145" target="_blank" rel="noopener noreferrer">Pikniku Archiwalnym</a>
              na naszej scenie w Pałacu Staszicu wystawiliśmy
              <a href="#lina_bogli" data-bs-toggle="modal" data-bs-target="#lina_bogli">nową sztukę o Linie Bögli</a>, szwajcarskiej guwernantce, która podróżowała po świecie w XIX wieku.</p>
          </div>
        </div>
      </div>
      <div class="col-sm-6">
        <div class="card my-2">
          <div class="card-header">
            <span>Noc Muzeów w Pałacu Staszica — 16 maja 2026</span>
          </div>
          <div class="card-body">
            <p>Teatr i Archiwum zaprasza w sobotę o godz. 20:30 na spektakl
              <a href="#tajemnice_teatru" data-bs-toggle="modal" data-bs-target="#tajemnice_teatru">Tajemnice Teatru</a>
              w Sali Staszica. Zdradzimy, jak powstaje spektakl, i poprosimy o pomoc najmłodszych przy tworzeniu nowego przedstawienia.</p>
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

{% comment %} Modals for play details — each lists the play's upcoming showtimes. {% endcomment %}
{% for s in collections.s2 %}
  {% assign modal_events = upcoming_events | where: "tytul", s.title %}
  {% render "spektakl_modal.html", s: s, events: modal_events %}
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