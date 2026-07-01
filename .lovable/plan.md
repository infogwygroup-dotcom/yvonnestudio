Add more variety to Beta 2.0 Common presentation formats by expanding the pool and adding new editorial layouts.

Technical changes
1. `src/routes/api/create-moment.ts`
   - Expand `PRESENTATION_BY_RARITY.common` from 4 to 10 formats:
     Cinema Poster, Journal Page, Magazine Cover, Photo Print, Postcard, Photo Strip, Polaroid Frame, Café Receipt, Ticket Stub, Handwritten Note, Bookmark.
   - Update `rarityDirective` for common to mention the richer pool.

2. `src/components/v2/layouts.tsx`
   - Add new layout components using existing PageShell and editorial typography:
     - `PostcardLayout` — front/back postcard with stamp, address lines, tagline.
     - `PolaroidLayout` — single instant-film frame with handwritten caption below.
     - `ReceiptLayout` — café receipt style, monochrome thermal-print typography.
     - `BookmarkLayout` — tall narrow bookmark with illustration strip and quote.

3. `src/lib/presentation.ts`
   - Register mappings:
     - "postcard" → PostcardLayout
     - "photo strip" → ContactSheetLayout
     - "polaroid frame" → PolaroidLayout
     - "café receipt" / "cafe receipt" → ReceiptLayout
     - "ticket stub" → TicketLayout
     - "handwritten note" → JournalLayout
     - "bookmark" → BookmarkLayout

4. Verify the build passes and Beta 2.0 viewer still renders all mapped formats.