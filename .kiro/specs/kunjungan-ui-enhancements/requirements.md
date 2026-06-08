# Requirements Document

## Introduction

This feature covers three UI enhancements to the existing Kunjungan module in the Falcon FPRS prototype: enhanced filtering on the Informasi Kunjungan index page, bulk route assignment on the Management Rute page, and skeleton loading placeholders across both Informasi Kunjungan and Management Rute pages. The prototype is a static HTML application using Bootstrap 5, jQuery, DataTables, MapLibre GL JS, and SweetAlert2 with data loaded from local JSON files.

## Glossary

- **Filter_Panel**: The collapsible UI panel on the Informasi Kunjungan index page containing filter controls for narrowing displayed visit data
- **Informasi_Page**: The Informasi Kunjungan index page (Views/FPRS/Kunjungan/Informasi/index.html) showing the daily visit list
- **Detail_Page**: The Informasi Kunjungan detail page (Views/FPRS/Kunjungan/Informasi/detail.html) showing individual visit details
- **Rute_Page**: The Management Rute page (Views/FPRS/Kunjungan/Rute/index.html) containing route planning and weekly assignment
- **Weekly_Table**: Section 2 "Kelola Kunjungan Mingguan" on the Rute_Page displaying the weekly route assignment grid
- **Bulk_Assign_Toolbar**: The floating action bar that appears when employees are selected via checkbox for bulk route assignment
- **Skeleton_Placeholder**: An animated shimmer/pulse placeholder element that mimics the shape of real content while data is being fetched
- **DataTable**: The jQuery DataTables plugin instance used for paginated, sortable tables
- **Stat_Card**: A summary statistic card displayed above the visit table on the Informasi_Page
- **Metric_Cell**: An individual metric box within the detail page's metrics grid

## Requirements

### Requirement 1: Filter Panel Toggle

**User Story:** As a supervisor, I want to toggle the filter panel via a button, so that I can show or hide advanced filters without cluttering the page.

#### Acceptance Criteria

1. WHEN the page loads, THE Filter_Panel SHALL be hidden by default
2. WHEN the user clicks the Filter button on the Informasi_Page, THE Filter_Panel SHALL toggle between visible and hidden states using a vertical slide animation completing within 300ms
3. WHILE the Filter_Panel is visible, THE Filter_Panel SHALL display all filter controls arranged in a responsive grid layout with a maximum of 3 columns on viewports 768px and wider, and a single column on viewports below 768px
4. WHEN the Filter_Panel is hidden and then shown again within the same page session, THE Filter_Panel SHALL retain all previously entered filter values including text inputs and dropdown selections

### Requirement 2: Area/Region Filter

**User Story:** As a supervisor, I want to filter visits by Area/Region, so that I can focus on salesman activity within a specific geographic area.

#### Acceptance Criteria

1. THE Filter_Panel SHALL display an Area/Region dropdown with a default placeholder option indicating no selection, followed by distinct area values extracted from the loaded JSON data and sorted in ascending alphabetical order
2. WHEN the user selects an Area/Region value and clicks "Terapkan", THE DataTable SHALL display only visit rows whose area value exactly matches the selected Area/Region, applying the filter in combination with any other active filters
3. WHEN no Area/Region value is selected (placeholder option is active) and the user clicks "Terapkan", THE DataTable SHALL not apply area filtering and SHALL display visits from all areas
4. IF the loaded JSON data contains no area values, THEN THE Filter_Panel SHALL display the Area/Region dropdown with only the default placeholder option and no selectable area entries

### Requirement 3: Divisi Filter

**User Story:** As a supervisor, I want to filter visits by Divisi, so that I can isolate visit data for a specific product division.

#### Acceptance Criteria

1. THE Filter_Panel SHALL display a Divisi dropdown with a default placeholder option "Semua Divisi" (value empty) followed by distinct division values sourced from the loaded JSON data, sorted alphabetically
2. WHEN the user selects a Divisi value and clicks "Terapkan", THE DataTable SHALL display only visit rows whose associated salesman belongs to the selected division
3. WHEN the Divisi dropdown is set to the default "Semua Divisi" option and the user clicks "Terapkan", THE DataTable SHALL display visits from all divisions including visits by salesmen with no assigned division
4. IF the loaded JSON data contains no division values, THEN THE Filter_Panel SHALL display the Divisi dropdown with only the "Semua Divisi" placeholder option and the dropdown SHALL remain functional

### Requirement 4: Status Kunjungan Filter

**User Story:** As a supervisor, I want to filter visits by check-out status (Sudah/Belum Check-out), so that I can identify salesmen who have not completed their visits.

#### Acceptance Criteria

1. THE Filter_Panel SHALL display a Status Kunjungan dropdown with options: "Semua", "Sudah Check-out", and "Belum Check-out", with "Semua" selected by default
2. WHEN the user selects "Sudah Check-out" and clicks "Terapkan", THE DataTable SHALL display only visit rows where the end time field contains a non-empty time value
3. WHEN the user selects "Belum Check-out" and clicks "Terapkan", THE DataTable SHALL display only visit rows where the end time field is empty or null
4. WHEN the user selects "Semua" and clicks "Terapkan", THE DataTable SHALL display visits regardless of check-out status
5. WHEN the Status Kunjungan filter is applied together with other active filters (Area/Region, Divisi, Nama Salesman, Bulan/Tahun, Date Range), THE DataTable SHALL display only rows satisfying all active filter conditions simultaneously

### Requirement 5: Date Range Filter

**User Story:** As a supervisor, I want to filter visits by a custom date range, so that I can analyze visit activity over a specific period instead of only by month.

#### Acceptance Criteria

1. THE Filter_Panel SHALL display a date range picker with "Dari" (start date) and "Sampai" (end date) input fields of type date
2. WHEN the user specifies both start and end dates and clicks "Terapkan", THE DataTable SHALL display only visit rows with dates within the specified range (inclusive of both start and end dates)
3. IF the user specifies a start date that is after the end date, THEN THE Filter_Panel SHALL display an inline validation error message below the date fields and prevent the filter from being applied, leaving the DataTable unchanged
4. WHEN the user clears both date range fields and clicks "Terapkan", THE DataTable SHALL not apply date range filtering
5. IF the user specifies only one of the two date fields (start date without end date, or end date without start date) and clicks "Terapkan", THEN THE Filter_Panel SHALL display an inline validation error message indicating both dates are required and prevent the filter from being applied

### Requirement 6: Filter Reset

**User Story:** As a supervisor, I want to reset all filters at once, so that I can quickly return to viewing all data without manually clearing each field.

#### Acceptance Criteria

1. WHEN the user clicks the "Reset" button, THE Filter_Panel SHALL clear all filter inputs (Nama Salesman, Bulan/Tahun, Area/Region, Divisi, Status Kunjungan, Dari, Sampai) to their default empty state
2. WHEN the user clicks the "Reset" button, THE DataTable SHALL redraw showing all records without any filter applied
3. WHEN the user clicks the "Reset" button, THE Stat_Card values SHALL recalculate to reflect the unfiltered dataset

### Requirement 7: Stat Cards Update on Filter

**User Story:** As a supervisor, I want the summary stat cards to reflect filtered data, so that I can see accurate aggregations for the currently visible subset.

#### Acceptance Criteria

1. WHEN the user clicks "Terapkan" or triggers any filter (including the search input), THE Stat_Card values SHALL recalculate within 1 second using only the currently filtered rows: Total Kunjungan as the count of visible rows, Total Outlet Dikunjungi as the sum of visited outlet counts from visible rows, Total Penjualan as the sum of invoice amounts from visible rows, and Rata-rata / Kunjungan as Total Penjualan divided by Total Kunjungan
2. WHEN filters are reset, THE Stat_Card values SHALL recalculate based on the full unfiltered dataset using the same formulas defined in criterion 1
3. IF the applied filters result in zero matching rows, THEN THE Stat_Card values SHALL display "0" for Total Kunjungan, "0 outlet" for Total Outlet Dikunjungi, "Rp 0" for Total Penjualan, and "Rp 0" for Rata-rata / Kunjungan

### Requirement 8: Bulk Assign Employee Selection

**User Story:** As a route planner, I want to select multiple employees in the weekly table via checkboxes, so that I can assign a route to multiple people at once.

#### Acceptance Criteria

1. THE Weekly_Table SHALL display a checkbox column as the first column in each employee row, preceding the "Pegawai" column
2. THE Weekly_Table header SHALL display a "Select All" checkbox that toggles selection of all currently visible (non-filtered, non-hidden) employee rows in the active week tab
3. WHEN the user checks one or more employee checkboxes, THE Bulk_Assign_Toolbar SHALL appear as a fixed-position bar displaying the count of selected employees as a numeric value (e.g., "3 pegawai dipilih")
4. WHEN the user unchecks all employee checkboxes, THE Bulk_Assign_Toolbar SHALL hide within 200ms
5. WHEN the user filters employee rows via the search input or the active/inactive toggle, THE Weekly_Table SHALL preserve the checked state of previously selected rows that are still visible, and the Bulk_Assign_Toolbar count SHALL update to reflect only the currently selected and visible employees
6. IF all visible rows are selected and the user applies a filter that reveals additional unselected rows, THEN THE "Select All" checkbox SHALL display an indeterminate state

### Requirement 9: Bulk Assign Route Application

**User Story:** As a route planner, I want to assign a single route to all selected employees at once, so that I can save time when multiple salesmen share the same weekly route.

#### Acceptance Criteria

1. THE Bulk_Assign_Toolbar SHALL display a route dropdown populated with all daily routes stored in the localStorage route list, showing each route's name as the option label
2. WHEN the user selects a route from the dropdown and clicks "Assign" while one or more employees are selected, THE Weekly_Table SHALL set the "Rute Mingguan" dropdown value for all selected employees to the chosen route
3. WHEN the bulk assignment is applied, THE Weekly_Table SHALL persist the updated route assignments to localStorage under the active week tab's assignment data within 1 second
4. WHEN the bulk assignment is applied, THE Bulk_Assign_Toolbar SHALL display a SweetAlert2 toast success notification indicating the number of employees updated (e.g., "3 pegawai diperbarui")
5. WHEN the bulk assignment is applied, THE Weekly_Table SHALL deselect all employee checkboxes and hide the Bulk_Assign_Toolbar
6. IF the user clicks "Assign" without selecting a route from the dropdown, THEN THE Bulk_Assign_Toolbar SHALL display a validation error via SweetAlert2 toast and SHALL NOT modify any employee route assignments
7. IF the localStorage route list is empty, THEN THE Bulk_Assign_Toolbar SHALL display the route dropdown in a disabled state with a placeholder indicating no routes are available

### Requirement 10: Bulk Assign Scope Constraint

**User Story:** As a route planner, I want bulk assignment to apply only to the active week tab, so that I do not accidentally overwrite assignments in other weeks.

#### Acceptance Criteria

1. THE Bulk_Assign_Toolbar SHALL apply route assignments only to employee rows belonging to the currently active week tab (Minggu 1, 2, 3, or 4), including rows that are selected but temporarily hidden by the employee search filter
2. WHEN the user switches week tabs, THE Weekly_Table SHALL deselect all employee checkboxes (including the "Select All" header checkbox) and hide the Bulk_Assign_Toolbar
3. WHEN bulk assignment is applied, THE Weekly_Table SHALL persist the updated route values only to the localStorage key corresponding to the active week tab, leaving data for other weeks unchanged

### Requirement 11: Skeleton Loading on Informasi Index Page

**User Story:** As a user, I want to see animated placeholder content while visit data loads, so that the page does not appear blank during data fetching.

#### Acceptance Criteria

1. WHILE JSON data is being fetched on the Informasi_Page, THE Informasi_Page SHALL display skeleton placeholders in place of Stat_Card elements using the same 4-column grid layout and occupying the same height as the rendered Stat_Card elements (4 skeleton cards)
2. WHILE JSON data is being fetched on the Informasi_Page, THE Informasi_Page SHALL display 5 skeleton table rows with 8 columns matching the column widths of the visit table (No, Tanggal, Nama, Visited, Waktu Mulai, Waktu Akhir, Total Penjualan, action)
3. WHEN JSON data loading completes, THE Informasi_Page SHALL replace all skeleton placeholders with the actual rendered content with no visible blank or intermediate state between skeleton removal and content display
4. THE Skeleton_Placeholder elements SHALL render a CSS shimmer animation (left-to-right gradient sweep) that repeats every 1.5 seconds
5. IF JSON data fetching fails, THEN THE Informasi_Page SHALL remove all skeleton placeholders and display an error message indicating that visit data could not be loaded

### Requirement 12: Skeleton Loading on Informasi Detail Page

**User Story:** As a user, I want to see animated placeholders on the detail page while data loads, so that the layout structure is visible immediately.

#### Acceptance Criteria

1. WHILE JSON data is being fetched on the Detail_Page, THE Detail_Page SHALL display a skeleton placeholder in place of the Informasi Kunjungan info card occupying the same grid column (col-md-3) and minimum height as the rendered card to prevent layout shift
2. WHILE JSON data is being fetched on the Detail_Page, THE Detail_Page SHALL display skeleton placeholders for all 10 Metric_Cell elements arranged in the same 2-column grid layout as the actual metrics
3. WHILE JSON data is being fetched on the Detail_Page, THE Detail_Page SHALL display skeleton table rows (minimum 3 rows) for the Daftar Kunjungan table matching the 11-column header layout
4. WHEN JSON data loading completes, THE Detail_Page SHALL replace all skeleton placeholders with the actual rendered content within a single repaint cycle
5. IF JSON data fails to load within 10 seconds, THEN THE Detail_Page SHALL remove the skeleton placeholders and display an error message indicating the data could not be loaded

### Requirement 13: Skeleton Loading on Management Rute Page

**User Story:** As a user, I want to see animated placeholders on the route management page while data loads, so that the three-panel layout and weekly table areas show their intended shapes.

#### Acceptance Criteria

1. WHILE JSON data is being fetched on the Rute_Page, THE Rute_Page SHALL display skeleton card placeholders (minimum 3 items, each matching the height and border-radius of a route-item-card) in the "Kelola Rute Harian" panel
2. WHILE JSON data is being fetched on the Rute_Page, THE Rute_Page SHALL display skeleton card placeholders (minimum 3 items, each matching the height and border-radius of a customer-item-card) in the "Cari Pelanggan" panel
3. WHILE JSON data is being fetched on the Rute_Page, THE Rute_Page SHALL display skeleton table rows (minimum 3 rows spanning all 10 columns of the Weekly_Table header) in the Weekly_Table area
4. WHEN JSON data loading completes successfully, THE Rute_Page SHALL replace all skeleton placeholders with the actual rendered content within a single repaint cycle
5. IF JSON data fetching fails or does not complete within 10 seconds, THEN THE Rute_Page SHALL remove the skeleton placeholders and display an inline error message indicating the data could not be loaded, with a retry action

### Requirement 14: Skeleton Animation Consistency

**User Story:** As a designer, I want the skeleton animations to follow a consistent visual style across all pages, so that the loading experience feels cohesive.

#### Acceptance Criteria

1. THE Skeleton_Placeholder elements SHALL use a background color of #e9ecef with a shimmer gradient of #f8f9fa, applied uniformly across the Informasi_Page, Detail_Page, and Rute_Page
2. THE Skeleton_Placeholder elements SHALL use a border-radius of 10px for Stat_Card placeholders, 4px for table row placeholders, and 8px for Metric_Cell placeholders, matching the border-radius of their corresponding real content elements
3. THE Skeleton_Placeholder elements SHALL have no interactive affordances (no hover effects, no pointer cursor, no focus state)
4. THE Skeleton_Placeholder elements SHALL use a left-to-right linear gradient sweep animation with a duration of 1.5 seconds, an ease-in-out timing function, and infinite repetition, applied identically on all pages
5. THE Skeleton_Placeholder elements SHALL include an aria-label attribute with value "Loading" and role="status" to communicate the loading state to assistive technologies
