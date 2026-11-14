const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Fecha y hora LOCAL sin zona horaria ("2026-12-05T18:30:00"), el formato del
 * LocalDateTime del backend. toISOString() enviaba la hora en UTC y los eventos
 * quedaban corridos (3 h en Chile).
 */
export const toLocalDateTimeString = (d: Date): string =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
  `T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
