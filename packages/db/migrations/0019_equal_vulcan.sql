CREATE TABLE "mail0_plugin_data" (
	"plugin_id" text NOT NULL,
	"user_id" text NOT NULL,
	"key" text NOT NULL,
	"data" json NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "mail0_plugin_data_plugin_id_user_id_key_pk" PRIMARY KEY("plugin_id","user_id","key")
);
--> statement-breakpoint
ALTER TABLE "mail0_plugin_data" ADD CONSTRAINT "mail0_plugin_data_user_id_mail0_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."mail0_user"("id") ON DELETE no action ON UPDATE no action;