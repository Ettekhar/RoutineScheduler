# University Class Routine Scheduling System - Design Guidelines

## Design Approach: Material Design System

**Justification**: This is a data-intensive productivity application requiring clarity, efficiency, and familiar patterns. Material Design provides excellent guidelines for complex data visualization, form-heavy interfaces, and grid-based layouts - perfect for academic scheduling systems.

**Key Principles**:
- Information density with breathing room
- Clear visual hierarchy for quick scanning
- Familiar patterns for intuitive navigation
- Consistent interaction feedback

## Typography System

**Font Stack**: Inter (primary), Roboto (fallback), system-ui

**Hierarchy**:
- Page Titles: text-3xl font-semibold (Dashboard, Schedule View)
- Section Headers: text-2xl font-semibold (Admin Panels, Filters)
- Subsection Headers: text-xl font-medium (Table headers, Card titles)
- Body Text: text-base font-normal (Forms, descriptions)
- Small Text: text-sm (Helper text, metadata)
- Tiny Text: text-xs (Timestamps, tooltips)
- Calendar Events: text-sm font-medium (Class names), text-xs (Room/Teacher details)

## Layout System

**Spacing Primitives**: Use Tailwind units of 2, 3, 4, 6, 8, 12, 16
- Component padding: p-4 to p-6
- Section spacing: mb-8, mt-12
- Grid gaps: gap-4 to gap-6
- Card spacing: p-6
- Form field spacing: space-y-4

**Container Strategy**:
- Dashboard: max-w-screen-2xl mx-auto px-6
- Admin panels: max-w-6xl mx-auto px-4
- Calendar view: w-full (full width for schedule grid)
- Modals/Dialogs: max-w-2xl

## Component Library

### Navigation
- Top navbar with logo, main navigation links (Dashboard, Schedule, Admin, Export)
- Breadcrumb navigation for admin sections
- Fixed position header with shadow on scroll

### Admin Panel Components
**Data Tables**: 
- Striped rows for readability
- Sortable column headers with arrows
- Inline edit icons
- Action buttons (Edit/Delete) aligned right
- Pagination at bottom

**Forms**:
- Grouped inputs with clear labels above fields
- Validation messages below fields
- Required field indicators (asterisk)
- Submit/Cancel buttons bottom right
- Multi-step forms with progress indicator

**Input Patterns**:
- Text fields: h-10 with border
- Dropdowns: Custom styled selects with chevron
- Number inputs: With increment/decrement buttons
- Multi-select: Checkbox groups or tag-based selection
- Time pickers: Custom dropdown with time slots

### Schedule Visualization (Core Component)

**Weekly Grid Structure**:
- Left sidebar: Day names (Sun-Thu) in vertical cells, width: w-20
- Header row: Time slots across top (8 AM - 6 PM or configurable), each slot width: min-w-24
- Grid cells: Border-separated time blocks
- Class blocks: Rounded rectangles (rounded-lg) spanning appropriate time slots
- Hover state: Elevation shadow with tooltip overlay

**Class Block Design**:
- Course code: Font-semibold at top
- Teacher name: Text-sm below
- Room number: Text-xs with icon
- Batch info: Text-xs
- Visual density: Compact but readable with p-2 internal padding

**Conflict Visualization**:
- Diagonal stripe pattern overlay
- Bold border treatment
- Conflict icon in corner
- Tooltip explaining conflict type

### Filter Panel
**Left Sidebar Design** (280px width):
- Collapsible sections (Teacher, Semester, Course, etc.)
- Checkbox groups with search
- Active filter badges at top
- Clear all filters button
- Sticky positioning

### Modal Dialogs
- Edit class modal: Form-based with real-time conflict checking
- Confirmation dialogs: Clear actions, warning states
- Export options: Format selection with preview

### Buttons & Actions
- Primary: Filled style for main actions (Generate Schedule, Save)
- Secondary: Outlined style (Cancel, Edit)
- Tertiary: Text-only for minor actions
- Icon buttons: 40x40px for table actions
- FAB: Floating action button for quick add (bottom right)

### Cards & Panels
- Dashboard stat cards: 3-4 column grid, shadow-sm, p-6
- Info panels: Bordered cards with headers
- Collapsible sections: Chevron indicator, smooth transitions

## Schedule Calendar Specifics

**Grid Construction**:
- CSS Grid for time-slot layout
- Sticky day header column
- Sticky time header row
- Scrollable main content area
- Grid lines: 1px borders between cells

**Responsive Behavior**:
- Desktop (lg:): Full weekly view
- Tablet (md:): Scrollable horizontal grid
- Mobile: Single-day view with day selector dropdown

**Interactive Elements**:
- Click class block: Open edit modal
- Drag class block: Move to new time (with conflict preview)
- Hover: Tooltip with full details
- Right-click: Context menu (Edit, Delete, Duplicate)

## Accessibility
- Keyboard navigation: Tab through schedule grid, arrow keys to move
- Screen reader: Proper ARIA labels for all interactive elements
- Focus indicators: Clear visible outlines
- Contrast: All text meets WCAG AA standards
- Calendar announcements: Screen reader feedback for time/class selection

## Export Views
**PDF Layout**:
- Clean table format with minimal borders
- Teacher schedule: Single-page landscape
- Semester schedule: Portrait with full week grid
- Maintain color coding via background fills
- Print-friendly fonts and spacing