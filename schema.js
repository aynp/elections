import { pgTable, text, integer, real, serial } from "drizzle-orm/pg-core";

export const state = pgTable("state", {
  id: serial("id").primaryKey(),
  code: text("code").unique(),
  name: text("name"),
});

export const constituency = pgTable("constituency", {
  id: serial("id").primaryKey(),
  name: text("name"),
  code: text("code"),
  stateId: integer("state_id").references(() => state.id),
});

export const party = pgTable("party", {
  id: serial("id").primaryKey(),
  name: text("name"),
  shortName: text("short_name"),
});

export const candidate = pgTable("candidate", {
  id: serial("id").primaryKey(),
  name: text("name"),
  partyId: integer("party_id").references(() => party.id),
  constituencyId: integer("constituency_id").references(() => constituency.id),
  postalVotes: integer("postal_votes").notNull().default(0),
  evmVotes: integer("evm_votes").notNull().default(0),
  totalVotes: integer("total_votes").notNull().default(0),
  votePercentage: real("vote_percentage").notNull().default(100),
});
