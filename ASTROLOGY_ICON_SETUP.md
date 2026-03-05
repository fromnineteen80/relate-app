# Astrology Icon Setup — Noun Project

The Sun, Moon & Rise module uses **Unicode symbol fallbacks** for zodiac signs and celestial bodies.
To upgrade to proper astrology icons from the Noun Project, follow the steps below.

## Current Unicode Fallbacks

| Placement | Unicode | Description        |
|-----------|---------|-------------------|
| Sun       | ☉       | Sun symbol         |
| Moon      | ☽       | Crescent moon      |
| Rising    | ↑       | Upward arrow       |

| Sign          | Unicode |
|---------------|---------|
| Aries         | ♈      |
| Taurus        | ♉      |
| Gemini        | ♊      |
| Cancer        | ♋      |
| Leo           | ♌      |
| Virgo         | ♍      |
| Libra         | ♎      |
| Scorpio       | ♏      |
| Sagittarius   | ♐      |
| Capricorn     | ♑      |
| Aquarius      | ♒      |
| Pisces        | ♓      |

## Recommended Noun Project Icons

Search for these on [thenounproject.com](https://thenounproject.com):

### Celestial Bodies (profile cards)
1. **Sun** — Search: "sun astrology" or "sun symbol" — look for a clean, line-art circle with rays
2. **Moon** — Search: "crescent moon" — look for a thin crescent, minimal style
3. **Rising / Ascendant** — Search: "ascendant astrology" or "horizon sunrise" — look for a line on a horizon with an upward arrow

### Zodiac Signs (cheat sheet + profile)
Search: "zodiac [sign name]" for each of the 12 signs. Use a **consistent collection** so all 12 share the same style. Recommended collections:
- Search "zodiac sign set" or "horoscope icon set" for matched sets
- Prefer **line/outline style** to match the app's minimal aesthetic
- Choose **SVG format** for crisp rendering at any size

## How to Integrate

1. **Download SVGs** from Noun Project (requires a paid plan or per-icon license)
2. **Place files** in `/public/icons/astrology/`:
   ```
   public/icons/astrology/
   ├── sun.svg
   ├── moon.svg
   ├── rising.svg
   ├── aries.svg
   ├── taurus.svg
   ├── gemini.svg
   ├── cancer.svg
   ├── leo.svg
   ├── virgo.svg
   ├── libra.svg
   ├── scorpio.svg
   ├── sagittarius.svg
   ├── capricorn.svg
   ├── aquarius.svg
   └── pisces.svg
   ```
3. **Update `src/lib/astrology/signs.ts`**: Replace the `symbol` field in each `SIGN_DATA` entry with the SVG path, or create an `iconPath` field alongside the unicode `symbol`.
4. **Update profile cards** in `src/app/results/astrology/page.tsx`: Replace the unicode text in the circle with an `<Image>` or inline SVG component.
5. **Update cheat sheet** in `src/app/results/astrology/cheatsheet/page.tsx`: Replace the `{sign.symbol}` render with the SVG icon.

## Styling Notes

- Icons should render at **24×24px** in the cheat sheet sign list and **32×32px** in the profile cards
- Use `currentColor` for SVG fill/stroke so they inherit the element color scheme
- The app uses element-based color mapping: Fire (red), Earth (emerald), Air (sky blue), Water (indigo)

## License

Noun Project icons require attribution (free plan) or a Pro subscription (no attribution). Ensure compliance with your license tier.
