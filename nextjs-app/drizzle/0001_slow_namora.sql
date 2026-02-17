CREATE TABLE "research_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"query" text NOT NULL,
	"clinic_type" text,
	"service" text,
	"source" varchar(20) DEFAULT 'web_search',
	"status" varchar(20) DEFAULT 'pending',
	"results" jsonb,
	"raw_sources" jsonb,
	"synthesis" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "saved_ads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ad_id" text,
	"advertiser_name" text NOT NULL,
	"page_id" text,
	"ad_body" text,
	"ad_title" text,
	"ad_creative_url" text,
	"ad_snapshot_url" text,
	"platform" text,
	"start_date" date,
	"is_active" boolean,
	"category" text,
	"notes" text,
	"tags" text[],
	"clinic_type" text,
	"created_at" timestamp DEFAULT now()
);
