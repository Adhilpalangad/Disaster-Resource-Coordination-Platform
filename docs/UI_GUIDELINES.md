# UI GUIDELINES

# Design Philosophy

The Disaster Resource Coordination Platform is an enterprise-grade disaster management application.

The interface should prioritize usability during emergency situations.

Users may be under stress, so every interaction should be simple, fast and predictable.

The design should resemble modern SaaS platforms rather than portfolio websites.

Examples of inspiration

- Linear
- Stripe Dashboard
- Notion
- Vercel Dashboard
- GitHub
- Clerk Dashboard

Do NOT imitate social media layouts.

---

# Design Principles

Prioritize

- Clarity
- Accessibility
- Consistency
- Speed
- Readability

Avoid

- Large hero banners
- Heavy gradients
- Glassmorphism
- Excessive animations
- Decorative UI
- Random cards

Every component must have a purpose.

---

# Color Palette

## Primary

Reliable Blue

HEX

#0284C7

Hover

#0369A1

---

## Secondary

Slate Gray

HEX

#475569

Hover

#334155

---

## Success

Green

#22C55E

---

## Warning

Amber

#F59E0B

---

## Danger

Red

#EF4444

---

## Information

Sky Blue

#38BDF8

---

## Background

Light Gray

#F8FAFC

---

## Surface

White

#FFFFFF

---

## Border

#E2E8F0

---

# Typography

Primary Font

Inter

Fallback

sans-serif

Headings

Bold

Body

Regular

Small labels

Medium

Avoid decorative fonts.

---

# Spacing

Use an 8px spacing system.

Examples

8px

16px

24px

32px

48px

64px

Never use random spacing values.

---

# Border Radius

Buttons

10px

Cards

16px

Inputs

10px

Dialogs

18px

Avoid sharp corners.

---

# Shadows

Use subtle shadows only.

Avoid floating effects.

Cards should feel grounded.

---

# Buttons

Primary

Blue background

White text

Rounded corners

Secondary

White background

Gray border

Danger

Red background

White text

Disabled

Gray background

Gray text

Loading

Spinner inside button

---

# Forms

Every form should include

Label

Input

Helper Text

Validation Message

Placeholder

Required fields must be clearly indicated.

Validation errors should appear directly below the field.

---

# Input Fields

Consistent height

Clear labels

Rounded corners

Visible focus state

Do not rely only on placeholder text.

---

# Icons

Use Lucide React icons.

Icons should communicate meaning.

Avoid decorative icons.

Examples

Disaster

Alert Triangle

Volunteer

User

Shelter

Home

Inventory

Package

Dashboard

Layout Dashboard

Notifications

Bell

---

# Navigation

Before Login

Header

Home

About

Contact

Login

Register

After Login

Sidebar

Dashboard

Disasters

Relief Requests

Shelters

Volunteers

Inventory

Notifications

Profile

Settings

Logout

Sidebar should remain consistent throughout the application.

---

# Dashboard Layout

Desktop

Sidebar

Top Navigation

Content Area

Right Information Panel (optional)

Mobile

Top Navigation

Hamburger Menu

Scrollable Content

---

# Cards

Cards should display

Title

Status

Description

Action Buttons

Metadata

Avoid placing too much information inside one card.

---

# Tables

Use tables for

Users

Requests

Inventory

Volunteers

NGOs

Support

Sorting

Filtering

Pagination

Search

---

# Status Colors

Pending

Amber

Verified

Green

Rejected

Red

In Progress

Blue

Completed

Green

Closed

Gray

Every status must include both color and text.

---

# Alerts

Success

Green

Warning

Amber

Error

Red

Information

Blue

---

# Loading States

Every page should include

Skeleton Loading

Spinner

Loading Button

Do not leave blank pages while loading.

---

# Empty States

Every empty state should include

Illustration

Explanation

Primary Action

Example

"No relief requests have been submitted yet."

Button

Create Request

---

# Responsive Design

Desktop

1440px+

Laptop

1024px+

Tablet

768px+

Mobile

375px+

Every page must remain usable on mobile devices.

---

# Accessibility

Keyboard Navigation

Visible Focus States

Semantic HTML

ARIA Labels where necessary

Good color contrast

Readable font sizes

Buttons should never depend only on color.

---

# Images

Use Cloudinary.

Optimize images.

Never upload large images directly.

Support preview before upload.

---

# Animations

Keep animations minimal.

Use

Fade

Slide

Scale

Avoid

Bounce

Rotate

Flash

Long transitions

---

# Component Naming

Use PascalCase

Examples

RequestCard

StatusBadge

DashboardHeader

VolunteerTable

InventoryList

---

# File Organization

Feature components belong inside their own feature folder.

Reusable components belong inside

src/components

Never duplicate reusable UI.

---

# AI Development Rules

Before creating UI

Understand the page purpose.

Reuse existing components whenever possible.

Do not redesign existing pages.

Follow the existing design language.

Maintain spacing consistency.

Use the defined color palette.

Keep layouts professional.

Always generate production-ready React components.

Never generate placeholder portfolio layouts.