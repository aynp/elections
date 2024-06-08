import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const state = sqliteTable("state", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  code: text("code").unique(),
  name: text("name"),
});

export const constituency = sqliteTable("constituency", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name"),
  code: text("code"),
  stateId: integer("state_id").references(() => state.id),
});

export const party = sqliteTable("party", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name"),
  shortName: text("short_name"),
});

export const candidate = sqliteTable("candidate", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name"),
  partyId: integer("party_id").references(() => party.id),
  constituencyId: integer("constituency_id").references(() => constituency.id),
  postalVotes: integer("postal_votes").notNull().default(0),
  evmVotes: integer("evm_votes").notNull().default(0),
  totalVotes: integer("total_votes").notNull().default(0),
  votePercentage: real("vote_percentage").notNull().default(100),
});
