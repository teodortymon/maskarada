---
layout: t
---
<script
  src="https://cdn.jsdelivr.net/npm/masonry-layout@4.2.2/dist/masonry.pkgd.min.js"
  integrity="sha384-GNFwBvfVxBkLMJpYMOABq3c+d3KnQxudP/mGPkzpZSTYykLBNsZEnG2D9G/X/+7D"
  crossorigin="anonymous"
  async></script>


<div class="container">

  <div class="row" data-masonry='{"percentPosition": true }'>
    {% comment %} Find earliest event date for each play to sort them {% endcomment %}
    {% assign all_miesiace = "styczen,luty,marzec,kwiecien,maj,czerwiec,lipiec,sierpien,wrzesien,pazdziernik,listopad,grudzien" | split: ',' %}
    {% assign now_timestamp = 'now' | date: "%s" | plus: 0 %}
    {% assign play_dates = "" | split: "" %}

    {% comment %} Build array of "timestamp|title" for sorting {% endcomment %}
    {% for s in site.s2 %}
      {% assign earliest_timestamp = 9999999999 %}

      {% for miesiac in all_miesiace %}
        {% if site.data.spektakle[miesiac].repertuar %}
          {% for event in site.data.spektakle[miesiac].repertuar %}
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
      {% for play in site.s2 %}
        {% if play.title == play_title %}
          {% assign s = play %}
          {% break %}
        {% endif %}
      {% endfor %}

      {% if s %}
      <div class="col-sm-4">
        <div class="card my-2">
          {% if s.link %}
            <div class="ratio ratio-16x9">
              <iframe
                class="embed-responsive-item"
                src="{{s.link}}?color=white&playsinline=1&rel=0"
                allowfullscreen></iframe>
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
            <div>
              <p>{{ s.headline }}</p>
              <p>Wiek: {{ s.age }}</p>
              <p>Czas trwania: {{ s.time }}</p>
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
                {% if site.data.spektakle[miesiac].repertuar %}
                  {% for event in site.data.spektakle[miesiac].repertuar %}
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
                          <button
                            type="button"
                            onclick="window.open('{{ event.link }}', '_blank'); fbq('track', 'OpenBuy');"
                            class="btn btn-sm btn-outline-primary">Kup bilet 🎫</button>
                        {% else %}
                          <i>Bilety online wkrótce</i>
                        {% endif %}
                      {% else %}
                        Zapraszamy grupy zorganizowane do rezerwacji tel.
                        <a href="tel:501-027-278" onclick="fbq('track', 'CallFromEventList');">501 027 278</a>
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


{% for s in site.s2 %}
  <div
    class="modal fade modal-xl"
    id="{{ s.id2 }}"
    tabindex="-1"
    aria-labelledby="exampleModalLabel"
    aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel">{{ s.title }}</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"></button>
        </div>
        <div class="modal-body">
          {{ s.content }}
        </div>
        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-secondary"
            data-bs-dismiss="modal">Close</button>
        </div>
      </div>
    </div>
  </div>
{% endfor %}