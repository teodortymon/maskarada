import * as React from "react";
import { wrapFieldsWithMeta } from "tinacms";

/**
 * UTC-literal date + time field for TinaCMS.
 * ---------------------------------------------------------------------------
 * WHY THIS EXISTS
 *
 * Event times in `_data/spektakle/*.yml` are stored as ISO strings with a `Z`
 * suffix, e.g. `2026-10-18T12:30:00.000Z`. In this project the `Z` does NOT
 * mean "12:30 in London" — the whole site treats the UTC clock AS the wall
 * clock. Eleventy's `date` filter renders with `getUTCHours()` /
 * `getUTCMinutes()` (see eleventy.config.js), so `12:30Z` shows as `12:30`
 * everywhere on the public site.
 *
 * Tina's built-in `datetime` field does NOT follow that convention. Since
 * tinacms 3.x the field is built on react-day-picker + date-fns, which always
 * format/parse in the EDITOR'S BROWSER timezone. In Warsaw (CEST, +02:00) that
 * turns `12:30Z` into `14:30` on screen — and worse, saving through that picker
 * writes back `.toISOString()`, so "fixing" 14:30 back to 12:30 in the widget
 * silently stores `10:30Z` and shifts the real showtime by two hours.
 *
 * (The old Tina docs mention a `utc: true` ui option; that belonged to the
 * previous react-datetime implementation and is silently ignored in 3.x.)
 *
 * THE FIX
 *
 * We bypass all timezone math by using native <input type="date"> and
 * <input type="time">. Those inputs speak plain wall-clock strings
 * ("2026-10-18" and "12:30") with no timezone conversion whatsoever. We read
 * the date/time straight out of the stored ISO string and write it straight
 * back with the same `Z` suffix. What the editor sees is exactly what the site
 * shows — no ±2h drift, at any time of year, in any browser timezone.
 *
 * This keeps the stored format byte-for-byte identical, so nothing else has to
 * change: no data migration, no template changes, no Biletomat generator
 * changes.
 * ---------------------------------------------------------------------------
 */

/** Matches the date and HH:mm out of an ISO string, ignoring any offset. */
const ISO_RE = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/;

/** Split a stored value into the wall-clock `date` (YYYY-MM-DD) + `time` (HH:mm). */
function splitUtc(value: string | undefined | null): { date: string; time: string } {
  if (!value) return { date: "", time: "" };

  // Fast path: read the literal characters, so no Date/timezone logic runs.
  const m = ISO_RE.exec(value);
  if (m) return { date: m[1], time: m[2] };

  // Fallback for any non-standard input: interpret via UTC getters (never local).
  const d = new Date(value);
  if (isNaN(d.getTime())) return { date: "", time: "" };
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    date: `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`,
    time: `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`,
  };
}

/** Rebuild the canonical stored string from a wall-clock date + time. */
export function joinUtc(date: string, time: string): string {
  if (!date) return "";
  const t = time && /^\d{2}:\d{2}$/.test(time) ? time : "00:00";
  return `${date}T${t}:00.000Z`;
}

/** Friendly Polish preview, e.g. "niedziela, 18 października 2026, 12:30". */
function previewPl(value: string): string {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "—";
  try {
    return new Intl.DateTimeFormat("pl-PL", {
      timeZone: "UTC", // format the stored clock verbatim, never the browser's
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    const { date, time } = splitUtc(value);
    return `${date} ${time}`;
  }
}

// Chunky, high-contrast controls — comfortable for an occasional/senior editor.
const inputStyle: React.CSSProperties = {
  fontSize: "1.05rem",
  padding: "0.55rem 0.7rem",
  border: "1px solid #cbd5e1",
  borderRadius: "0.375rem",
  background: "#fff",
  color: "#0f172a",
  lineHeight: 1.3,
};

const smallLabelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.75rem",
  fontWeight: 600,
  color: "#64748b",
  marginBottom: "0.25rem",
  textTransform: "uppercase",
  letterSpacing: "0.03em",
};

type TinaInput = {
  value?: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
};

/**
 * The field component. `input` is final-form's field API supplied by Tina;
 * `input.value` is the stored string and `input.onChange` writes it back.
 */
function UtcDateTimeInput({ input }: { input: TinaInput }) {
  const { date, time } = splitUtc(input.value);

  return (
    <div>
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
        <div>
          <label style={smallLabelStyle}>Data</label>
          <input
            type="date"
            value={date}
            style={inputStyle}
            onFocus={input.onFocus}
            onBlur={input.onBlur}
            onChange={(e) => input.onChange(joinUtc(e.target.value, time))}
          />
        </div>
        <div>
          <label style={smallLabelStyle}>Godzina</label>
          <input
            type="time"
            value={time}
            style={inputStyle}
            onFocus={input.onFocus}
            onBlur={input.onBlur}
            onChange={(e) => input.onChange(joinUtc(date, e.target.value))}
          />
        </div>
      </div>
      <p style={{ margin: "0.6rem 0 0", fontSize: "0.9rem", color: "#334155" }}>
        Wyświetli się na stronie jako:{" "}
        <strong>{previewPl(input.value || "")}</strong>
      </p>
    </div>
  );
}

/** Wrapped so it gets Tina's standard label / description / error chrome. */
export const UtcDateTimeField = wrapFieldsWithMeta(UtcDateTimeInput);

/**
 * Ready-made `ui` block for a `datetime` field. Spread it into the field:
 *
 *   { type: "datetime", name: "data", label: "Data spektaklu",
 *     required: true, ui: utcDateTimeUi }
 *
 * `parse` / `format` are identity so the exact stored string round-trips
 * untouched (the default datetime plugin would run `new Date(v).toISOString()`,
 * which is a no-op for our `Z` strings, but we pin it to be explicit).
 */
export const utcDateTimeUi = {
  component: UtcDateTimeField,
  parse: (value?: string) => value ?? "",
  format: (value?: string) => value ?? "",
};
