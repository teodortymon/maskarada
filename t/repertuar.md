---
layout: t
templateEngineOverride: liquid
---
<style>
  /* ===== Kalendarz — ticket-stub schedule ===== */
  html { scroll-behavior: smooth; }
  .site-header { transition: transform 0.25s ease; }
  .site-header.ksf-hide { transform: translateY(-105%); }
  .ksf-head { text-align: center; margin: 1rem 0 0.75rem; }
  .ksf-head h2 { font-family: YoungSerif, serif; color: #380200; margin: 0; }
  .ksf-sub { font-size: 0.8rem; color: #9a6265; margin: 0.3rem 0 0; }
  .num { font-family: Montserrat, sans-serif; font-weight: 600; font-size: 0.94em; }

  /* Flat, compact overview bar (not sticky) */
  .ksf-bar {
    display: flex;
    align-items: center;
    gap: 0.9rem;
    background: rgba(255, 253, 252, 0.7);
    border: 1px solid rgba(56, 2, 0, 0.08);
    border-radius: 0.75rem;
    padding: 0.35rem 0.6rem;
    max-width: 46rem;
    margin: 0 auto 1.25rem;
  }
  /* Narrower reading column on desktop — buttons sit closer to titles */
  .ksf-month-block { max-width: 46rem; margin: 0 auto; }
  .ksf-filter { flex: 0 0 auto; display: inline-flex; gap: 0.9rem; }
  .ksf-filter .btn-check { position: absolute; clip: rect(0, 0, 0, 0); pointer-events: none; }
  .ksf-filter label {
    font-size: 0.82rem;
    font-weight: 600;
    color: #9a6265;
    cursor: pointer;
    padding: 0.22rem 0.05rem;
    border-bottom: 2.5px solid transparent;
    white-space: nowrap;
    -webkit-tap-highlight-color: transparent;
  }
  .ksf-filter .btn-check:checked + label { color: #380200; border-bottom-color: #e07b78; }
  .ksf-filter .btn-check:focus-visible + label { outline: 2px solid #380200; outline-offset: 2px; }

  .ksf-rail {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 0.35rem;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    padding: 0.15rem 0.1rem;
  }
  .ksf-rail::-webkit-scrollbar { height: 4px; }
  .ksf-rail::-webkit-scrollbar-thumb { background: rgba(154, 98, 101, 0.3); border-radius: 999px; }
  .ksf-rail-group { display: flex; align-items: center; gap: 0.35rem; }
  .ksf-rail-mon {
    font-size: 0.6rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    color: #b08a8d;
    margin: 0 0.35rem 0 0.5rem;
    white-space: nowrap;
  }
  .ksf-rail-group:first-child .ksf-rail-mon { margin-left: 0.1rem; }
  /* Mini-ticket day chips: tinted weekday flap + dashed perforation + number */
  .ksf-rail-day {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: stretch;
    padding: 0;
    border-radius: 0.5rem;
    background: #fffdfc;
    border: 1px solid rgba(56, 2, 0, 0.12);
    overflow: hidden;
    text-decoration: none;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
  }
  .ksf-rail-day:hover { border-color: rgba(224, 123, 120, 0.7); box-shadow: 0 1px 4px rgba(56, 2, 0, 0.12); }
  .ksf-rail-dow {
    display: flex;
    align-items: center;
    padding: 0.2rem 0.32rem;
    background: rgba(56, 2, 0, 0.055);
    border-right: 1.5px dashed rgba(56, 2, 0, 0.22);
    font-size: 0.55rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #9a6265;
  }
  .ksf-rail-num {
    display: flex;
    align-items: center;
    padding: 0.2rem 0.45rem;
    font-family: Montserrat, sans-serif;
    font-weight: 600;
    font-size: 0.88rem;
    color: #380200;
  }
  /* today: dark flap so the rail reads as "starting from today" */
  .ksf-rail-day.is-today { border-color: #380200; }
  .ksf-rail-day.is-today .ksf-rail-dow {
    background: #380200;
    color: #fff;
    border-right-color: rgba(255, 255, 255, 0.45);
  }
  .ksf-rail-today { cursor: default; }
  .ksf-rail-today:hover { border-color: #380200; box-shadow: none; }

  /* Day sections */
  .ksf-day-sec { scroll-margin-top: calc(var(--hdr-h, 100px) + 1.5rem); margin-bottom: 1.5rem; }
  .ksf-day-title {
    font-family: YoungSerif, serif;
    font-size: 1.15rem;
    color: #380200;
    margin: 0 0 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  .ksf-day-title::after {
    content: "";
    flex: 1;
    height: 1px;
    background: rgba(56, 2, 0, 0.16);
  }

  /* Ticket stub — perforated time block */
  .ksf-stub {
    --datew: 4.6rem;
    position: relative;
    display: flex;
    align-items: stretch;
    background: #fffdfc;
    border: 1px solid rgba(56, 2, 0, 0.09);
    border-radius: 0.75rem;
    margin-bottom: 0.55rem;
    box-shadow: 0 1px 3px rgba(56, 2, 0, 0.05);
    overflow: hidden;
  }
  .ksf-stub::before,
  .ksf-stub::after {
    content: "";
    position: absolute;
    left: calc(var(--datew) - 7px);
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #f3ecf2;
    border: 1px solid rgba(56, 2, 0, 0.09);
    z-index: 2;
  }
  .ksf-stub::before { top: -8px; }
  .ksf-stub::after { bottom: -8px; }
  .ksf-block {
    width: var(--datew);
    flex: 0 0 var(--datew);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.55rem 0.25rem;
    border-right: 2px dashed rgba(56, 2, 0, 0.18);
    background: rgba(224, 123, 120, 0.1);
  }
  .ksf-stub[data-event-type="weekday"] .ksf-block { background: rgba(91, 115, 149, 0.09); }
  .ksf-time-big {
    font-family: Montserrat, sans-serif;
    font-weight: 700;
    font-size: 1.08rem;
    color: #380200;
    font-variant-numeric: tabular-nums;
  }

  .ksf-body {
    flex: 1;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 0.35rem 1rem;
    padding: 0.6rem 1rem;
    min-width: 0;
  }
  .ksf-title-btn {
    border: 0;
    background: none;
    padding: 0;
    font-weight: 600;
    font-size: 1rem;
    color: #380200;
    text-align: left;
    cursor: pointer;
  }
  .ksf-title-btn:hover { color: #e07b78; }
  .ksf-title-more { font-size: 0.78em; font-weight: 500; color: #e07b78; white-space: nowrap; }
  .ksf-action {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 0.55rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }
  .ksf-groups-note { font-size: 0.78rem; color: #9a6265; text-align: right; }
  .ksf-buy {
    display: inline-block;
    background: #e07b78;
    color: #fff;
    font-weight: 600;
    font-size: 0.85rem;
    padding: 0.4rem 0.9rem;
    border-radius: 999px;
    text-decoration: none;
    white-space: nowrap;
  }
  .ksf-buy:hover { background: #9a6265; color: #fff; }
  .ksf-soon { font-size: 0.8rem; font-style: italic; color: #9a6265; }
  .ksf-tel {
    display: inline-block;
    font-size: 0.85rem;
    font-weight: 600;
    color: #33517e;
    background: rgba(91, 115, 149, 0.13);
    border-radius: 999px;
    padding: 0.4rem 0.9rem;
    text-decoration: none;
    white-space: nowrap;
  }
  .ksf-tel:hover { background: rgba(91, 115, 149, 0.25); color: #33517e; }

  @media (max-width: 700px) {
    .ksf-bar { flex-wrap: wrap; gap: 0.2rem; padding: 0.35rem 0.5rem 0.45rem; }
    .ksf-filter { width: 100%; justify-content: center; gap: 1.4rem; }
    .ksf-rail { flex-basis: 100%; }
    .ksf-stub { --datew: 4rem; }
    .ksf-body { padding: 0.55rem 0.75rem; }
    .ksf-title-btn { font-size: 0.94rem; }
    .ksf-action { margin-left: 0; flex-basis: 100%; justify-content: flex-start; }
    .ksf-groups-note { text-align: left; }
  }
  @media (prefers-reduced-motion: reduce) {
    html { scroll-behavior: auto; }
    .site-header { transition: none; }
  }
</style>
<div class="container container--tight">
  <div class="ksf-head">
    <h2>Kalendarz</h2>
  </div>
  {% assign current_month_num = 'now' | date: "%-m" | minus: 1 %}
  {% assign all_miesiace = "styczen,luty,marzec,kwiecien,maj,czerwiec,lipiec,sierpien,wrzesien,pazdziernik,listopad,grudzien" | split: ',' %}
  {% assign miesiace_rest = all_miesiace | slice: current_month_num, 12 %}
  {% assign miesiace_start = all_miesiace | slice: 0, current_month_num %}
  {% assign miesiace = miesiace_rest | concat: miesiace_start %}
  {% assign now_timestamp = 'now' | date: "%s" | plus: 0 %}
  {% assign wd_short = "Nd,Pn,Wt,Śr,Czw,Pt,Sob" | split: ',' %}
  {% assign mon_gen = "stycznia,lutego,marca,kwietnia,maja,czerwca,lipca,sierpnia,września,października,listopada,grudnia" | split: ',' %}
  {% assign today_key = 'now' | date: "%Y%m%d" %}
  {% comment %} Does today still have upcoming shows? (only the current month can) {% endcomment %}
  {% assign has_today = false %}
  {% assign cur_mon_data = spektakle[all_miesiace[current_month_num]] %}
  {% if cur_mon_data.repertuar.size > 0 %}
    {% for e in cur_mon_data.repertuar %}
      {% assign ts = e.data | date: "%s" | plus: 0 %}
      {% if ts >= now_timestamp %}
        {% assign dk = e.data | date: "%Y%m%d" %}
        {% if dk == today_key %}
          {% assign has_today = true %}
        {% endif %}
      {% endif %}
    {% endfor %}
  {% endif %}
  {% capture rail %}
    {% for miesiac in miesiace %}
      {% assign month_data = spektakle[miesiac] %}
      {% if month_data.repertuar.size > 0 %}
        {% assign month_events = month_data.repertuar | sort: 'data' %}
        {% capture group_chips %}
          {% assign prev_day = "" %}
          {% for spektakl in month_events %}
            {% assign event_timestamp = spektakl.data | date: "%s" | plus: 0 %}
            {% if event_timestamp >= now_timestamp %}
              {% assign day_key = spektakl.data | date: "%Y%m%d" %}
              {% if day_key != prev_day %}
                {% assign prev_day = day_key %}
                {% assign dw = spektakl.data | date: "%w" | plus: 0 %}
                {% if dw == 0 or dw == 6 %}
                  {% assign day_type = "weekend" %}
                {% else %}
                  {% assign day_type = "weekday" %}
                {% endif %}
                {% if day_key == today_key %}
                  <a class="ksf-rail-day is-today" data-event-type="{{ day_type }}" href="#d{{ day_key }}" title="Dzisiaj"><span class="ksf-rail-dow">Dziś</span><span class="ksf-rail-num">{{ spektakl.data | date: "%-d" }}</span></a>
                {% else %}
                  <a class="ksf-rail-day" data-event-type="{{ day_type }}" href="#d{{ day_key }}"><span class="ksf-rail-dow">{{ wd_short[dw] }}</span><span class="ksf-rail-num">{{ spektakl.data | date: "%-d" }}</span></a>
                {% endif %}
              {% endif %}
            {% endif %}
          {% endfor %}
        {% endcapture %}
        {% if group_chips contains "ksf-rail-day" %}
          <span class="ksf-rail-group"><span class="ksf-rail-mon">{{ month_data.title }}</span>{{ group_chips }}</span>
        {% endif %}
      {% endif %}
    {% endfor %}
  {% endcapture %}
  {% if rail contains "ksf-rail-day" %}
    <div class="ksf-bar">
      <div class="ksf-filter" role="group" aria-label="Filtr spektakli">
        <input type="radio" class="btn-check" name="ksfradio" id="ksfradio1" autocomplete="off" checked>
        <label for="ksfradio1">Wszystkie</label>
        <input type="radio" class="btn-check" name="ksfradio" id="ksfradio2" autocomplete="off">
        <label for="ksfradio2">Dla rodzin</label>
        <input type="radio" class="btn-check" name="ksfradio" id="ksfradio3" autocomplete="off">
        <label for="ksfradio3">Dla grup</label>
      </div>
      <div class="ksf-rail">
        {%- unless has_today -%}
          <span class="ksf-rail-day is-today ksf-rail-today" title="Dzisiaj"><span class="ksf-rail-dow">Dziś</span><span class="ksf-rail-num">{{ 'now' | date: "%-d" }}</span></span>
        {%- endunless -%}
        {{ rail }}
      </div>
    </div>
    {% for miesiac in miesiace %}
      {% assign month_data = spektakle[miesiac] %}
      {% if month_data.repertuar.size > 0 %}
        {% assign month_events = month_data.repertuar | sort: 'data' %}
        {% capture month_secs %}
          {% assign prev_day = "" %}
          {% for spektakl in month_events %}
            {% assign event_timestamp = spektakl.data | date: "%s" | plus: 0 %}
            {% if event_timestamp >= now_timestamp %}
              {% assign day_key = spektakl.data | date: "%Y%m%d" %}
              {% assign dw = spektakl.data | date: "%w" | plus: 0 %}
              {% assign mi = spektakl.data | date: "%-m" | minus: 1 %}
              {% if dw == 0 or dw == 6 %}
                {% assign event_type = "weekend" %}
              {% else %}
                {% assign event_type = "weekday" %}
              {% endif %}
              {% if day_key != prev_day %}
                {% if prev_day != "" %}
                  </section>
                {% endif %}
                {% assign prev_day = day_key %}
                <section class="ksf-day-sec" id="d{{ day_key }}" data-event-type="{{ event_type }}">
                  <h3 class="ksf-day-title">{{ dni_tygodnia.dni[dw] | capitalize }} <span class="num">{{ spektakl.data | date: "%-d" }}</span> {{ mon_gen[mi] }}</h3>
              {% endif %}
              {% assign matched_play = nil %}
              {% for play in collections.s2 %}
                {% if play.title == spektakl.tytul %}
                  {% assign matched_play = play %}
                  {% break %}
                {% endif %}
              {% endfor %}
              <article class="ksf-stub" data-event-type="{{ event_type }}">
                <div class="ksf-block">
                  <span class="ksf-time-big">{{ spektakl.data | date: "%R" }}</span>
                </div>
                <div class="ksf-body">
                  {% if matched_play %}
                    <button type="button" class="ksf-title-btn" data-bs-toggle="modal" data-bs-target="#{{ matched_play.id2 }}">{{ spektakl.tytul }} <span class="ksf-title-more" aria-hidden="true">więcej →</span></button>
                  {% else %}
                    <span class="ksf-title-btn" style="cursor:default">{{ spektakl.tytul }}</span>
                  {% endif %}
                  <span class="ksf-action">
                    {% if spektakl.manual_price == true %}
                      {{ spektakl.link }}
                    {% elsif event_type == "weekend" %}
                      {% if spektakl.link == "-" %}
                        <span class="ksf-soon">Bilety online wkrótce</span>
                      {% else %}
                        <a href="{{ spektakl.link }}" target="_blank" rel="noopener noreferrer" class="ksf-buy">Kup bilet 🎫</a>
                      {% endif %}
                    {% else %}
                      <span class="ksf-groups-note">Zapraszamy grupy zorganizowane do rezerwacji tel.</span>
                      <a href="tel:501-027-278" class="ksf-tel">☎ Zadzwoń 501 027 278</a>
                    {% endif %}
                  </span>
                </div>
              </article>
            {% endif %}
          {% endfor %}
          {% if prev_day != "" %}
            </section>
          {% endif %}
        {% endcapture %}
        {% if month_secs contains "<section" %}
          <div class="ksf-month-block">{{ month_secs }}</div>
        {% endif %}
      {% endif %}
    {% endfor %}
  {% else %}
    <p class="text-center my-4"><i>Aktualnie nie mamy zaplanowanych spektakli. Zajrzyj wkrótce!</i></p>
  {% endif %}
  <p id="filter-empty" class="text-center my-4" style="display: none;">
    <i>Brak spektakli w wybranej kategorii. Wybierz <b>Wszystkie</b>, aby zobaczyć pełny repertuar.</i>
  </p>
  <br/><br/>
</div>

<script>
  document.addEventListener('DOMContentLoaded', function () {
    var radios = [
      { el: document.getElementById('ksfradio1'), type: 'all' },
      { el: document.getElementById('ksfradio2'), type: 'weekend' },
      { el: document.getElementById('ksfradio3'), type: 'weekday' }
    ];
    function visible(elts) {
      return Array.prototype.some.call(elts, function (e) { return e.style.display !== 'none'; });
    }
    function applyFilter(type) {
      document.querySelectorAll('.ksf-rail-day[data-event-type], .ksf-day-sec').forEach(function (el) {
        var t = el.getAttribute('data-event-type');
        el.style.display = (type === 'all' || t === type) ? '' : 'none';
      });
      document.querySelectorAll('.ksf-rail-group').forEach(function (g) {
        g.style.display = visible(g.querySelectorAll('.ksf-rail-day')) ? '' : 'none';
      });
      document.querySelectorAll('.ksf-month-block').forEach(function (b) {
        b.style.display = visible(b.querySelectorAll('.ksf-day-sec')) ? '' : 'none';
      });
      var secs = document.querySelectorAll('.ksf-day-sec');
      var emptyMsg = document.getElementById('filter-empty');
      if (emptyMsg) emptyMsg.style.display = (secs.length > 0 && !visible(secs)) ? '' : 'none';
    }
    radios.forEach(function (r) {
      if (!r.el) return;
      r.el.addEventListener('change', function () { if (this.checked) applyFilter(r.type); });
    });
    applyFilter('all');

    // Auto-hiding site header: hide on scroll down, reveal on scroll up.
    var hdr = document.querySelector('.site-header');
    var hdrHidden = false;
    function setHdrVar() {
      var h = (!hdr || hdrHidden) ? 0 : hdr.getBoundingClientRect().height;
      document.documentElement.style.setProperty('--hdr-h', h + 'px');
    }
    setHdrVar();
    var lastY = window.scrollY || 0;
    window.addEventListener('scroll', function () {
      var y = window.scrollY || 0;
      if (hdr) {
        if (y > lastY + 6 && y > 180 && !hdrHidden) {
          hdrHidden = true;
          hdr.classList.add('ksf-hide');
          setHdrVar();
        } else if ((y < lastY - 6 || y < 120) && hdrHidden) {
          hdrHidden = false;
          hdr.classList.remove('ksf-hide');
          setHdrVar();
        }
      }
      lastY = y;
    }, { passive: true });
    window.addEventListener('resize', setHdrVar, { passive: true });
  });
</script>

{% for s in collections.s2 %}
  {% render "spektakl_modal.html", s: s %}
{% endfor %}
