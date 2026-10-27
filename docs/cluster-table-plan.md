# Cluster table implementation plan

## Scope

Add `@redhat-cloud-services/nxtcm-cluster-table`, a generic client-side grid engine with a PatternFly v6 table. Consumers supply data and stable row IDs; the package never requests backend data.

The first release supports inferred columns, optional explicit column definitions, typed sorting, global and per-column text filtering, column visibility and ordering, drag reordering with a keyboard alternative, pagination, controlled state, and loading/error/empty states. It does not attempt AG Grid API compatibility. Virtualization, editing, grouping, selection, resizing, and server-side row models are future increments.

## Increments

1. **Workspace and contract** — package manifest, exports, TypeScript/build/Storybook/CT integration, package guidance and usage documentation.
2. **Engine** — infer the union of top-level keys across all supplied rows, humanize headers, support typed accessors for nested/domain-specific data, and derive filtered/sorted/paginated rows without mutating input. Keep sorting/filtering independent from React and PatternFly.
3. **PatternFly view** — sortable table, search and column filters, column management with drag and keyboard reordering, pagination, explicit loading/error/empty states, optional controlled state and change notifications.
4. **Examples and verification** — heterogeneous ROSA/ACM/OpenShift mock data, inferred and customized columns, large data set, controlled state and state stories; engine unit tests and interaction/accessibility CT; full build/lint/unit/CT/E2E and Storybook validation.
5. **Browser persistence** — opt-in local storage by default, with a session storage option and explicit table key. Save search, column filters, column order and visibility; validate/version stored preferences, handle unavailable storage, preserve controlled ownership, and provide persistence stories and regression coverage.
6. **Draggable header variant** — opt-in `hasDraggableHeaders` adds pointer and keyboard handles to column headers while retaining drag reordering in Manage columns. Both update the same state and persistence. Keep sorting/filter controls separate, cancel outside drops or Escape, and reset drag state safely when available columns change. Add a Storybook variant and regression coverage.

## Contract decisions

- `ClusterTable<T extends object>` accepts any cluster shape; `getRowId` is required and must return a stable unique ID.
- Inference uses first-seen top-level field order across the entire data set, including fields found only on later rows. Missing values display an em dash. Nested values can be displayed as JSON or projected through explicit column accessors.
- Explicit columns replace inference, allowing host apps to choose safe fields, localized headers, custom cells, comparators and filter text.
- Global search is OR across filterable columns; individual column filters are AND. Each header exposes its filter in a popover, with an active indicator. Hidden columns remain searchable and filtered; the toolbar can clear all filters, including those on hidden columns.
- Sort raw numbers, booleans and dates by type, strings naturally, keep missing values last in either direction, and preserve input order for equal values.
- State uses column IDs so sorting/filtering survive reordering. Unknown IDs are ignored when a schema changes. Filtering and page-size changes reset to page one; data changes clamp the effective page.
- All operations run on the rows supplied by the host. This is client-side pagination, not a backend pagination protocol.
- Built-in persistence restores uncontrolled preferences only. Local storage is the user-selected default; session storage is optional. Only search, filters, column order and hidden IDs are stored under a table-specific key. Server hydration starts with initial state, and storage failures leave the in-memory table usable. Reading/rendering never writes preferences; different keys and storage areas remain isolated. Controlled consumers retain ownership of persistence.
- PatternFly's drag wrapper supports lists rather than table headers. The header variant uses the same installed dnd-kit engine through its public API, with PatternFly table cells, buttons, icons and an overlay label. The sole custom style is `touchAction: 'none'` on the drag handle, required by the pointer sensor; no PatternFly internal markup or classes are used. Headers and body cells stay aligned until a completed drop commits the order.

## Validation record

- Implementation for all four increments is in place, including workspace/build/release configuration and React compatibility consumer coverage. Verification remains partial as noted below.
- Updated toolbar per review: search, column filters, and column management controls share one row; detached PatternFly panels open below it. Column management uses a compact draggable data list with checkbox/label beside the handle; the extra move buttons were removed. Keyboard reordering uses Space and arrow keys on the handle.
- Passed: workspace build, workspace lint (zero errors), TypeScript, initial engine tests (12), initial component tests (11, including pointer drag and accessibility), and static Storybook build.
- After the toolbar and column-list adjustments: workspace build, lint (zero errors/warnings), TypeScript, 131 focused engine/Storybook contract tests, Storybook build/public index assertion, peer consistency, and formatting checks passed. Component tests were updated for the handle keyboard interaction but have not been rerun after execution approval was declined.
- Browser execution requests for the full suite and the focused toolbar rerun were declined. `npm run test:all:quiet` and `npm run test:e2e` are still required before treating validation as complete. The 11 passing CT checks predate the toolbar adjustment.
- Live Storybook visual inspection of all four themes was not completed: browser access was unavailable/not approved. Static Storybook compilation passed.
- Follow-up fixes: column headings use PatternFly no-wrap behavior inside a keyboard-focusable horizontal scroll region. Drag IDs are stable per column, and the drag context resets when the schema changes to prevent stale overlay lookups. Added a regression CT case for removing a column during a drag.
- Latest follow-up validation: package build, root TypeScript, package lint, formatting, and diff checks pass. The new drag regression and final browser layout remain unverified because browser execution was declined.
- Header-filter refinement: moved filters from the detached toolbar panel to PatternFly popovers beside each column heading. Sorting and filtering use separate buttons, active filters are highlighted, and the popup supports keyboard focus, Escape, and individual clearing. Updated CT coverage for combined filters, no-match recovery, controlled state, pagination reset, focus return, and popover accessibility. Browser execution remains unverified.
- Header-filter checks passed: workspace build, workspace lint, root TypeScript, 131 engine/Storybook contract tests, Storybook build/public index assertion, peer consistency, formatting, and diff checks. The updated CT and full E2E suite remain pending because browser execution was previously declined.
- Persistence checks passed: workspace build, workspace lint, root TypeScript, 158 focused engine/persistence/Storybook tests, Storybook build/public index assertion (205 entries), formatting, and diff checks. Added local/session persistence examples and browser regression coverage; CT and E2E execution remain pending under the earlier browser-execution decline.
- Header-drag checks passed: workspace build, workspace lint, root TypeScript, 158 unit/contract tests, Storybook build, peer consistency, formatting and diff checks. Added pointer/keyboard/cancel/schema-change CT, independent sort/filter accessibility coverage, and persisted order shared with Manage columns. Browser drag, CT and E2E execution remain unverified under the earlier browser-execution decline.
- Header-ref crash fix: reproduced PatternFly's `offsetWidth` failure using its real `Th` in jsdom. The header now supplies an object ref to PatternFly and registers the same cell with dnd-kit in a layout effect. Regression tests cover StrictMode mount/update/remount with dragging enabled and disabled, plus keyboard drag activation. Workspace build, lint, root TypeScript, 161 focused tests, Storybook build/public index assertion, formatting and diff checks pass. Browser CT/E2E remain pending under the earlier execution decline.
- No commit, publication, or release was performed.
