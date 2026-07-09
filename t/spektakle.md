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
        <div class="card my-2">
          {% render "play_media.html", video: s.video, gallery: s.gallery, title: s.title, params: "color=white&playsinline=1&rel=0" %}
          <div class="card-body">
            <div>
              <h5 class="card-title">{{ s.title }}{% if s.new_premiere %} <span class="badge text-bg-primary">nowa premiera</span>{% endif %}</h5>
              <p>{{ s.headline }}</p>
              <p>Wiek: {{ s.age }}</p>
              <p>Czas trwania: {{ s.duration }}</p>
              <div class="container">
                <div class="row">
                  <button
                    type="button"
                    class="btn btn-sm btn-outline-primary my-1"
                    data-bs-toggle="modal"
                    data-bs-target="#{{ s.id2 }}">
                    Szczegóły spektaklu 🍥
                  </button>
                </div>
              </div>
            </div>
            <div class="text-center align-items-center">
              {% comment %} Find all events for this play from all months {% endcomment %}
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

              {% if sorted_play_events.size > 0 %}
                <ul class="list-group list-group-flush">
                  {% for event in sorted_play_events %}
                    {% assign dzien_tygodnia = event.data | date: "%w" %}
                    {% if dzien_tygodnia == '0' or dzien_tygodnia == '6' %}
                      {% assign event_type = "weekend" %}
                    {% else %}
                      {% assign event_type = "weekday" %}
                    {% endif %}

                    {% comment %} Convert month to Polish {% endcomment %}
                    {% assign month_num = event.data | date: "%-m" | minus: 1 %}
                    {% assign polish_months = "stycznia,lutego,marca,kwietnia,maja,czerwca,lipca,sierpnia,września,października,listopada,grudnia" | split: ',' %}
                    {% assign polish_month = polish_months[month_num] %}

                    <li class="list-group-item">
                      {{ event.data | date: "%-d" }} {{ polish_month }} {{ event.data | date: "%R" }}
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
              {% endif %}
            </div>
          </div>
        </div>
      </div>
      {% endif %}
    {% endfor %}
  </div>
</div>


{% for s in collections.s2 %}
  {% render "spektakl_modal.html", s: s %}
{% endfor %}