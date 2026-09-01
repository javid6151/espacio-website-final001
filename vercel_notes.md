{
  // ═══════════════════════════════════════════════════════════════════════════
  // ESPACIO Vercel Deployment Configuration
  // ═══════════════════════════════════════════════════════════════════════════
  //
  // ARCHITECTURE:
  //   - Frontend: React SPA built by Vite → served from client/dist/
  //   - Backend:  Express serverless function → api/index.js (Vercel Functions)
  //
  // ROUTING STRATEGY:
  //   1. /api/**  → routed to serverless Express backend
  //   2. /**      → SPA fallback to index.html (enables client-side routing)
  //
  // CACHING STRATEGY (Browser Cache-Control):
  //   - /assets/* → 1-year immutable (content-hashed filenames, never changes)
  //   - /images/* → 1-year immutable (converted WebP assets, static on deploy)
  //   - HTML pages → no-cache (always fetched to check for new deploy)
  //
  // ═══════════════════════════════════════════════════════════════════════════
}
