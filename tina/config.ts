import { defineConfig } from "tinacms";
import { repertuar_blocksFields } from "./templates";
import { spektaklFields } from "./templates";

// Your hosting provider likely exposes this as an environment variable
// const branch = process.env.HEAD || process.env.VERCEL_GIT_COMMIT_REF || "main";
const branch = "master";

export default defineConfig({
  branch,
  clientId: process.env.TINA_PUBLIC_CLIENT_ID,
  token: process.env.TINA_TOKEN,
  client: { skip: true },
  build: {
    outputFolder: "admin",
    publicFolder: "./",
  },
  media: {
    tina: {
      mediaRoot: "",
      publicFolder: "./",
    },
  },
  schema: {
    collections: [
      {
        format: "yml",
        label: "Repertuary",
        name: "repertuary",
        path: "_data/spektakle",
        match: {
          include: "*",
        },
        fields: [
          {
            type: "string",
            name: "title",
            label: "miesiac",
            description: "Miesiac",
            isBody: true,
          },
          ...repertuar_blocksFields(),
        ],
      },
      {
        format: "yml",
        label: "Nazwy spektakli",
        name: "nazwy_spektakli",
        path: "_data/spektakle",
        // ui: {
        //   allowedActions: {
        //     create: false,
        //     delete: false,
        //   },
        // },
        match: {
          include: "spektakle",
        },
        fields: [
          {
            name: "tytuly",
            type: "string",
            list: true,
          },
          // {
          //   name: "tytuly",
          //   label: "Dummy field",
          //   type: "object",
          //   list: true,
          //   fields: [
          //     {
          //       type: "string",
          //       name: "tytul",
          //     },
          //   ],
          // },
        ],
      },
      {
        format: "md",
        label: "Strona główna",
        name: "strona_g__wna",
        path: "t",
        ui: {
          allowedActions: {
            create: false,
            delete: false,
          },
        },
        match: {
          include: "index",
        },
        fields: [
          {
            type: "rich-text",
            name: "body",
            label: "Body of Document",
            description: "This is the markdown body",
            isBody: true,
          },
        ],
      },
      {
        format: "md",
        label: "Repertuar",
        name: "repertuar",
        path: "t",
        ui: {
          allowedActions: {
            create: false,
            delete: false,
          },
        },
        match: {
          include: "repertuar",
        },
        fields: [
          {
            type: "rich-text",
            name: "body",
            label: "Body of Document",
            description: "This is the markdown body",
            isBody: true,
          },
        ],
      },
      {
        format: "md",
        label: "Bilety",
        name: "bilety",
        path: "t",
        ui: {
          allowedActions: {
            create: false,
            delete: false,
          },
        },
        match: {
          include: "bilety",
        },
        fields: [
          {
            type: "rich-text",
            name: "body",
            label: "Body of Document",
            description: "This is the markdown body",
            isBody: true,
          },
        ],
      },
      {
        format: "md",
        label: "O nas",
        name: "o_nas",
        path: "t",
        ui: {
          allowedActions: {
            create: false,
            delete: false,
          },
        },
        match: {
          include: "onas",
        },
        fields: [
          {
            type: "rich-text",
            name: "body",
            label: "Body of Document",
            description: "This is the markdown body",
            isBody: true,
          },
        ],
      },
      {
        format: "md",
        label: "Warsztaty",
        name: "warsztaty",
        path: "t",
        ui: {
          allowedActions: {
            create: false,
            delete: false,
          },
        },
        match: {
          include: "warsztaty",
        },
        fields: [
          {
            type: "rich-text",
            name: "body",
            label: "Body of Document",
            description: "This is the markdown body",
            isBody: true,
          },
        ],
      },
      {
        format: "md",
        label: "Kontakt",
        name: "kontakt",
        path: "t",
        ui: {
          allowedActions: {
            create: false,
            delete: false,
          },
        },
        match: {
          include: "kontakt",
        },
        fields: [
          {
            type: "rich-text",
            name: "body",
            label: "Body of Document",
            description: "This is the markdown body",
            isBody: true,
          },
        ],
      },
      {
        format: "yml",
        label: "Wszystkie bazy danych",
        name: "wszystkie_bazy_danych",
        path: "_data",
        match: {
          include: "**/*",
        },
        fields: repertuar_blocksFields(),
      },
    ],
  },
});
