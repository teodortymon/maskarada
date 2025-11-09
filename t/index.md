---
layout: t
---

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
      <div
        class="btn-group"
        role="group"
        aria-label="Basic radio toggle button group">
        <input
          type="radio"
          class="btn-check"
          name="btnradio"
          id="btnradio2"
          autocomplete="off"
          checked>
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

  <div class="row">
    {% for i in (1..2) %}
      <div class="col-sm">
        <div class="card my-2">
          <div class="ratio ratio-16x9">
            <iframe
              class="embed-responsive-item"
              src="https://www.youtube.com/embed/I6uIPXobj9s?color=white&playsinline=1&rel=0"
              allowfullscreen></iframe>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-5">
                <p>Spektakl o rybach pelen wyobrazni</p>
                <p>Wiek: 12 lat</p>
                <p>Czas trwania: 2 godziny</p>
                <div class="container">
                  <div class="row">
                    <button
                      type="button"
                      class="btn btn-sm btn-outline-primary my-1"
                      data-bs-toggle="modal"
                      data-bs-target="#myModal">
                      Szczegoly spektaklu 🍥
                    </button>
                  </div>
                </div>
              </div>
              <div class="col text-center align-items-center">
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
      </div>
    {% endfor %}

    <div class="container">
      <nav class="navbar">
        <div class="container-fluid">
          <h2>Co nowego 🎉</h2>
        </div>
      </nav>
    </div>
    <hr>
    <div class="row">
      <div class="col-sm">
        <div class="card my-2">
          <div class="card-header">Warsztaty teatralne</div>
          <div class="card-body">
            <div class="row">
              <div class="col-5">
                <p>Warsztaty</p>
                <p>Wiek: 12 lat</p>
                <p>Czas trwania: 2 godziny</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-sm">
        <div class="card my-2">
          <div class="card-header">Nowa premiera</div>
          <div class="card-body">
            <p>Rybka rybka rybka</p>
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
  <hr>
  <div class="card my-2">
    <div class="map-container">
      <iframe
        src="https://www.google.com/maps/embed/v1/place?q=Teatr+Maskarada+dla+dzieci&key=AIzaSyAj10GiD4y7BTXuxJbZHsQrkio4VBCvoXU"
        allowfullscreen></iframe>
    </div>
    <div class="card-body text-center">
      <p>Gramy dla was przy ul. Nowy Świat 63  
        (Nowy Świat Muzyki)</p>
      <p>Kasa czynna godzinę przed spektaklem.  
        teatr.maskarada@gmail.com</p>
      <p>Rezerwacji biletów można dokonać telefonicznie pod numerem:
        <a href="tel:501-027-278" onClick="fbq('track', 'CallFromContact');">
          501 027 278</a>
        lub
        <a href="https://www.ebilet.pl/szukaj.php?t=o&oid=1233">ebilet</a>
        /
        <a href="https://ewejsciowki.pl/warszawa/oferty/teatr-maskarada,333">ewejściówki</a>
      </p>
    </div>
  </div>
</div>
<div
  class="modal fade"
  id="myModal"
  tabindex="-1"
  aria-labelledby="exampleModalLabel"
  aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="exampleModalLabel">Modal title</h5>
        <button
          type="button"
          class="btn-close"
          data-bs-dismiss="modal"
          aria-label="Close"></button>
      </div>
      <div class="modal-body">
        Two overlay buttons:  
        1. Kup bilet                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   2. Zamknij
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