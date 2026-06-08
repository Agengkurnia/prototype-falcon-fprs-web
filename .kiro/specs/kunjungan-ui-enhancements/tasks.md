# Implementation Plan: Kunjungan UI Enhancements

## Overview

This plan implements three UI enhancement areas for the Falcon FPRS Kunjungan module: enhanced filtering with combined AND logic, bulk route assignment with checkbox selection, and skeleton loading placeholders. All work is done in static HTML files using jQuery, Bootstrap 5, DataTables, and fast-check for property-based testing. No build tools are introduced.

## Tasks

- [x] 1. Implement skeleton loading placeholders across all pages
  - [x] 1.1 Add skeleton CSS and HTML to Informasi index page
    - Add `@keyframes shimmer` and `.skeleton*` CSS classes to the page's `<style>` block
    - Add 4 skeleton stat card elements inside `#statRow` (hidden when data loads)
    - Add 5 skeleton table rows inside `#tblBody` area
    - Add `aria-label="Loading"` and `role="status"` to all skeleton elements
    - Implement `showSkeletons()` / `hideSkeletons()` functions called before/after `$.getJSON`
    - Show error message and remove skeletons on fetch failure
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 14.1, 14.2, 14.3, 14.4, 14.5_

  - [x] 1.2 Add skeleton CSS and HTML to Informasi detail page
    - Add identical `@keyframes shimmer` and `.skeleton*` CSS classes
    - Add skeleton placeholder for the info card (col-md-3 area)
    - Add 10 skeleton metric cells in the 2-column metrics grid
    - Add 3 skeleton table rows for the Daftar Kunjungan table (11 columns)
    - Use `requestAnimationFrame` for single-repaint content swap
    - Remove skeletons and show error if data fails to load within 10 seconds
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 14.1, 14.2, 14.3, 14.4, 14.5_

  - [x] 1.3 Add skeleton CSS and HTML to Management Rute page
    - Add identical `@keyframes shimmer` and `.skeleton*` CSS classes
    - Add 3 skeleton route-item-cards in the "Kelola Rute Harian" panel
    - Add 3 skeleton customer-item-cards in the "Cari Pelanggan" panel
    - Add 3 skeleton table rows (10 columns) in the Weekly Table area
    - Remove skeletons and show inline error with "Coba Lagi" retry button on failure/timeout
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 14.1, 14.2, 14.3, 14.4, 14.5_

- [x] 2. Checkpoint - Ensure skeleton loading works
  - Ensure all tests pass, ask the user if questions arise.

- [x] 3. Implement enhanced filtering on Informasi index page
  - [x] 3.1 Add advanced filter HTML controls to filter panel
    - Add Area/Region `<select>` (`#filterArea`) with "Semua Area" default
    - Add Divisi `<select>` (`#filterDivisi`) with "Semua Divisi" default
    - Add Status Kunjungan `<select>` (`#filterStatus`) with "Semua" / "Sudah Check-out" / "Belum Check-out"
    - Add Date Range inputs (`#filterDateStart`, `#filterDateEnd`) of type="date"
    - Add `#dateValidationError` element for inline error messages
    - Arrange in responsive grid (3 columns ≥768px, 1 column below)
    - _Requirements: 1.3, 2.1, 3.1, 4.1, 5.1_

  - [x] 3.2 Implement filter state management and data enrichment
    - Define `filterState` object with all filter fields
    - Enrich `listData` rows with `area` (from name prefix) and `divisi` (from pegawai.json lookup)
    - Load `pegawai.json` alongside `sales_data_by_date.json`
    - Implement `populateFilterDropdowns()` to extract sorted unique values for Area and Divisi
    - Handle empty data edge case (only placeholder shown)
    - _Requirements: 2.1, 2.4, 3.1, 3.4_

  - [x] 3.3 Implement DataTables custom filter function with AND composition
    - Register `$.fn.dataTable.ext.search.push()` with combined predicate function
    - Implement name substring match predicate
    - Implement month/year predicate
    - Implement area exact match predicate
    - Implement divisi exact match predicate
    - Implement status predicate (check endTime empty/non-empty)
    - Implement date range inclusive bounds predicate
    - Empty/default filter values are treated as no-op (pass-through)
    - _Requirements: 2.2, 2.3, 3.2, 3.3, 4.2, 4.3, 4.4, 4.5, 5.2, 5.4_

  - [x] 3.4 Implement date range validation
    - `validateDateRange()` returns `{valid, error}` object
    - Reject start > end with message "Tanggal mulai harus sebelum tanggal selesai"
    - Reject single-field entry with message "Kedua tanggal harus diisi"
    - Show error in `#dateValidationError`, prevent filter application on invalid
    - _Requirements: 5.3, 5.5_

  - [x] 3.5 Implement filter apply and reset actions
    - `applyFilters()`: reads UI inputs, validates date range, updates filterState, calls `table.draw()`
    - `resetFilters()`: clears all inputs to defaults, resets filterState, calls `table.draw()`
    - Update filter panel toggle to use `slideToggle(300)` and retain values when hidden
    - Wire `#applyFilters` and `#resetFilters` button click handlers
    - _Requirements: 1.1, 1.2, 1.4, 6.1, 6.2_

  - [x] 3.6 Implement stat card dynamic update on filter
    - `updateStatCards()`: computes Total Kunjungan, Total Outlet, Total Penjualan, Rata-rata from filtered rows
    - Hook into DataTables `draw` event to recalculate stats after every filter/search
    - Handle zero results (display "0", "0 outlet", "Rp 0", "Rp 0")
    - Update stat cards on reset to reflect full dataset
    - _Requirements: 7.1, 7.2, 7.3, 6.3_

- [x] 4. Checkpoint - Ensure filtering works end-to-end
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement bulk route assignment on Management Rute page
  - [x] 5.1 Add checkbox column and Select All to weekly table
    - Add checkbox `<th>` as first column in weekly table header with `#selectAllWeekly`
    - Add checkbox `<td>` as first cell in each employee row (generated dynamically)
    - Implement `toggleEmployeeSelection()` to add/remove from `selectedEmployees` Set
    - Implement `updateSelectAllState()` for checked/unchecked/indeterminate states
    - _Requirements: 8.1, 8.2, 8.6_

  - [x] 5.2 Implement bulk assign toolbar UI and visibility logic
    - Add `#bulkAssignToolbar` fixed-position HTML with count, route dropdown, Assign/Batal buttons
    - Add CSS for `.bulk-assign-toolbar` (fixed bottom, shadow, transition)
    - `showBulkToolbar()`: display toolbar with selected count
    - `hideBulkToolbar()`: hide with 200ms transition
    - Show/hide based on `selectedEmployees.size > 0`
    - Update count to reflect only selected AND visible employees
    - _Requirements: 8.3, 8.4, 8.5_

  - [x] 5.3 Implement bulk assign execution and persistence
    - `populateBulkRouteDropdown()`: reads routes from `localStorage.getItem('fprs_route_planning_list')`
    - Disable dropdown with placeholder if no routes exist
    - `applyBulkAssignment(routeId)`: sets "Rute Mingguan" for all selected employees in active tab
    - Persist to localStorage under active week tab key
    - Show SweetAlert2 success toast with count (e.g., "3 pegawai diperbarui")
    - Show SweetAlert2 error toast if no route selected on Assign click
    - Deselect all checkboxes and hide toolbar after successful assignment
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7_

  - [x] 5.4 Implement week tab scope constraint
    - Ensure bulk assignment only modifies localStorage for active week tab
    - On week tab switch: clear `selectedEmployees`, uncheck all checkboxes, hide toolbar
    - Verify other week tabs' data is unchanged after assignment
    - _Requirements: 10.1, 10.2, 10.3_

- [x] 6. Checkpoint - Ensure bulk assignment works
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Set up test infrastructure and write property-based tests
  - [x] 7.1 Set up fast-check test infrastructure
    - Create test HTML file at `Views/FPRS/Kunjungan/tests.html` (or similar)
    - Include fast-check via CDN
    - Set up test runner structure for browser-based PBT execution
    - Configure minimum 100 iterations per property
    - _Requirements: 14.1_

  - [x] 7.2 Write property tests for filter option extraction (Property 1)
    - **Property 1: Filter option extraction produces sorted unique values**
    - Test that extracting area/divisi values from any array produces sorted, deduplicated list
    - **Validates: Requirements 2.1, 3.1**

  - [x] 7.3 Write property tests for area filter predicate (Property 2)
    - **Property 2: Area filter predicate correctness**
    - Test that filtered results contain only rows matching selected area
    - **Validates: Requirements 2.2**

  - [x] 7.4 Write property tests for divisi filter predicate (Property 3)
    - **Property 3: Divisi filter predicate correctness**
    - Test that filtered results contain only rows with matching division
    - **Validates: Requirements 3.2**

  - [x] 7.5 Write property tests for status filter predicate (Property 4)
    - **Property 4: Status filter predicate correctness**
    - Test "Sudah" returns only non-empty endTime, "Belum" returns only empty endTime
    - **Validates: Requirements 4.2, 4.3**

  - [x] 7.6 Write property tests for date range filter predicate (Property 5)
    - **Property 5: Date range filter predicate correctness**
    - Test that results are within inclusive bounds for any valid date range
    - **Validates: Requirements 5.2**

  - [x] 7.7 Write property tests for date range validation (Property 6)
    - **Property 6: Date range validation rejects invalid input**
    - Test start > end returns invalid; single date returns invalid
    - **Validates: Requirements 5.3, 5.5**

  - [x] 7.8 Write property tests for filter AND composition (Property 7)
    - **Property 7: Filter AND composition**
    - Test that any combination of filters produces results satisfying ALL predicates
    - **Validates: Requirements 4.5, 2.3, 3.3, 4.4, 5.4**

  - [x] 7.9 Write property tests for filter reset (Property 8)
    - **Property 8: Filter reset restores full unfiltered state**
    - Test that reset from any filter state returns full dataset
    - **Validates: Requirements 6.1, 6.2, 6.3, 7.2**

  - [x] 7.10 Write property tests for stat card computation (Property 9)
    - **Property 9: Stat card computation correctness**
    - Test count, sum of visited, sum of invoice, and average calculation
    - **Validates: Requirements 7.1, 7.3**

  - [x] 7.11 Write property tests for Select All toggle (Property 10)
    - **Property 10: Select All toggles all visible employee rows**
    - Test that checking Select All checks all visible, unchecking unchecks all
    - **Validates: Requirements 8.2**

  - [x] 7.12 Write property tests for bulk toolbar count (Property 11)
    - **Property 11: Bulk toolbar count reflects visible selected employees**
    - Test count equals number of employees both checked AND visible
    - **Validates: Requirements 8.3, 8.5**

  - [x] 7.13 Write property tests for bulk assignment application (Property 12)
    - **Property 12: Bulk assignment applies chosen route to all selected employees**
    - Test all selected employees get the route, persistence occurs, toast shows correct count
    - **Validates: Requirements 9.2, 9.3, 9.4**

  - [x] 7.14 Write property tests for bulk assign scope (Property 13)
    - **Property 13: Bulk assignment is scoped to active week tab only**
    - Test that other week tabs' data is unchanged after assignment
    - **Validates: Requirements 10.1, 10.2, 10.3**

  - [x] 7.15 Write property tests for skeleton consistency (Property 14)
    - **Property 14: Skeleton elements have consistent styling and accessibility attributes**
    - Test skeleton elements have correct background, animation, aria-label, role across pages
    - **Validates: Requirements 14.1, 14.3, 14.4, 14.5**

- [x] 8. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties using fast-check (min 100 iterations)
- Unit tests validate specific examples and edge cases
- All implementation is vanilla JavaScript/jQuery in static HTML — no build tools or bundlers
- The `@keyframes shimmer` CSS is duplicated per page (no shared CSS file exists)
- Filter logic uses `$.fn.dataTable.ext.search` custom function for structured AND predicates
- Bulk assignment persists to localStorage matching existing `fprs_weekly_assignments` pattern

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3"] },
    { "id": 1, "tasks": ["3.1", "5.1"] },
    { "id": 2, "tasks": ["3.2", "5.2"] },
    { "id": 3, "tasks": ["3.3", "3.4", "5.3"] },
    { "id": 4, "tasks": ["3.5", "5.4"] },
    { "id": 5, "tasks": ["3.6"] },
    { "id": 6, "tasks": ["7.1"] },
    { "id": 7, "tasks": ["7.2", "7.3", "7.4", "7.5", "7.6", "7.7", "7.8", "7.9", "7.10", "7.11", "7.12", "7.13", "7.14", "7.15"] }
  ]
}
```
