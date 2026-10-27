import { jsx as t, jsxs as x } from "react/jsx-runtime";
import { useId as U, useRef as ce, useLayoutEffect as me, useState as F, useMemo as V, useSyncExternalStore as pe } from "react";
import { Alert as he, AlertVariant as ue } from "@patternfly/react-core/dist/esm/components/Alert/index.js";
import { Button as E, ButtonVariant as A } from "@patternfly/react-core/dist/esm/components/Button/index.js";
import { Checkbox as fe } from "@patternfly/react-core/dist/esm/components/Checkbox/index.js";
import { DataList as ge, DataListItemCells as be, DataListCell as Ce } from "@patternfly/react-core/dist/esm/components/DataList/index.js";
import { EmptyState as z, EmptyStateVariant as J, EmptyStateBody as ye } from "@patternfly/react-core/dist/esm/components/EmptyState/index.js";
import { ExpandableSectionToggle as Se, ExpandableSection as ve } from "@patternfly/react-core/dist/esm/components/ExpandableSection/index.js";
import { Pagination as Ie, PaginationVariant as $e } from "@patternfly/react-core/dist/esm/components/Pagination/index.js";
import { SearchInput as Y } from "@patternfly/react-core/dist/esm/components/SearchInput/index.js";
import { Spinner as we } from "@patternfly/react-core/dist/esm/components/Spinner/index.js";
import { Toolbar as xe, ToolbarContent as Oe, ToolbarItem as k } from "@patternfly/react-core/dist/esm/components/Toolbar/index.js";
import { Stack as K, StackItem as T } from "@patternfly/react-core/dist/esm/layouts/Stack/index.js";
import { DragDropSort as De } from "@patternfly/react-drag-drop";
import { Th as Te, InnerScrollContainer as Pe, Table as Ae, TableGridBreakpoint as Ne, TableVariant as Le, Thead as Me, Tr as B, Tbody as ke, Td as W } from "@patternfly/react-table/dist/esm/components/Table/index.js";
import { useSensors as Ee, useSensor as Z, PointerSensor as Fe, KeyboardSensor as je, DndContext as Re, DragOverlay as Be, pointerWithin as Ge, closestCenter as Ve } from "@dnd-kit/core";
import { useSortable as Ue, sortableKeyboardCoordinates as _e, SortableContext as ze, horizontalListSortingStrategy as Je } from "@dnd-kit/sortable";
import { Label as Ke } from "@patternfly/react-core/dist/esm/components/Label/index.js";
import q from "@patternfly/react-icons/dist/esm/icons/grip-vertical-icon.js";
import { Form as We, FormGroup as Ze } from "@patternfly/react-core/dist/esm/components/Form/index.js";
import { Popover as He, PopoverPosition as Qe } from "@patternfly/react-core/dist/esm/components/Popover/index.js";
import { Flex as Xe, FlexItem as G } from "@patternfly/react-core/dist/esm/layouts/Flex/index.js";
import Ye from "@patternfly/react-icons/dist/esm/icons/arrows-alt-v-icon.js";
import qe from "@patternfly/react-icons/dist/esm/icons/filter-icon.js";
import et from "@patternfly/react-icons/dist/esm/icons/long-arrow-alt-down-icon.js";
import tt from "@patternfly/react-icons/dist/esm/icons/long-arrow-alt-up-icon.js";
const rt = ({
  column: e,
  direction: n,
  filterValue: r,
  onSort: i,
  onFilter: a,
  isDraggable: c,
  dragId: b
}) => {
  const C = U(), y = `Filter ${e.header}${r ? " (active)" : ""}`, { attributes: l, listeners: p, setNodeRef: u, setActivatorNodeRef: f, isDragging: $, isOver: O } = Ue({ id: b, disabled: !c }), D = ce(null);
  return me(() => (u(D.current), () => u(null)), [u]), /* @__PURE__ */ t(
    Te,
    {
      ref: D,
      "aria-label": e.header,
      "aria-sort": n === "asc" ? "ascending" : n === "desc" ? "descending" : void 0,
      children: /* @__PURE__ */ x(
        Xe,
        {
          flexWrap: { default: "nowrap" },
          alignItems: { default: "alignItemsCenter" },
          columnGap: { default: "columnGapSm" },
          children: [
            c && /* @__PURE__ */ t(G, { children: /* @__PURE__ */ t(
              E,
              {
                ref: f,
                variant: A.plain,
                isClicked: $ || O,
                icon: /* @__PURE__ */ t(q, {}),
                ...l,
                ...p,
                "aria-label": `Move ${e.header} column`,
                title: `Move ${e.header} column`,
                style: { touchAction: "none" }
              }
            ) }),
            /* @__PURE__ */ t(G, { children: e.sortable === !1 ? e.header : (
              // Separate buttons keep the filter out of the sortable heading's button.
              /* @__PURE__ */ t(
                E,
                {
                  variant: A.plain,
                  hasNoPadding: !0,
                  "aria-label": `Sort by ${e.header}`,
                  iconPosition: "end",
                  icon: n === "asc" ? /* @__PURE__ */ t(tt, {}) : n === "desc" ? /* @__PURE__ */ t(et, {}) : /* @__PURE__ */ t(Ye, {}),
                  onClick: i,
                  children: e.header
                }
              )
            ) }),
            e.filterable !== !1 && /* @__PURE__ */ t(G, { children: /* @__PURE__ */ t(
              He,
              {
                headerContent: `Filter ${e.header}`,
                headerComponent: "h2",
                closeBtnAriaLabel: `Close ${e.header} filter`,
                position: Qe.bottomStart,
                withFocusTrap: !0,
                elementToFocus: `[id="${C}"]`,
                bodyContent: /* @__PURE__ */ t(We, { onSubmit: (s) => s.preventDefault(), children: /* @__PURE__ */ t(Ze, { label: e.header, fieldId: C, children: /* @__PURE__ */ t(
                  Y,
                  {
                    searchInputId: C,
                    "aria-label": `Filter ${e.header}`,
                    placeholder: "Contains…",
                    value: r,
                    resetButtonLabel: `Clear ${e.header} filter`,
                    onChange: (s, d) => a(d),
                    onClear: () => a("")
                  }
                ) }) }),
                children: /* @__PURE__ */ t(
                  E,
                  {
                    variant: r ? A.secondary : A.plain,
                    "aria-label": y,
                    "aria-haspopup": "dialog",
                    title: r ? `${y}: ${r}` : y,
                    icon: /* @__PURE__ */ t(qe, {})
                  }
                )
              }
            ) })
          ]
        }
      )
    }
  );
}, nt = (e) => e.pointerCoordinates ? Ge(e) : Ve(e), ot = ({
  columns: e,
  children: n,
  onMove: r
}) => {
  const i = U(), [a, c] = F(null), b = e.find((l) => l.id === a), C = Ee(
    Z(Fe, { activationConstraint: { distance: 8 } }),
    Z(je, { coordinateGetter: _e })
  ), y = (l) => e.find((p) => p.id === l)?.header ?? "Column";
  return /* @__PURE__ */ x(
    Re,
    {
      id: i,
      sensors: C,
      collisionDetection: nt,
      accessibility: {
        screenReaderInstructions: {
          draggable: "To move a column, press Space or Enter to pick it up, use the left and right arrow keys to choose its position, and press Space or Enter to drop. Press Escape to cancel."
        },
        announcements: {
          onDragStart: ({ active: l }) => `Picked up ${y(l.id)} column.`,
          onDragOver: ({ active: l, over: p }) => p ? `${y(l.id)} column over ${y(p.id)} column, position ${e.findIndex((u) => u.id === p.id) + 1} of ${e.length}.` : "Outside the column headers. Drop here to cancel.",
          onDragEnd: ({ active: l, over: p }) => p ? `${y(l.id)} column dropped at position ${e.findIndex((u) => u.id === p.id) + 1} of ${e.length}.` : "Column move cancelled.",
          onDragCancel: () => "Column move cancelled."
        }
      },
      onDragStart: ({ active: l }) => c(String(l.id)),
      onDragCancel: () => c(null),
      onDragEnd: ({ active: l, over: p }) => {
        c(null), p && l.id !== p.id && r(String(l.id), String(p.id));
      },
      children: [
        /* @__PURE__ */ t(
          ze,
          {
            items: e.map((l) => l.id),
            strategy: Je,
            children: n
          }
        ),
        /* @__PURE__ */ t(Be, { dropAnimation: null, children: b && /* @__PURE__ */ t(Ke, { icon: /* @__PURE__ */ t(q, {}), "aria-hidden": "true", children: b.header }) })
      ]
    }
  );
}, ee = (e = {}) => ({
  search: "",
  filters: {},
  sort: null,
  columnOrder: [],
  hiddenColumnIds: [],
  page: 1,
  perPage: 10,
  ...e
}), it = (e) => {
  const n = e.replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2").replace(/([a-z\d])([A-Z])/g, "$1 $2").replace(/[_-]+/g, " ").trim();
  return n ? n[0].toUpperCase() + n.slice(1) : e || "Column";
}, st = (e) => {
  const n = new Set(e.flatMap((r) => Object.keys(r)));
  return Array.from(n, (r) => ({
    id: r,
    header: it(r),
    accessor: (i) => Object.prototype.hasOwnProperty.call(i, r) ? Reflect.get(i, r) : void 0
  }));
}, j = (e) => {
  if (e == null) return "";
  if (e instanceof Date) return Number.isNaN(e.getTime()) ? "" : e.toISOString();
  if (typeof e == "string") return e;
  if (typeof e == "number") return Number.isFinite(e) ? String(e) : "";
  if (typeof e == "boolean" || typeof e == "bigint") return String(e);
  if (typeof e == "object")
    try {
      return JSON.stringify(e) ?? "";
    } catch {
      return "[Complex value]";
    }
  return "";
}, at = new Intl.Collator(void 0, { numeric: !0, sensitivity: "base" }), H = (e) => e == null || typeof e == "number" && !Number.isFinite(e) || e instanceof Date && Number.isNaN(e.getTime()), lt = (e, n) => typeof e == "number" && typeof n == "number" ? e - n : typeof e == "boolean" && typeof n == "boolean" ? Number(e) - Number(n) : e instanceof Date && n instanceof Date ? e.getTime() - n.getTime() : at.compare(j(e), j(n)), dt = (e, n, r) => {
  const i = [...e], a = i.indexOf(n), c = i.indexOf(r);
  return a < 0 || c < 0 || a === c || (i.splice(a, 1), i.splice(c, 0, n)), i;
}, Q = (e, n) => Number.isFinite(e) ? Math.max(1, Math.floor(e)) : n, ct = (e, n, r = ee()) => {
  const i = new Map(n.map((s) => [s.id, s]));
  if (i.size !== n.length) throw new Error("Cluster table column IDs must be unique.");
  const a = [.../* @__PURE__ */ new Set([...r.columnOrder, ...i.keys()])].filter(
    (s) => i.has(s)
  ), c = a.flatMap((s) => {
    const d = i.get(s);
    return d ? [d] : [];
  }), b = c.filter((s) => s.filterable !== !1), C = Object.fromEntries(
    b.flatMap((s) => {
      const d = Object.prototype.hasOwnProperty.call(r.filters, s.id) ? r.filters[s.id] : "";
      return d?.trim() ? [[s.id, d]] : [];
    })
  ), y = r.search.trim().toLocaleLowerCase(), l = (s, d) => (s.filterText?.(d) ?? j(s.accessor(d))).toLocaleLowerCase(), p = e.filter(
    (s) => (!y || b.some((d) => l(d, s).includes(y))) && b.every(
      (d) => !Object.prototype.hasOwnProperty.call(C, d.id) || l(d, s).includes(C[d.id].trim().toLocaleLowerCase())
    )
  ), u = r.sort ? i.get(r.sort.columnId) : void 0, f = u && u.sortable !== !1 ? r.sort : null;
  f && u && p.sort((s, d) => {
    const N = u.accessor(s), w = u.accessor(d), g = H(N), h = H(w);
    if (g || h) return Number(g) - Number(h);
    const L = u.compare?.(s, d) ?? lt(N, w);
    return f.direction === "asc" ? L : -L;
  });
  const $ = Q(r.perPage, 10), O = Math.min(
    Q(r.page, 1),
    Math.max(1, Math.ceil(p.length / $))
  ), D = [...new Set(r.hiddenColumnIds)].filter((s) => i.has(s));
  return {
    columns: c,
    visibleColumns: c.filter((s) => !D.includes(s.id)),
    rows: p.slice((O - 1) * $, O * $),
    filteredCount: p.length,
    state: {
      ...r,
      filters: C,
      sort: f,
      columnOrder: a,
      hiddenColumnIds: D,
      page: O,
      perPage: $
    }
  };
}, te = (e) => typeof e == "object" && e !== null && !Array.isArray(e), X = (e) => Array.isArray(e) && e.every((n) => typeof n == "string"), mt = (e) => te(e) && Object.values(e).every((n) => typeof n == "string"), re = ({ storage: e }) => {
  if (!(typeof window > "u"))
    return e === "session" ? window.sessionStorage : window.localStorage;
}, pt = (e) => {
  if (e.key.trim())
    try {
      const n = re(e)?.getItem(`nxtcm-cluster-table:${e.key}`);
      if (!n) return;
      const r = JSON.parse(n);
      return !te(r) || r.version !== 1 || typeof r.search != "string" || !mt(r.filters) || !X(r.columnOrder) || !X(r.hiddenColumnIds) ? void 0 : {
        search: r.search,
        filters: r.filters,
        columnOrder: r.columnOrder,
        hiddenColumnIds: r.hiddenColumnIds
      };
    } catch {
      return;
    }
}, ht = (e, { search: n, filters: r, columnOrder: i, hiddenColumnIds: a }) => {
  if (e.key.trim())
    try {
      re(e)?.setItem(
        `nxtcm-cluster-table:${e.key}`,
        JSON.stringify({ version: 1, search: n, filters: r, columnOrder: i, hiddenColumnIds: a })
      );
    } catch {
    }
}, ut = (e, n) => {
  let r;
  const i = /* @__PURE__ */ new Set();
  return {
    getSnapshot: () => {
      if (r === void 0) {
        const a = n ? pt(n) : void 0;
        r = a ? { ...e, ...a, page: 1 } : e;
      }
      return r;
    },
    // Hydration starts with the same initial state that was rendered on the server.
    getServerSnapshot: () => e,
    subscribe: (a) => (i.add(a), () => {
      i.delete(a);
    }),
    setState: (a) => {
      r = a, n && ht(n, a), i.forEach((c) => c());
    }
  };
}, ft = (e, n, r) => {
  const [i] = F(() => ee(e)), a = n === void 0 ? r?.key : void 0, c = r?.storage ?? "local", b = V(
    () => ut(i, a ? { key: a, storage: c } : void 0),
    [i, a, c]
  ), C = pe(
    b.subscribe,
    b.getSnapshot,
    b.getServerSnapshot
  );
  return [n ?? C, b.setState];
}, Ut = ({
  data: e,
  getRowId: n,
  columns: r,
  ariaLabel: i = "Clusters",
  initialState: a,
  state: c,
  onStateChange: b,
  persistence: C,
  isLoading: y = !1,
  error: l,
  isCompact: p = !1,
  hasDraggableHeaders: u = !1
}) => {
  const f = U(), [$, O] = ft(
    a,
    c,
    C
  ), [D, s] = F(""), [d, N] = F(!1), w = V(
    () => r ?? st(e),
    [r, e]
  ), g = V(
    () => ct(e, w, $),
    [e, w, $]
  ), h = g.state, L = new Map(w.map((o) => [o.id, o])), R = new Map(
    w.map((o) => [o.id, `${f}-column-${encodeURIComponent(o.id)}`])
  ), ne = new Map(w.map((o) => [R.get(o.id), o.id])), oe = JSON.stringify([...R.values()].sort()), I = (o) => {
    const m = { ...h, ...o };
    c === void 0 && O(m), b?.(m);
  }, M = g.visibleColumns.map((o) => ({
    id: `${f}-header-${encodeURIComponent(o.id)}`,
    header: o.header,
    columnId: o.id
  })), ie = JSON.stringify([
    u,
    ...M.map((o) => o.id).sort()
  ]), se = (o, m) => {
    const S = M.find((P) => P.id === o), v = M.find((P) => P.id === m);
    !S || !v || S.id === v.id || (I({
      columnOrder: dt(h.columnOrder, S.columnId, v.columnId)
    }), s(`${S.header} column moved.`));
  }, ae = () => I({ search: "", filters: {}, page: 1 }), le = Object.keys(h.filters).length, de = !!(h.search || le);
  if (l)
    return /* @__PURE__ */ t(he, { isInline: !0, variant: ue.danger, title: "Unable to load clusters", children: l });
  if (y)
    return /* @__PURE__ */ t(
      z,
      {
        headingLevel: "h2",
        titleText: "Loading clusters",
        icon: we,
        variant: J.sm
      }
    );
  const _ = /* @__PURE__ */ t(
    z,
    {
      headingLevel: "h2",
      variant: J.sm,
      titleText: e.length === 0 ? "No clusters" : g.visibleColumns.length === 0 ? "No visible columns" : "No matching clusters",
      children: /* @__PURE__ */ t(ye, { children: e.length === 0 ? "Clusters will appear here when data is available." : g.visibleColumns.length === 0 ? "Use Manage columns to show a column." : "Adjust your search or column filters to see results." })
    }
  );
  return /* @__PURE__ */ x(K, { hasGutter: !0, children: [
    /* @__PURE__ */ t(T, { children: /* @__PURE__ */ t(xe, { id: `${f}-toolbar`, children: /* @__PURE__ */ x(Oe, { children: [
      /* @__PURE__ */ t(k, { children: /* @__PURE__ */ t(
        Y,
        {
          "aria-label": "Search clusters",
          placeholder: "Search clusters",
          value: h.search,
          onChange: (o, m) => I({ search: m, page: 1 }),
          onClear: () => I({ search: "", page: 1 })
        }
      ) }),
      /* @__PURE__ */ t(k, { children: /* @__PURE__ */ t(
        Se,
        {
          isDetached: !0,
          isExpanded: d,
          onToggle: N,
          toggleId: `${f}-columns-toggle`,
          contentId: `${f}-columns-content`,
          children: "Manage columns"
        }
      ) }),
      /* @__PURE__ */ t(k, { children: /* @__PURE__ */ t(E, { variant: A.link, isDisabled: !de, onClick: ae, children: "Clear filters" }) }),
      /* @__PURE__ */ t(k, { children: /* @__PURE__ */ x("span", { role: "status", children: [
        g.filteredCount,
        " of ",
        e.length,
        " clusters"
      ] }) })
    ] }) }) }),
    /* @__PURE__ */ t(T, { hidden: !d, children: /* @__PURE__ */ t(
      ve,
      {
        isDetached: !0,
        isExpanded: d,
        toggleId: `${f}-columns-toggle`,
        contentId: `${f}-columns-content`,
        children: /* @__PURE__ */ x(K, { hasGutter: !0, children: [
          /* @__PURE__ */ t(T, { children: "Drag a column by its handle. With the keyboard, press Space to pick up, use the arrow keys to move, and press Space to drop." }),
          /* @__PURE__ */ t(T, { children: /* @__PURE__ */ t(
            De,
            {
              id: `${f}-columns`,
              variant: "DataList",
              items: g.columns.map((o, m) => ({
                id: R.get(o.id) ?? o.id,
                props: { "aria-label": `${o.header} column` },
                content: /* @__PURE__ */ t(
                  be,
                  {
                    dataListCells: [
                      /* @__PURE__ */ t(Ce, { children: /* @__PURE__ */ t(
                        fe,
                        {
                          id: `${f}-visible-${m}`,
                          label: o.header,
                          "aria-label": `Show ${o.header}`,
                          isChecked: !h.hiddenColumnIds.includes(o.id),
                          onChange: (S, v) => I({
                            hiddenColumnIds: v ? h.hiddenColumnIds.filter((P) => P !== o.id) : [...h.hiddenColumnIds, o.id]
                          })
                        }
                      ) }, o.id)
                    ]
                  }
                )
              })),
              onDrop: (o, m) => {
                I({
                  columnOrder: m.flatMap((S) => {
                    const v = ne.get(String(S.id));
                    return v === void 0 ? [] : [v];
                  })
                }), s("Column order updated.");
              },
              children: /* @__PURE__ */ t(ge, { "aria-label": "Column order and visibility", isCompact: !0 })
            },
            oe
          ) }),
          /* @__PURE__ */ t(T, { children: /* @__PURE__ */ t("span", { role: "status", children: D }) })
        ] })
      }
    ) }),
    /* @__PURE__ */ t(T, { children: g.visibleColumns.length === 0 ? _ : /* @__PURE__ */ t(ot, { columns: M, onMove: se, children: /* @__PURE__ */ t(
      Pe,
      {
        role: "region",
        "aria-label": `${i} table scroll area`,
        tabIndex: 0,
        children: /* @__PURE__ */ x(
          Ae,
          {
            "aria-label": i,
            variant: p ? Le.compact : void 0,
            gridBreakPoint: Ne.none,
            children: [
              /* @__PURE__ */ t(Me, { noWrap: !0, children: /* @__PURE__ */ t(B, { children: g.visibleColumns.map((o) => {
                const m = h.sort?.columnId === o.id ? h.sort.direction : void 0;
                return /* @__PURE__ */ t(
                  rt,
                  {
                    column: o,
                    direction: m,
                    filterValue: Object.prototype.hasOwnProperty.call(h.filters, o.id) ? h.filters[o.id] : "",
                    isDraggable: u,
                    dragId: `${f}-header-${encodeURIComponent(o.id)}`,
                    onSort: () => I({
                      sort: {
                        columnId: o.id,
                        direction: m === "asc" ? "desc" : "asc"
                      },
                      page: 1
                    }),
                    onFilter: (S) => I({ filters: { ...h.filters, [o.id]: S }, page: 1 })
                  },
                  o.id
                );
              }) }) }),
              /* @__PURE__ */ x(ke, { children: [
                g.rows.map((o) => /* @__PURE__ */ t(B, { children: g.visibleColumns.map((m) => {
                  const S = m.accessor(o), v = L.get(m.id)?.cell;
                  return /* @__PURE__ */ t(W, { dataLabel: m.header, children: v ? v(S, o) : j(S) || "—" }, m.id);
                }) }, n(o))),
                g.rows.length === 0 && /* @__PURE__ */ t(B, { children: /* @__PURE__ */ t(W, { colSpan: g.visibleColumns.length, children: _ }) })
              ] })
            ]
          }
        )
      }
    ) }, ie) }),
    /* @__PURE__ */ t(T, { children: /* @__PURE__ */ t(
      Ie,
      {
        itemCount: g.filteredCount,
        page: h.page,
        perPage: h.perPage,
        variant: $e.bottom,
        isStatic: !0,
        onSetPage: (o, m) => I({ page: m }),
        onPerPageSelect: (o, m) => I({ perPage: m, page: 1 })
      }
    ) })
  ] });
};
export {
  Ut as ClusterTable,
  ct as buildClusterTableModel,
  ee as createClusterTableState,
  j as formatClusterValue,
  st as inferClusterColumns,
  dt as reorderClusterColumns
};
//# sourceMappingURL=index.mjs.map
