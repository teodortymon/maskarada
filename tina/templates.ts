import type { TinaField } from "tinacms";

import defineConfig from "./config";
import { utcDateTimeUi } from "./fields/utc-datetime";

/** Friendly "18.10.2026, 12:30" label for the repertoire list rows. */
function itemLabelPl(value?: string): string {
  if (!value) return "(brak daty)";
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  try {
    return new Intl.DateTimeFormat("pl-PL", {
      timeZone: "UTC", // stored clock is the wall clock — never shift to browser tz
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return value;
  }
}

const spektakle = [
  "Tajemnice Teatru",
  "Magiczne Drzewko Wróżek-premiera",
  "Magiczne Drzewko Wróżek",
  "Chopinowski Bal Karnawałowy",
  "Jesienne warsztaty teatralno-taneczne",
  "Zimowe warsztaty teatralno-taneczne",
  "Elfy i fabryka prezentów",
  "Elfy i magia świąt",
  "Śnieżny show",
  "Złota Rybka",
  "Brzydkie Kaczątko",
  "Wesołe Koty",
  "Urodziny Turli i Taja",
  "Kuba i Buba, czyli awantura do kwadratu",
  "Chmurka i Bratek",
  "Jaś, Małgosia i piernikowa kraina",
  "Calineczka",
  "Elfy i fabryka prezentów",
  "Księżniczka na ziarnku grochu",
  "Co w trawie bzyczy?",
  "Warsztaty Chopinowskie",
  "Królowa Myszy",
  "Mała Syrenka",
  "Warsztaty teatralne",
  "Warsztaty kaligraficzne",
];

export function repertuar_blocksFields() {
  return [
    {
      type: "object",
      name: "repertuar",
      label: "Repertuar",
      list: true,
      itemProps: (item) => {
        return {
          label: (item.tytul || "(brak tytułu)") + " — " + itemLabelPl(item.data),
        };
      },
      fields: [
        {
          // component: "select",
          type: "string",
          name: "tytul",
          label: "Tytul spektaklu",
          required: true,
          options: spektakle,
          isTitle: true,
        },
        {
          type: "datetime",
          name: "data",
          label: "Data spektaklu",
          required: true,
          // Custom UTC-literal editor: shows/stores the wall-clock time exactly
          // as the site renders it, with no browser-timezone drift.
          // See tina/fields/utc-datetime.tsx for the full rationale.
          ui: utcDateTimeUi,
        },
        {
          type: "string",
          name: "link",
          label: "Link do e-wejściówek / opis",
          required: true,
        },
        {
          type: "boolean",
          name: "manual_price",
          label: "Ręcznie wpisywanie ceny",
        },
      ],
    },
  ] as TinaField[];
}
export function spektaklFields() {
  return [
    {
      type: "datetime",
      name: "data",
      label: "Data spektaklu2",
      required: true,
      ui: utcDateTimeUi,
    },
    {
      type: "string",
      name: "link",
      label: "Link do e-wejściówek",
      required: true,
    },
  ] as TinaField[];
}
