---
layout: t
---
<script
  src="https://cdn.jsdelivr.net/npm/masonry-layout@4.2.2/dist/masonry.pkgd.min.js"
  integrity="sha384-GNFwBvfVxBkLMJpYMOABq3c+d3KnQxudP/mGPkzpZSTYykLBNsZEnG2D9G/X/+7D"
  crossorigin="anonymous"
  defer></script>
<script>
  // Masonry's declarative init can run before the stylesheet applies, measuring
  // full-width columns and stacking every card at left: 0. Re-measure once
  // everything (CSS, fonts) is in.
  (function () {
    function relayout() {
      var grid = document.querySelector("[data-masonry]");
      if (!grid || !window.Masonry) return;
      var m = window.Masonry.data(grid);
      if (m) m.layout();
      else new window.Masonry(grid, { percentPosition: true, itemSelector: ".col-sm-4" });
    }
    window.addEventListener("load", relayout);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(relayout);
  })();
</script>


<div class="container">

  {% comment %}
    itemSelector matters: markdown rendering injects empty full-width <p>
    elements between the columns, and without it Masonry measures the first
    <p> as the column width — collapsing the grid to a single column.
  {% endcomment %}
  <div class="row" data-masonry='{"percentPosition": true, "itemSelector": ".col-sm-4" }'>
    {% comment %} Find earliest event date for each play to sort them {% endcomment %}
    {% assign all_miesiace = "styczen,luty,marzec,kwiecien,maj,czerwiec,lipiec,sierpien,wrzesien,pazdziernik,listopad,grudzien" | split: ',' %}
    {% assign now_timestamp = 'now' | date: "%s" | plus: 0 %}
    {% assign play_dates = "" | split: "" %}

    {% comment %} Build array of "timestamp|title" for sorting {% endcomment %}
    {% for s in collections.s2 %}
      {% assign earliest_timestamp = 9999999999 %}

      {% for miesiac in all_miesiace %}
        {% if spektakle[miesiac].repertuar %}
          {% for event in spektakle[miesiac].repertuar %}
            {% assign event_timestamp = event.data | date: "%s" | plus: 0 %}
            {% if event.tytul == s.title and event_timestamp >= now_timestamp %}
              {% if event_timestamp < earliest_timestamp %}
                {% assign earliest_timestamp = event_timestamp %}
              {% endif %}
            {% endif %}
          {% endfor %}
        {% endif %}
      {% endfor %}

      {% comment %} Store as "timestamp|title" for sorting {% endcomment %}
      {% assign play_entry = earliest_timestamp | append: "|" | append: s.title %}
      {% assign play_dates = play_dates | push: play_entry %}
    {% endfor %}

    {% comment %} Sort by timestamp (ascending) {% endcomment %}
    {% assign sorted_play_dates = play_dates | sort %}

    {% comment %} Loop through sorted order and display plays {% endcomment %}
    {% for entry in sorted_play_dates %}
      {% assign entry_parts = entry | split: "|" %}
      {% assign play_title = entry_parts[1] %}

      {% comment %} Find the play object with this title {% endcomment %}
      {% assign s = nil %}
      {% for play in collections.s2 %}
        {% if play.title == play_title %}
          {% assign s = play %}
          {% break %}
        {% endif %}
      {% endfor %}

      {% if s %}
      <div class="col-sm-4">
        {% comment %} Find all upcoming events for this play from all months {% endcomment %}
        {% assign play_events = "" | split: "" %}
        {% assign all_miesiace = "styczen,luty,marzec,kwiecien,maj,czerwiec,lipiec,sierpien,wrzesien,pazdziernik,listopad,grudzien" | split: ',' %}
        {% assign now_timestamp = 'now' | date: "%s" | plus: 0 %}

        {% for miesiac in all_miesiace %}
          {% if spektakle[miesiac].repertuar %}
            {% for event in spektakle[miesiac].repertuar %}
              {% assign event_timestamp = event.data | date: "%s" | plus: 0 %}
              {% if event.tytul == s.title and event_timestamp >= now_timestamp %}
                {% assign play_events = play_events | push: event %}
              {% endif %}
            {% endfor %}
          {% endif %}
        {% endfor %}

        {% assign sorted_play_events = play_events | sort: 'data' %}

        {% render "play_card.html", title: s.title, s: s, events: sorted_play_events, show_meta: true, params: "color=white&playsinline=1&rel=0" %}
      </div>
      {% endif %}
    {% endfor %}
  </div>
</div>


{% for s in collections.s2 %}
  {% render "spektakl_modal.html", s: s %}
{% endfor %}