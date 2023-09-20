import type { TinaField } from "tinacms";

import defineConfig from "./config";

const spektakle = [
  "Tajemnice Teatru",
  "Magiczne Drzewko Wróżek-premiera",
  "Magiczne Drzewko Wróżek",
  "Chopinowski Bal Karnawałowy",
  "Jesienne warsztaty teatralno-taneczne",
  "Zimowe warsztaty teatralno-taneczne",
  "Elfy i fabryka prezentów",
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
  "Królowa Myszy (premiera)",
  "Mała syrenka (premiera)",
  "Mała syrenka",
  "Warsztaty teatralne",
  "Warsztaty kaligraficzne"
];

export function repertuar_blocksFields() {
  return [
    {
      type: "object",
      name: "repertuar",
      label: "Repertuar",
      list: true,
      itemProps: (item) => {
        console.log(item);
        return {
          // key: item.id,
          label: item.data + " -- " + item.tytul,
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
          ui: {
            timeFormat: "HH:mm ZZ",
            utc: true,
          },
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
    },
    {
      type: "string",
      name: "link",
      label: "Link do e-wejściówek",
      required: true,
    },
  ] as TinaField[];
}
