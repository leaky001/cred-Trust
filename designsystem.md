Complete Modern Web App Design System (Production Standard)
1. Design Principles (Foundation Philosophy)

These guide every design decision.

Core Principles

Clarity first → minimal cognitive load

Hierarchy driven layout → clear visual flow

Functional aesthetics → beauty supports usability

Accessibility by default

Mobile-first responsive design

Consistent interaction patterns

Performance-aware design

Visual Style Direction

clean minimal UI

generous whitespace

soft shadows

subtle depth layers

rounded corners

high readability typography

calm neutral palette + strong primary accent

2. Design Tokens (Single Source of Truth)

All UI values must come from tokens.

2.1 Colour System (Modern App Palette)

Inspired by Stripe + Apple + Notion UI systems.

Primary Brand Colours
Primary 500: #4F46E5 (indigo modern tech)
Primary 600: #4338CA
Primary 700: #3730A3

Secondary Accent
Accent 500: #06B6D4 (cyan)
Accent 600: #0891B2

Neutral System (Interface Foundation)
Gray 50: #FAFAFA
Gray 100: #F4F4F5
Gray 200: #E4E4E7
Gray 300: #D4D4D8
Gray 400: #A1A1AA
Gray 500: #71717A
Gray 600: #52525B
Gray 700: #3F3F46
Gray 800: #27272A
Gray 900: #18181B

Semantic Colours
Success: #10B981
Warning: #F59E0B
Error: #EF4444
Info: #3B82F6

Background
Surface: #FFFFFF
Surface secondary: #FAFAFA

Dark Mode
Background: #09090B
Surface: #18181B
Text primary: #F4F4F5

Usage Rules

One primary accent per screen

Never mix more than 2 accent colours

Minimum contrast 4.5:1

2.2 Typography System (Best Modern Stack)

Industry standard: highly readable, neutral, scalable.

Primary Font

Inter

fallback: system-ui, sans-serif

Used by Figma, Stripe, Vercel.

Secondary Font (Optional Brand Personality)

SF Pro (Apple ecosystem)

or Geist (modern tech feel)

Type Scale (8pt system)
Display: 48px / 56px
H1: 36px / 44px
H2: 30px / 38px
H3: 24px / 32px
H4: 20px / 28px
Body Large: 18px
Body: 16px
Small: 14px
Caption: 12px

Font Weights
Regular 400
Medium 500
Semibold 600
Bold 700

Typography Rules

Max line length: 70 characters

1.5 line height minimum

Avoid pure black text

2.3 Spacing System

8-point grid.

4px
8px
12px
16px
24px
32px
48px
64px
96px

Layout Guidelines

Card padding: 24px

Section spacing: 64px

Component spacing: 16px

2.4 Border Radius
Small: 6px
Medium: 12px
Large: 20px
Full: 999px


Modern apps use soft rounding.

2.5 Shadows (Depth System)
Elevation 1: subtle card
Elevation 2: dropdown
Elevation 3: modal
Elevation 4: overlay


Use low opacity blur.

3. Layout System
3.1 Grid
Desktop

12 column grid

max width: 1280px

gutter: 24px

Tablet

8 column grid

Mobile

4 column grid

3.2 Breakpoints
Mobile: 0–640px
Tablet: 640–1024px
Desktop: 1024–1440px
Wide: 1440px+


Mobile first CSS.

3.3 Container Width
Small: 640px
Medium: 768px
Large: 1024px
XL: 1280px

4. Component System

Standard enterprise component library.

4.1 Buttons
Types

Primary (filled)

Secondary (outline)

Ghost

Destructive

States

default

hover

active

disabled

loading

Size
Small 32px
Medium 40px
Large 48px

4.2 Form Controls

text input

textarea

select

checkbox

radio

switch

date picker

file upload

Rules:

always label above

inline validation

error message below

4.3 Navigation

top navigation bar

sidebar

tabs

breadcrumbs

pagination

4.4 Data Display

tables

cards

lists

avatar

badges

tags

tooltips

4.5 Feedback

modal

toast

alert

skeleton loader

progress bar

5. Motion & Interaction
Animation Principles

purposeful

fast

subtle

Duration
fast: 150ms
normal: 250ms
slow: 400ms

Easing
ease-out default

Microinteractions

hover elevation

button ripple

form validation feedback

loading transitions

6. Accessibility (Mandatory)
WCAG Compliance

AA minimum

keyboard navigation

ARIA roles

focus states visible

screen reader support

Touch Targets

minimum 44px

7. Dark Mode Strategy

token-based colour switching

no pure black

reduced contrast for large surfaces

semantic colours adjusted

8. Iconography
Recommended Libraries

Lucide

Heroicons

Rules:

24px base size

consistent stroke width

line icons preferred

9. Design Language Patterns
Cards

rounded corners

light elevation

generous padding

Forms

vertical layout

clear feedback

Data UI

table + card hybrid layouts

Empty States

illustration

helpful message

primary action

10. Documentation Structure (How Teams Use It)

Your design system repo should contain:

/tokens
/components
/patterns
/accessibility
/guidelines
/design-assets

11. Tech Implementation Stack

Professional setup:

Frontend

React + TypeScript

Tailwind CSS

Storybook (component documentation)

Design

Figma component library

design tokens sync