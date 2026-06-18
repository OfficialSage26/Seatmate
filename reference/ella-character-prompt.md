# Ella — Character & Art-Style Master Prompt

This is the single source of truth for generating **Ella**, Seatmate's companion.
Use it to keep her art, personality, and voice consistent across every screen,
expression, and future asset. The `🌿` emoji currently used in the app
(`src/companions/companions.ts`) is a placeholder for the art described here.

---

## 1. Who Ella is

Ella is your **seatmate** — the calm classmate who sits beside you and quietly
keeps you steady through quizzes, deadlines, and bad grades. She is not a coach
who pushes or a cheerleader who shouts. She is the reassuring presence that helps
you **breathe, refocus, and keep going at your own pace.**

- **Role:** virtual study companion for students (junior high → college).
- **One-liner:** _Calm, gentle, encouraging._
- **Motif:** new growth — a fresh green leaf/sprig. Patience, steady progress,
  "little by little."
- **Signature color:** `#27AE60` (Seatmate green).

---

## 2. Personality & voice (for writing her lines)

| Trait | Yes | No |
| --- | --- | --- |
| Tone | Warm, soft-spoken, grounding | Loud, hyper, sarcastic |
| Pressure | "No rush, one step at a time" | Guilt, nagging, urgency |
| Praise | Sincere, specific, gentle | Over-the-top, exclamation spam |
| Setbacks | Normalizes, reframes, reassures | Lectures, "I told you so" |
| Emoji | Sparingly — mostly 🌿 | Emoji clutter |

**Voice rules**

- Short, breathable sentences. Speak _to_ the student, by name when natural.
- Reassure first, then guide. ("Breathe, {name}. A calm review today is enough.")
- Never panic, never shame. A low score "doesn't define you."
- British/neutral-friendly plain English. No slang-heavy dialect.

Her written lines live in `src/companions/dialogue.ts` under the `ella` bank —
keep new lines inside this voice.

---

## 3. Locked physical design (do not drift)

These features must stay identical across every render so she reads as the same
character. Treat them as canon.

- **Age read:** ~16–18, approachable student.
- **Hair:** shoulder-length, soft wavy, **warm dark-brown**; one small section
  loosely tucked behind the ear. A single tiny **green leaf hair-clip** above
  the left ear (her signature accessory).
- **Eyes:** large, soft, **warm hazel-green**; calm, kind expression. Gentle
  rounded eyebrows.
- **Skin:** light-warm / soft tan (Southeast-Asian friendly).
- **Outfit:** simple modern **school cardigan in soft sage green** over a white
  collared shirt; small leaf pin on the collar. Clean, cozy, uncluttered.
- **Build/pose:** relaxed, open, slightly tilted head — never tense.
- **Vibe:** the friend who calms the room down just by being there.

---

## 4. Art style

- **Style:** soft, modern **flat-shaded character illustration** — clean vector
  feel with gentle gradient shading. Friendly, rounded, app-mascot quality.
  Think calm wellness-app illustration, **not** photorealistic, **not** heavy
  anime line-art, **not** 3D Pixar render.
- **Line:** minimal or no hard outline; shapes defined by soft color blocks.
- **Lighting:** soft, even, warm. Subtle ambient glow, no harsh shadows.
- **Finish:** smooth, low-detail, poster-clean. Reads clearly at 96 px.
- **Framing:** centered bust/portrait (head + shoulders) unless a pose pack
  entry says otherwise. Generous padding around the figure.

---

## 5. Color palette

| Use | Hex |
| --- | --- |
| Primary green (signature) | `#27AE60` |
| Soft sage (cardigan / fills) | `#A8D5BA` |
| Deep leaf (accents/shading) | `#1E7E47` |
| Hair brown | `#5A3E2B` |
| Skin warm | `#F2C9A0` |
| Shirt / highlight | `#F7FBF8` |

Keep green as the dominant accent. Avoid colors that fight the app's `#27AE60`.

---

## 6. Master base prompt (reusable)

Paste this as the foundation for **every** Ella render, then append a pose/
expression line from §7.

```
Character portrait of "Ella", a calm and gentle teenage study companion.
Soft modern flat-shaded character illustration, clean vector style with gentle
gradient shading, friendly app-mascot quality, no harsh outlines.

Appearance (keep consistent): ~17 years old, light-warm tan skin, large soft
warm hazel-green eyes, kind calm expression, shoulder-length soft wavy
warm dark-brown hair with one strand tucked behind the ear, a small green
leaf hair-clip above the left ear. Wearing a cozy soft sage-green school
cardigan over a white collared shirt with a tiny leaf pin on the collar.

Mood: serene, reassuring, warm, encouraging. Nature / new-growth motif.
Color palette built around green #27AE60 and soft sage, warm soft lighting,
subtle ambient glow, smooth poster-clean finish.

Centered head-and-shoulders portrait, generous padding, transparent background.
```

### Negative prompt

```
photorealistic, 3d render, realistic skin texture, harsh anime lineart,
heavy black outlines, busy background, clutter, extra accessories, text,
watermark, logo, low quality, deformed hands, distorted face, asymmetrical eyes,
oversaturated, neon colors, dark/gloomy mood, aggressive or stern expression
```

---

## 7. Expression / pose pack (maps to app triggers)

Render Ella in this set so the app can swap her art to match the moment. Each
line maps to a `TriggerKey` in `src/companions/types.ts`. Append it to the §6
base prompt.

| Asset | Trigger(s) | Append to base prompt |
| --- | --- | --- |
| `ella_neutral` | `home_greeting`, default | "soft warm smile, calm and welcoming, looking gently at the viewer" |
| `ella_intro` | `onboarding_intro` | "small friendly wave, gentle welcoming smile, slight head tilt, open and reassuring" |
| `ella_calm` | `home_morning`, `quiz_due_soon` | "eyes softly closed, one calm breath, peaceful serene expression, grounding" |
| `ella_encouraging` | `quiz_added`, `empty_quizzes`, `companion_selected` | "gentle encouraging smile, hand lightly over heart, supportive and patient" |
| `ella_proud` | `quiz_scored_high`, `onboarding_ready` | "warm proud smile, soft happy eyes, a quiet celebratory glow, leaves drifting" |
| `ella_comforting` | `quiz_scored_low` | "soft caring expression, gentle reassuring look, head tilted, 'it's okay' warmth" |
| `ella_steady` | `quiz_scored_mid`, `surprise_quiz`, `home_evening` | "calm steady reassuring smile, composed and grounding, lightly nodding" |

> Tip: each pose maps to one or more of Ella's dialogue triggers, so art and
> copy stay emotionally in sync.

---

## 8. Output / technical specs

- **Format:** PNG, **transparent background**, square canvas (1:1).
- **Sizes:** export at 1024×1024, ship downscaled @1x/@2x/@3x. App displays her
  in a circular avatar ~104–132 px (see `home`/`onboarding`), so the face must
  read clearly when small and center-cropped to a circle.
- **Safe area:** keep the head fully inside the central 80% so a circular mask
  never clips hair or the leaf clip.
- **Naming:** `ella_<pose>@<scale>x.png` (e.g. `ella_proud@2x.png`).
- **Drop location:** `assets/images/companions/ella/`, then wire up by replacing
  the `emoji` placeholder in `src/companions/companions.ts` with an image map.

---

## 9. Consistency checklist (every render)

- [ ] Leaf hair-clip above the **left** ear present.
- [ ] Warm dark-brown wavy shoulder-length hair, one strand tucked.
- [ ] Soft hazel-green eyes, calm — never stern or wide-eyed.
- [ ] Sage-green cardigan + white collar + collar leaf pin.
- [ ] Green-led palette, soft warm lighting, flat-shaded (not 3D/photo).
- [ ] Transparent background, centered, reads clearly at 96 px.
- [ ] Expression matches the intended trigger from §7.

> For repeatable results, lock a **seed** once you get an on-model base render
> and reuse it across the pose pack, varying only the expression line from §7.
