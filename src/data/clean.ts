/**
 * Võtmed ja aadressid kopeeritakse sageli kolmandate rakenduste kaudu, mis asendavad tavalise sidekriipsu
 * "-" pikemaga (‐ ‑ – — −) või lisavad nähtamatuid märke. Brauser keeldub selliseid päises kasutamast.
 * See taastab tavalise ASCII kuju.
 */
export function cleanSecret(s: string): string {
  return (s ?? "")
    .replace(/[‐-―−﹘﹣－]/g, "-")
    .replace(/[‘’“”"']/g, "")
    .replace(/[^\x21-\x7E]/g, "")
    .trim();
}
