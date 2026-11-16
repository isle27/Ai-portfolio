export default function Loading() {
  return (
    <main
      id="main"
      className="shell loading-page"
      aria-busy="true"
      aria-label="Loading portfolio"
    >
      <span className="eyebrow">ONE MOMENT</span>
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-copy" />
      <div className="skeleton skeleton-panel" />
      <span className="sr-only">Loading content…</span>
    </main>
  );
}
