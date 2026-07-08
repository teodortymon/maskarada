import { defineConfig } from "tinacms";
import { repertuar_blocksFields } from "./templates";

// For cloud/prod this comes from the hosting env; locally `tinacms dev` runs in
// local mode and ignores branch/clientId/token.
const branch = process.env.HEAD || process.env.CF_PAGES_BRANCH || "v2";

export default defineConfig({
  branch,
  clientId: process.env.TINA_PUBLIC_CLIENT_ID,
  token: process.env.TINA_TOKEN,
  client: { skip: true },
  build: {
    // Tina builds its admin SPA here; Eleventy passthrough-copies admin/ → _site/admin.
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
          exclude: "spektakle",
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
        match: {
          include: "spektakle",
        },
        fields: [
          {
            name: "tytuly",
            type: "string",
            list: true,
          },
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
    ],
  },
});
