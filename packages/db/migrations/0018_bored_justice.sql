/* 
    Unfortunately in current drizzle-kit version we can't automatically get name for primary key.
    We are working on making it available!

    Meanwhile you can:
        1. Check pk name in your database, by running
            SELECT constraint_name FROM information_schema.table_constraints
            WHERE table_schema = 'public'
                AND table_name = 'mail0_plugin_settings'
                AND constraint_type = 'PRIMARY KEY';
        2. Uncomment code below and paste pk name manually
        
    Hope to release this update as soon as possible
*/

-- ALTER TABLE "mail0_plugin_settings" DROP CONSTRAINT "<constraint_name>";--> statement-breakpoint
ALTER TABLE "mail0_plugin_settings" ADD CONSTRAINT "mail0_plugin_settings_plugin_id_user_id_pk" PRIMARY KEY("plugin_id","user_id");