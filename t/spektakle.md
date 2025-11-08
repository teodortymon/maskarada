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
    {% assign spektakle = site.s2 | sort: "link", "last" %}
    {% for s in spektakle %}
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
            LOL
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
              <ul class="list-group list-group-flush">
                {% for i in (1..3) %}
                  <li class="list-group-item">
                    14 czerwiec 12:30
                    <button
                      type="button"
                      href="https://kicket.com/embedded/rezerwacja/255646"
                      class="btn btn-sm btn-outline-primary">Kup bilet 🎫</button>
                  </li>
                {% endfor %}
              </ul>
            </div>
          </div>
        </div>
      </div>
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