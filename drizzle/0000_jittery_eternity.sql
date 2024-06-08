CREATE TABLE IF NOT EXISTS "candidate" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text,
	"party_id" integer,
	"constituency_id" integer,
	"postal_votes" integer DEFAULT 0 NOT NULL,
	"evm_votes" integer DEFAULT 0 NOT NULL,
	"total_votes" integer DEFAULT 0 NOT NULL,
	"vote_percentage" real DEFAULT 100 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "constituency" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text,
	"code" text,
	"state_id" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "party" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text,
	"short_name" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "state" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text,
	"name" text,
	CONSTRAINT "state_code_unique" UNIQUE("code")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "candidate" ADD CONSTRAINT "candidate_party_id_party_id_fk" FOREIGN KEY ("party_id") REFERENCES "public"."party"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "candidate" ADD CONSTRAINT "candidate_constituency_id_constituency_id_fk" FOREIGN KEY ("constituency_id") REFERENCES "public"."constituency"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "constituency" ADD CONSTRAINT "constituency_state_id_state_id_fk" FOREIGN KEY ("state_id") REFERENCES "public"."state"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
