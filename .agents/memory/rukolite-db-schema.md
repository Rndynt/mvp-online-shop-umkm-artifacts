---
name: RukoLite DB schema
description: Drizzle schema approach — avoid drizzle-zod type exports
---

## Rule
Do NOT use `z.infer<typeof createInsertSchema(table)>` in lib/db schema files.
Use Drizzle native inference instead:
```typescript
export type InsertFoo = typeof fooTable.$inferInsert;
export type Foo = typeof fooTable.$inferSelect;
```

**Why:** drizzle-zod's `createInsertSchema` returns a `ZodObject` whose generic params are incompatible with the catalog's `zod ^3.25.76` `ZodType<any, any, any>` constraint when used with `z.infer<...>`. This causes `TS2344` errors that block typecheck. Drizzle's native `$inferInsert`/`$inferSelect` have no such dependency.

**How to apply:** Whenever adding a new table to lib/db/src/schema/, export types using `$inferInsert` and `$inferSelect` only. Never import `z` in schema files.
