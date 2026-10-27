# Cluster table package

- Public component: `ClusterTable`; public headless helpers and types are exported from `src/index.ts`.
- Keep the engine independent of React and PatternFly. Host apps own data loading and domain-specific normalization.
- Infer top-level columns from all rows; never assume the first row defines the schema.
- Keep column IDs and row IDs stable through filtering, sorting and reordering.
- Every drag operation must have an equivalent keyboard-accessible control.
- Public Storybook prefix: `Components/ClusterTable/ClusterTable`; use `Internal/ClusterTable/` for internal stories.
- Follow root task rulebooks and use PatternFly dynamic component imports.
