# Web ↔ Mobile Switcher — Design

**Date:** 2026-07-31  
**Status:** Implemented  
**Approach:** A — Simple bidirectional links

## Goal

Allow quick switching between **Web Admin** and **SFA Mobile WebView** during prototype demos, without iframe or session history.

## Decisions (confirmed)

| Topic | Choice |
|-------|--------|
| Approach | Simple links (A) |
| Web → Mobile target | `Views/Mobile/home.html` (Beranda) |
| Mobile → Web target | `index.html` (Dashboard Web) |
| Mobile button location | Profil only |
| Sidebar placement | Replaces Generate FSD (removed) |

## Extra change (requested at implementation)

- Menu **Generate FSD** dihapus dari sidebar Web Admin.

## Out of scope

- Iframe / embedded mobile inside Vuexy layout
- Remember last-visited page (`sessionStorage`)
- Auto-login / session bridging between Web and Mobile
- Changing mobile home menu items
- Deleting `Views/FPRS/Tools/GenerateFSD/` folder (menu only removed)

## UI Spec

### 1. Web Admin sidebar

**Files:** all `wwwroot/js/layout.js` copies (root + Mobile wrappers)

**Menu item:**
- Label: `SFA Mobile`
- Icon: `fas fa-mobile-alt` (`#00897b`)
- Href: `${basePath}Views/Mobile/home.html`
- Position: after Kunjungan / where Tools was

### 2. Mobile Profil — back to Web

**Files:** `Views/Mobile/profil.html` + mirrored copies

**Button:**
- Label: `Ke Web Admin`
- Icon: `fas fa-desktop`
- Placement: above **Keluar dari Akun**
- Href: `../../index.html`

## Acceptance criteria

- [x] Sidebar shows **SFA Mobile** and opens mobile home.
- [x] Profil shows **Ke Web Admin** above logout and opens web `index.html`.
- [x] Generate FSD menu removed from sidebar.
- [x] Mirrored Mobile/APK layout + profil copies synced.
