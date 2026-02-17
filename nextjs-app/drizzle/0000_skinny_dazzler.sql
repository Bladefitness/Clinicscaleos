CREATE TABLE "agent_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"agent" varchar(30) NOT NULL,
	"role" varchar(20) NOT NULL,
	"content" text NOT NULL,
	"tool_calls" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "avatars" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clinic_type" text NOT NULL,
	"service" text NOT NULL,
	"name" text NOT NULL,
	"situation" text,
	"demographics" text,
	"psychographics" text,
	"emotions" jsonb,
	"hooks" jsonb,
	"objections" text[],
	"buying_triggers" text[],
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"clinic_type" text,
	"service" text,
	"location" text,
	"budget" text,
	"goal" text,
	"objective" text,
	"blueprint" jsonb,
	"deployment_checklist" jsonb,
	"status" varchar(20) DEFAULT 'draft',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "coaching_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid,
	"session_type" varchar(30) NOT NULL,
	"content" jsonb,
	"user_message" text,
	"ai_response" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "creative_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"payload" jsonb NOT NULL,
	"visibility" varchar(20) DEFAULT 'private',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "creatives" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"avatar_id" uuid,
	"avatar_name" text NOT NULL,
	"emotion" text NOT NULL,
	"style" text NOT NULL,
	"headline" text NOT NULL,
	"primary_text" text NOT NULL,
	"description" text,
	"cta_button" text,
	"image_prompt" text,
	"hook" text,
	"category" text,
	"copy_formula" text,
	"clinic_type" text,
	"service" text,
	"location" text,
	"status" varchar(20) DEFAULT 'pending',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "iterations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid,
	"source_creative_id" uuid,
	"iteration_type" varchar(30),
	"diagnosis" jsonb,
	"new_creatives" jsonb,
	"performance_delta" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "metrics_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid,
	"date" date NOT NULL,
	"ad_set_name" text,
	"creative_id" uuid,
	"impressions" integer DEFAULT 0,
	"clicks" integer DEFAULT 0,
	"leads" integer DEFAULT 0,
	"spend" numeric(10, 2) DEFAULT '0',
	"cpl" numeric(10, 2),
	"ctr" numeric(5, 2),
	"cpc" numeric(10, 2),
	"frequency" numeric(5, 2),
	"roas" numeric(5, 2),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "offers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"service" text NOT NULL,
	"price" text,
	"clinic_type" text NOT NULL,
	"location" text NOT NULL,
	"current_offer" text NOT NULL,
	"differentiator" text,
	"target_market" text,
	"score" integer,
	"score_breakdown" jsonb,
	"weaknesses" text[],
	"strengths" text[],
	"verdict" text,
	"variations" jsonb,
	"competitor_data" jsonb,
	"market_temperature" varchar(20),
	"selected_variation" integer,
	"status" varchar(20) DEFAULT 'draft',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "renders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid,
	"status" varchar(20) DEFAULT 'queued',
	"type" varchar(30) NOT NULL,
	"config" jsonb NOT NULL,
	"output_url" text,
	"progress" integer DEFAULT 0,
	"error" text,
	"started_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "timeline_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"version" integer NOT NULL,
	"timeline_state" jsonb NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "video_assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"kind" varchar(30) NOT NULL,
	"url" text,
	"blob_path" text,
	"storage_path" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "video_projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text DEFAULT 'Untitled project' NOT NULL,
	"type" varchar(20) DEFAULT 'short_form' NOT NULL,
	"timeline" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "agent_messages" ADD CONSTRAINT "agent_messages_project_id_video_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."video_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creatives" ADD CONSTRAINT "creatives_avatar_id_avatars_id_fk" FOREIGN KEY ("avatar_id") REFERENCES "public"."avatars"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "metrics_snapshots" ADD CONSTRAINT "metrics_snapshots_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "renders" ADD CONSTRAINT "renders_project_id_video_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."video_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timeline_versions" ADD CONSTRAINT "timeline_versions_project_id_video_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."video_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "video_assets" ADD CONSTRAINT "video_assets_project_id_video_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."video_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "agent_messages_project_id_idx" ON "agent_messages" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "campaigns_status_idx" ON "campaigns" USING btree ("status");--> statement-breakpoint
CREATE INDEX "creative_runs_visibility_idx" ON "creative_runs" USING btree ("visibility");--> statement-breakpoint
CREATE INDEX "creatives_avatar_id_idx" ON "creatives" USING btree ("avatar_id");--> statement-breakpoint
CREATE INDEX "creatives_status_idx" ON "creatives" USING btree ("status");--> statement-breakpoint
CREATE INDEX "metrics_snapshots_campaign_id_idx" ON "metrics_snapshots" USING btree ("campaign_id");--> statement-breakpoint
CREATE INDEX "metrics_snapshots_date_idx" ON "metrics_snapshots" USING btree ("date");--> statement-breakpoint
CREATE INDEX "offers_created_at_idx" ON "offers" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "video_assets_project_id_idx" ON "video_assets" USING btree ("project_id");