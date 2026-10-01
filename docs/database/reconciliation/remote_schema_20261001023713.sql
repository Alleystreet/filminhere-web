-- FilmInHere Supabase remote_schema snapshot
-- Captured from Supabase migration history on 2026-10-01.
-- Version: 20261001023713
-- Name: remote_schema
-- Statement count: 775
--
-- EVIDENCE SNAPSHOT ONLY.
-- Do not apply this file directly to Production.
-- It exists so the historically manual Supabase schema can be reviewed
-- and decomposed into reproducible, source-controlled baseline migrations.
--
-- statement 1 of 775
SET statement_timeout = 0

-- statement 2 of 775
SET lock_timeout = 0

-- statement 3 of 775
SET idle_in_transaction_session_timeout = 0

-- statement 4 of 775
SET client_encoding = 'UTF8'

-- statement 5 of 775
SET standard_conforming_strings = on

-- statement 6 of 775
SELECT pg_catalog.set_config('search_path', '', false)

-- statement 7 of 775
SET check_function_bodies = false

-- statement 8 of 775
SET xmloption = content

-- statement 9 of 775
SET client_min_messages = warning

-- statement 10 of 775
SET row_security = off

-- statement 11 of 775
COMMENT ON SCHEMA "public" IS 'standard public schema'

-- statement 12 of 775
CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql"

-- statement 13 of 775
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions"

-- statement 14 of 775
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions"

-- statement 15 of 775
CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault"

-- statement 16 of 775
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions"

-- statement 17 of 775
CREATE TYPE "public"."knowledge_level_enum" AS ENUM (
    'hobbyist',
    'student',
    'professional'
)

-- statement 18 of 775
ALTER TYPE "public"."knowledge_level_enum" OWNER TO "postgres"

-- statement 19 of 775
CREATE TYPE "public"."user_role_enum" AS ENUM (
    'filmmaker',
    'host',
    'vendor',
    'crew',
    'talent',
    'admin'
)

-- statement 20 of 775
ALTER TYPE "public"."user_role_enum" OWNER TO "postgres"

-- statement 21 of 775
CREATE OR REPLACE FUNCTION "public"."current_user_is_admin"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and user_role = 'admin'::public.user_role_enum
  );
$$

-- statement 22 of 775
ALTER FUNCTION "public"."current_user_is_admin"() OWNER TO "postgres"

-- statement 23 of 775
CREATE OR REPLACE FUNCTION "public"."handle_new_auth_user_profile"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'auth', 'pg_temp'
    AS $$
declare
  requested_role text;
  safe_role public.user_role_enum;
  requested_knowledge text;
  safe_knowledge public.knowledge_level_enum;
begin
  requested_role := coalesce(new.raw_user_meta_data->>'user_role', 'filmmaker');

  safe_role :=
    case requested_role
      when 'host' then 'host'::public.user_role_enum
      when 'vendor' then 'vendor'::public.user_role_enum
      when 'crew' then 'crew'::public.user_role_enum
      when 'talent' then 'talent'::public.user_role_enum
      else 'filmmaker'::public.user_role_enum
    end;

  requested_knowledge := coalesce(new.raw_user_meta_data->>'knowledge_level', 'hobbyist');

  safe_knowledge :=
    case requested_knowledge
      when 'student' then 'student'::public.knowledge_level_enum
      when 'professional' then 'professional'::public.knowledge_level_enum
      else 'hobbyist'::public.knowledge_level_enum
    end;

  insert into public.profiles (
    id,
    email,
    display_name,
    user_role,
    knowledge_level,
    country
  )
  values (
    new.id,
    new.email,
    nullif(new.raw_user_meta_data->>'display_name', ''),
    safe_role,
    safe_knowledge,
    'USA'
  )
  on conflict (id) do nothing;

  return new;
end;
$$

-- statement 24 of 775
ALTER FUNCTION "public"."handle_new_auth_user_profile"() OWNER TO "postgres"

-- statement 25 of 775
CREATE OR REPLACE FUNCTION "public"."set_project_activity_log_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$

-- statement 26 of 775
ALTER FUNCTION "public"."set_project_activity_log_updated_at"() OWNER TO "postgres"

-- statement 27 of 775
CREATE OR REPLACE FUNCTION "public"."set_project_approval_decisions_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$

-- statement 28 of 775
ALTER FUNCTION "public"."set_project_approval_decisions_updated_at"() OWNER TO "postgres"

-- statement 29 of 775
CREATE OR REPLACE FUNCTION "public"."set_project_deliverable_tracking_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$

-- statement 30 of 775
ALTER FUNCTION "public"."set_project_deliverable_tracking_updated_at"() OWNER TO "postgres"

-- statement 31 of 775
CREATE OR REPLACE FUNCTION "public"."set_project_distribution_release_tracking_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$

-- statement 32 of 775
ALTER FUNCTION "public"."set_project_distribution_release_tracking_updated_at"() OWNER TO "postgres"

-- statement 33 of 775
CREATE OR REPLACE FUNCTION "public"."set_project_monetization_tracking_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$

-- statement 34 of 775
ALTER FUNCTION "public"."set_project_monetization_tracking_updated_at"() OWNER TO "postgres"

-- statement 35 of 775
CREATE OR REPLACE FUNCTION "public"."set_project_rights_tracking_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$

-- statement 36 of 775
ALTER FUNCTION "public"."set_project_rights_tracking_updated_at"() OWNER TO "postgres"

-- statement 37 of 775
CREATE OR REPLACE FUNCTION "public"."set_project_submission_packets_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$

-- statement 38 of 775
ALTER FUNCTION "public"."set_project_submission_packets_updated_at"() OWNER TO "postgres"

-- statement 39 of 775
CREATE OR REPLACE FUNCTION "public"."set_project_submission_review_log_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$

-- statement 40 of 775
ALTER FUNCTION "public"."set_project_submission_review_log_updated_at"() OWNER TO "postgres"

-- statement 41 of 775
CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$

-- statement 42 of 775
ALTER FUNCTION "public"."set_updated_at"() OWNER TO "postgres"

-- statement 43 of 775
SET default_tablespace = ''

-- statement 44 of 775
SET default_table_access_method = "heap"

-- statement 45 of 775
CREATE TABLE IF NOT EXISTS "public"."host_listing_submissions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "listing_type" "text" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "address" "text",
    "city" "text",
    "state" "text",
    "country" "text",
    "rate_per_hour" numeric,
    "rate_per_day" numeric,
    "min_hours" integer,
    "capacity" integer,
    "amenities" "text",
    "rules_notes" "text",
    "host_email" "text",
    "status" "text" DEFAULT 'PENDING_REVIEW'::"text" NOT NULL,
    "submitted_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
)

-- statement 46 of 775
ALTER TABLE "public"."host_listing_submissions" OWNER TO "postgres"

-- statement 47 of 775
CREATE OR REPLACE VIEW "public"."approved_host_listings_public" AS
 SELECT "id",
    "user_id",
    "listing_type",
    "title",
    "description",
    "city",
    "state",
    "country",
    "rate_per_hour",
    "rate_per_day",
    "min_hours",
    "capacity",
    "amenities",
    "rules_notes"
   FROM "public"."host_listing_submissions"
  WHERE ("status" = 'APPROVED'::"text")

-- statement 48 of 775
ALTER VIEW "public"."approved_host_listings_public" OWNER TO "postgres"

-- statement 49 of 775
CREATE TABLE IF NOT EXISTS "public"."booking_messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "request_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "sender" "text" DEFAULT 'FILMMAKER'::"text" NOT NULL,
    "body" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
)

-- statement 50 of 775
ALTER TABLE "public"."booking_messages" OWNER TO "postgres"

-- statement 51 of 775
CREATE TABLE IF NOT EXISTS "public"."booking_offers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "request_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "offer_type" "text" DEFAULT 'FILMMAKER_OFFER'::"text" NOT NULL,
    "rate_per_hour" numeric,
    "min_hours" numeric,
    "total" numeric,
    "note" "text",
    "status" "text" DEFAULT 'PENDING'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
)

-- statement 52 of 775
ALTER TABLE "public"."booking_offers" OWNER TO "postgres"

-- statement 53 of 775
CREATE TABLE IF NOT EXISTS "public"."booking_requests" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "listing_id" "text" NOT NULL,
    "listing_slug" "text",
    "listing_title" "text",
    "email" "text" NOT NULL,
    "message" "text",
    "start_iso" timestamp with time zone,
    "end_iso" timestamp with time zone,
    "status" "text" DEFAULT 'draft'::"text",
    "thread_status" "text" DEFAULT 'open'::"text",
    "created_iso" timestamp with time zone DEFAULT "now"(),
    "impact" "jsonb",
    "user_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "host_user_id" "uuid"
)

-- statement 54 of 775
ALTER TABLE "public"."booking_requests" OWNER TO "postgres"

-- statement 55 of 775
CREATE TABLE IF NOT EXISTS "public"."categories" (
    "id" bigint NOT NULL,
    "listing_type_id" bigint NOT NULL,
    "department_id" bigint NOT NULL,
    "category_name" "text" NOT NULL,
    "subcategory_name" "text",
    "example_name" "text",
    "active" boolean DEFAULT true NOT NULL,
    "slug" "text",
    "sort_order" integer DEFAULT 100 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
)

-- statement 56 of 775
ALTER TABLE "public"."categories" OWNER TO "postgres"

-- statement 57 of 775
CREATE SEQUENCE IF NOT EXISTS "public"."categories_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1

-- statement 58 of 775
ALTER SEQUENCE "public"."categories_id_seq" OWNER TO "postgres"

-- statement 59 of 775
ALTER SEQUENCE "public"."categories_id_seq" OWNED BY "public"."categories"."id"

-- statement 60 of 775
CREATE TABLE IF NOT EXISTS "public"."departments" (
    "id" bigint NOT NULL,
    "department" "text" NOT NULL,
    "sub_department" "text",
    "examples" "text",
    "active" boolean DEFAULT true NOT NULL,
    "sort_order" integer DEFAULT 100 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
)

-- statement 61 of 775
ALTER TABLE "public"."departments" OWNER TO "postgres"

-- statement 62 of 775
CREATE SEQUENCE IF NOT EXISTS "public"."departments_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1

-- statement 63 of 775
ALTER SEQUENCE "public"."departments_id_seq" OWNER TO "postgres"

-- statement 64 of 775
ALTER SEQUENCE "public"."departments_id_seq" OWNED BY "public"."departments"."id"

-- statement 65 of 775
CREATE TABLE IF NOT EXISTS "public"."destination_asset_requirements" (
    "id" bigint NOT NULL,
    "destination_id" bigint NOT NULL,
    "asset_key" "text" NOT NULL,
    "asset_label" "text" NOT NULL,
    "asset_group" "text" DEFAULT 'Submission Package'::"text" NOT NULL,
    "is_required" boolean DEFAULT false NOT NULL,
    "accepted_file_types" "text"[],
    "min_files" integer,
    "max_files" integer,
    "min_runtime_seconds" integer,
    "max_runtime_seconds" integer,
    "min_image_width" integer,
    "min_image_height" integer,
    "max_file_size_mb" numeric(10,2),
    "delivery_rule" "text",
    "instruction_text" "text",
    "display_order" integer DEFAULT 100 NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "destination_asset_requirements_file_count_check" CHECK ((("min_files" IS NULL) OR ("max_files" IS NULL) OR ("min_files" <= "max_files"))),
    CONSTRAINT "destination_asset_requirements_runtime_check" CHECK ((("min_runtime_seconds" IS NULL) OR ("max_runtime_seconds" IS NULL) OR ("min_runtime_seconds" <= "max_runtime_seconds")))
)

-- statement 66 of 775
ALTER TABLE "public"."destination_asset_requirements" OWNER TO "postgres"

-- statement 67 of 775
CREATE SEQUENCE IF NOT EXISTS "public"."destination_asset_requirements_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1

-- statement 68 of 775
ALTER SEQUENCE "public"."destination_asset_requirements_id_seq" OWNER TO "postgres"

-- statement 69 of 775
ALTER SEQUENCE "public"."destination_asset_requirements_id_seq" OWNED BY "public"."destination_asset_requirements"."id"

-- statement 70 of 775
CREATE TABLE IF NOT EXISTS "public"."destination_field_mappings" (
    "id" bigint NOT NULL,
    "destination_id" bigint NOT NULL,
    "source_field_key" "text" NOT NULL,
    "source_field_label" "text" NOT NULL,
    "destination_term" "text" NOT NULL,
    "destination_field_group" "text",
    "field_data_type" "text" DEFAULT 'text'::"text" NOT NULL,
    "is_required" boolean DEFAULT false NOT NULL,
    "min_length" integer,
    "max_length" integer,
    "allowed_values" "text"[],
    "formatting_rule" "text",
    "instruction_text" "text",
    "example_value" "text",
    "display_order" integer DEFAULT 100 NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "destination_field_mappings_field_data_type_check" CHECK (("field_data_type" = ANY (ARRAY['text'::"text", 'long_text'::"text", 'integer'::"text", 'numeric'::"text", 'boolean'::"text", 'date'::"text", 'datetime'::"text", 'url'::"text", 'file'::"text", 'enum'::"text"]))),
    CONSTRAINT "destination_field_mappings_min_max_check" CHECK ((("min_length" IS NULL) OR ("max_length" IS NULL) OR ("min_length" <= "max_length")))
)

-- statement 71 of 775
ALTER TABLE "public"."destination_field_mappings" OWNER TO "postgres"

-- statement 72 of 775
CREATE SEQUENCE IF NOT EXISTS "public"."destination_field_mappings_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1

-- statement 73 of 775
ALTER SEQUENCE "public"."destination_field_mappings_id_seq" OWNER TO "postgres"

-- statement 74 of 775
ALTER SEQUENCE "public"."destination_field_mappings_id_seq" OWNED BY "public"."destination_field_mappings"."id"

-- statement 75 of 775
CREATE TABLE IF NOT EXISTS "public"."distribution_destinations" (
    "id" bigint NOT NULL,
    "destination_name" "text" NOT NULL,
    "destination_slug" "text" NOT NULL,
    "destination_category" "text" NOT NULL,
    "is_alleystreet" boolean DEFAULT false NOT NULL,
    "is_platform_neutral_default" boolean DEFAULT false NOT NULL,
    "destination_status" "text" DEFAULT 'Active'::"text" NOT NULL,
    "short_description" "text",
    "public_notes" "text",
    "submission_url" "text",
    "support_url" "text",
    "language_notes" "text",
    "rights_notes" "text",
    "delivery_notes" "text",
    "truth_rule_notes" "text" DEFAULT 'Enter the project truth once. Adapt format, labels, and limits without changing the facts.'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "distribution_destinations_destination_category_check" CHECK (("destination_category" = ANY (ARRAY['Streaming'::"text", 'Festival'::"text", 'Theatrical'::"text", 'Broadcast'::"text", 'Direct'::"text", 'Educational'::"text", 'Marketplace'::"text", 'Other'::"text"]))),
    CONSTRAINT "distribution_destinations_destination_status_check" CHECK (("destination_status" = ANY (ARRAY['Active'::"text", 'Inactive'::"text", 'Planned'::"text"])))
)

-- statement 76 of 775
ALTER TABLE "public"."distribution_destinations" OWNER TO "postgres"

-- statement 77 of 775
CREATE OR REPLACE VIEW "public"."distribution_destination_summary_view" AS
 WITH "field_rollup" AS (
         SELECT "m"."destination_id",
            "count"(*) AS "field_mapping_rows",
            "count"(*) FILTER (WHERE ("m"."is_required" = true)) AS "required_field_rows",
            "count"(*) FILTER (WHERE ("m"."is_required" = false)) AS "optional_field_rows",
            "string_agg"((("m"."source_field_key" || ' → '::"text") || "m"."destination_term"), ' | '::"text" ORDER BY "m"."display_order", "m"."source_field_key") AS "field_mapping_list",
            "string_agg"("m"."source_field_key", ', '::"text" ORDER BY "m"."display_order", "m"."source_field_key") FILTER (WHERE ("m"."is_required" = true)) AS "required_field_keys"
           FROM "public"."destination_field_mappings" "m"
          WHERE ("m"."is_active" = true)
          GROUP BY "m"."destination_id"
        ), "asset_rollup" AS (
         SELECT "a"."destination_id",
            "count"(*) AS "asset_requirement_rows",
            "count"(*) FILTER (WHERE ("a"."is_required" = true)) AS "required_asset_rows",
            "count"(*) FILTER (WHERE ("a"."is_required" = false)) AS "optional_asset_rows",
            "string_agg"("a"."asset_key", ', '::"text" ORDER BY "a"."display_order", "a"."asset_key") FILTER (WHERE ("a"."is_required" = true)) AS "required_asset_keys",
            "string_agg"(((("a"."asset_key" || ' ('::"text") || "a"."asset_label") || ')'::"text"), ' | '::"text" ORDER BY "a"."display_order", "a"."asset_key") AS "asset_requirement_list"
           FROM "public"."destination_asset_requirements" "a"
          WHERE ("a"."is_active" = true)
          GROUP BY "a"."destination_id"
        )
 SELECT "d"."id" AS "destination_id",
    "d"."destination_name",
    "d"."destination_slug",
    "d"."destination_category",
    "d"."is_alleystreet",
    "d"."is_platform_neutral_default",
    "d"."destination_status",
    "d"."short_description",
    "d"."public_notes",
    "d"."truth_rule_notes",
    COALESCE("fr"."field_mapping_rows", (0)::bigint) AS "field_mapping_rows",
    COALESCE("fr"."required_field_rows", (0)::bigint) AS "required_field_rows",
    COALESCE("fr"."optional_field_rows", (0)::bigint) AS "optional_field_rows",
    COALESCE("ar"."asset_requirement_rows", (0)::bigint) AS "asset_requirement_rows",
    COALESCE("ar"."required_asset_rows", (0)::bigint) AS "required_asset_rows",
    COALESCE("ar"."optional_asset_rows", (0)::bigint) AS "optional_asset_rows",
    "fr"."required_field_keys",
    "ar"."required_asset_keys",
    "fr"."field_mapping_list",
    "ar"."asset_requirement_list",
        CASE
            WHEN ((COALESCE("fr"."required_field_rows", (0)::bigint) > 0) AND (COALESCE("ar"."required_asset_rows", (0)::bigint) > 0)) THEN true
            ELSE false
        END AS "has_minimum_submission_structure"
   FROM (("public"."distribution_destinations" "d"
     LEFT JOIN "field_rollup" "fr" ON (("fr"."destination_id" = "d"."id")))
     LEFT JOIN "asset_rollup" "ar" ON (("ar"."destination_id" = "d"."id")))

-- statement 78 of 775
ALTER VIEW "public"."distribution_destination_summary_view" OWNER TO "postgres"

-- statement 79 of 775
CREATE SEQUENCE IF NOT EXISTS "public"."distribution_destinations_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1

-- statement 80 of 775
ALTER SEQUENCE "public"."distribution_destinations_id_seq" OWNER TO "postgres"

-- statement 81 of 775
ALTER SEQUENCE "public"."distribution_destinations_id_seq" OWNED BY "public"."distribution_destinations"."id"

-- statement 82 of 775
CREATE TABLE IF NOT EXISTS "public"."listing_attributes" (
    "id" bigint NOT NULL,
    "listing_type_id" bigint NOT NULL,
    "department_id" bigint NOT NULL,
    "category_id" bigint NOT NULL,
    "attribute_name" "text" NOT NULL,
    "field_type" "text" NOT NULL,
    "example_value" "text",
    "value_options" "text",
    "is_required" boolean DEFAULT false NOT NULL,
    "is_searchable" boolean DEFAULT true NOT NULL,
    "active" boolean DEFAULT true NOT NULL,
    "sort_order" integer DEFAULT 100 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
)

-- statement 83 of 775
ALTER TABLE "public"."listing_attributes" OWNER TO "postgres"

-- statement 84 of 775
CREATE SEQUENCE IF NOT EXISTS "public"."listing_attributes_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1

-- statement 85 of 775
ALTER SEQUENCE "public"."listing_attributes_id_seq" OWNER TO "postgres"

-- statement 86 of 775
ALTER SEQUENCE "public"."listing_attributes_id_seq" OWNED BY "public"."listing_attributes"."id"

-- statement 87 of 775
CREATE TABLE IF NOT EXISTS "public"."listing_types" (
    "id" bigint NOT NULL,
    "name" "text" NOT NULL,
    "notes" "text",
    "active" boolean DEFAULT true NOT NULL,
    "sort_order" integer DEFAULT 100 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
)

-- statement 88 of 775
ALTER TABLE "public"."listing_types" OWNER TO "postgres"

-- statement 89 of 775
CREATE SEQUENCE IF NOT EXISTS "public"."listing_types_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1

-- statement 90 of 775
ALTER SEQUENCE "public"."listing_types_id_seq" OWNER TO "postgres"

-- statement 91 of 775
ALTER SEQUENCE "public"."listing_types_id_seq" OWNED BY "public"."listing_types"."id"

-- statement 92 of 775
CREATE TABLE IF NOT EXISTS "public"."policy_acceptances" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "policy_key" "text" NOT NULL,
    "policy_version" "text" NOT NULL,
    "accepted_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
)

-- statement 93 of 775
ALTER TABLE "public"."policy_acceptances" OWNER TO "postgres"

-- statement 94 of 775
CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "email" "text",
    "display_name" "text",
    "user_role" "public"."user_role_enum" DEFAULT 'filmmaker'::"public"."user_role_enum" NOT NULL,
    "knowledge_level" "public"."knowledge_level_enum" DEFAULT 'hobbyist'::"public"."knowledge_level_enum" NOT NULL,
    "city" "text",
    "state" "text",
    "country" "text" DEFAULT 'USA'::"text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
)

-- statement 95 of 775
ALTER TABLE "public"."profiles" OWNER TO "postgres"

-- statement 96 of 775
CREATE TABLE IF NOT EXISTS "public"."project_activity_log" (
    "id" bigint NOT NULL,
    "project_id" bigint NOT NULL,
    "activity_type" "text" NOT NULL,
    "activity_title" "text" NOT NULL,
    "activity_description" "text",
    "status_id" bigint,
    "activity_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "actor_label" "text",
    "related_table_name" "text",
    "related_record_id" bigint,
    "internal_only" boolean DEFAULT true NOT NULL,
    "active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
)

-- statement 97 of 775
ALTER TABLE "public"."project_activity_log" OWNER TO "postgres"

-- statement 98 of 775
CREATE SEQUENCE IF NOT EXISTS "public"."project_activity_log_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1

-- statement 99 of 775
ALTER SEQUENCE "public"."project_activity_log_id_seq" OWNER TO "postgres"

-- statement 100 of 775
ALTER SEQUENCE "public"."project_activity_log_id_seq" OWNED BY "public"."project_activity_log"."id"

-- statement 101 of 775
CREATE TABLE IF NOT EXISTS "public"."project_statuses" (
    "id" bigint NOT NULL,
    "status_name" "text" NOT NULL,
    "description" "text",
    "final_stage" boolean DEFAULT false NOT NULL,
    "eligible_for_distribution_offer" boolean DEFAULT false NOT NULL,
    "active" boolean DEFAULT true NOT NULL,
    "sort_order" integer DEFAULT 100 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
)

-- statement 102 of 775
ALTER TABLE "public"."project_statuses" OWNER TO "postgres"

-- statement 103 of 775
CREATE TABLE IF NOT EXISTS "public"."projects" (
    "id" bigint NOT NULL,
    "title" "text" NOT NULL,
    "owner_user_id" "uuid",
    "provider_creator_type" "text",
    "project_type" "text" NOT NULL,
    "status_id" bigint,
    "city" "text",
    "state" "text",
    "country" "text" DEFAULT 'USA'::"text",
    "estimated_runtime_minutes" integer,
    "rights_confirmed" boolean DEFAULT false NOT NULL,
    "alleystreet_offer_eligible" boolean DEFAULT false NOT NULL,
    "alleystreet_submitted" boolean DEFAULT false NOT NULL,
    "external_release_ready" boolean DEFAULT false NOT NULL,
    "primary_distribution_destination_id" bigint,
    "creator_notes" "text",
    "active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
)

-- statement 104 of 775
ALTER TABLE "public"."projects" OWNER TO "postgres"

-- statement 105 of 775
CREATE OR REPLACE VIEW "public"."project_activity_timeline_view" AS
 WITH "ranked_activity" AS (
         SELECT "a"."id" AS "activity_id",
            "a"."project_id",
            "p"."title",
            "p"."project_type",
            "current_ps"."status_name" AS "current_project_status",
            "a"."activity_type",
            "a"."activity_title",
            "a"."activity_description",
            "activity_ps"."status_name" AS "activity_status_name",
            "a"."activity_at",
            "a"."actor_label",
            "a"."related_table_name",
            "a"."related_record_id",
            "a"."internal_only",
            "a"."active",
            "a"."created_at",
            "a"."updated_at",
            "row_number"() OVER (PARTITION BY "a"."project_id" ORDER BY "a"."activity_at" DESC, "a"."id" DESC) AS "activity_rank_desc"
           FROM ((("public"."project_activity_log" "a"
             JOIN "public"."projects" "p" ON (("p"."id" = "a"."project_id")))
             LEFT JOIN "public"."project_statuses" "activity_ps" ON (("activity_ps"."id" = "a"."status_id")))
             LEFT JOIN "public"."project_statuses" "current_ps" ON (("current_ps"."id" = "p"."status_id")))
          WHERE ("a"."active" = true)
        )
 SELECT "activity_id",
    "project_id",
    "title",
    "project_type",
    "current_project_status",
    "activity_type",
    "activity_title",
    "activity_description",
    "activity_status_name",
    "activity_at",
    "actor_label",
    "related_table_name",
    "related_record_id",
    "internal_only",
    "active",
    "created_at",
    "updated_at",
    "activity_rank_desc",
        CASE
            WHEN ("activity_rank_desc" = 1) THEN true
            ELSE false
        END AS "is_latest_activity"
   FROM "ranked_activity"

-- statement 106 of 775
ALTER VIEW "public"."project_activity_timeline_view" OWNER TO "postgres"

-- statement 107 of 775
CREATE TABLE IF NOT EXISTS "public"."project_approval_decisions" (
    "id" bigint NOT NULL,
    "submission_packet_id" bigint NOT NULL,
    "project_id" bigint NOT NULL,
    "destination_id" bigint NOT NULL,
    "decision_status" "text" NOT NULL,
    "decision_type" "text" DEFAULT 'Distribution Decision'::"text" NOT NULL,
    "offer_issued" boolean DEFAULT false NOT NULL,
    "revision_required" boolean DEFAULT false NOT NULL,
    "approval_scope" "text",
    "decision_summary" "text",
    "decision_notes" "text",
    "conditions_to_clear" "text",
    "decided_by_label" "text",
    "decision_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "effective_at" timestamp with time zone,
    "expires_at" timestamp with time zone,
    "internal_only" boolean DEFAULT true NOT NULL,
    "active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
)

-- statement 108 of 775
ALTER TABLE "public"."project_approval_decisions" OWNER TO "postgres"

-- statement 109 of 775
CREATE SEQUENCE IF NOT EXISTS "public"."project_approval_decisions_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1

-- statement 110 of 775
ALTER SEQUENCE "public"."project_approval_decisions_id_seq" OWNER TO "postgres"

-- statement 111 of 775
ALTER SEQUENCE "public"."project_approval_decisions_id_seq" OWNED BY "public"."project_approval_decisions"."id"

-- statement 112 of 775
CREATE TABLE IF NOT EXISTS "public"."project_deliverable_tracking" (
    "id" bigint NOT NULL,
    "project_id" bigint NOT NULL,
    "deliverable_id" bigint NOT NULL,
    "required_for_this_project" boolean DEFAULT false NOT NULL,
    "completed" boolean DEFAULT false NOT NULL,
    "approved" boolean DEFAULT false NOT NULL,
    "asset_url" "text",
    "asset_file_name" "text",
    "notes" "text",
    "review_notes" "text",
    "completed_at" timestamp with time zone,
    "approved_at" timestamp with time zone,
    "active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
)

-- statement 113 of 775
ALTER TABLE "public"."project_deliverable_tracking" OWNER TO "postgres"

-- statement 114 of 775
CREATE SEQUENCE IF NOT EXISTS "public"."project_deliverable_tracking_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1

-- statement 115 of 775
ALTER SEQUENCE "public"."project_deliverable_tracking_id_seq" OWNER TO "postgres"

-- statement 116 of 775
ALTER SEQUENCE "public"."project_deliverable_tracking_id_seq" OWNED BY "public"."project_deliverable_tracking"."id"

-- statement 117 of 775
CREATE TABLE IF NOT EXISTS "public"."project_deliverables" (
    "id" bigint NOT NULL,
    "deliverable_name" "text" NOT NULL,
    "description" "text",
    "required_for_alleystreet" boolean DEFAULT false NOT NULL,
    "required_for_external_release" boolean DEFAULT false NOT NULL,
    "active" boolean DEFAULT true NOT NULL,
    "sort_order" integer DEFAULT 100 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
)

-- statement 118 of 775
ALTER TABLE "public"."project_deliverables" OWNER TO "postgres"

-- statement 119 of 775
CREATE SEQUENCE IF NOT EXISTS "public"."project_deliverables_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1

-- statement 120 of 775
ALTER SEQUENCE "public"."project_deliverables_id_seq" OWNER TO "postgres"

-- statement 121 of 775
ALTER SEQUENCE "public"."project_deliverables_id_seq" OWNED BY "public"."project_deliverables"."id"

-- statement 122 of 775
CREATE TABLE IF NOT EXISTS "public"."project_destination_selections" (
    "id" bigint NOT NULL,
    "project_id" bigint NOT NULL,
    "destination_id" bigint NOT NULL,
    "selection_status" "text" DEFAULT 'Considering'::"text" NOT NULL,
    "submission_package_status" "text" DEFAULT 'Not Started'::"text" NOT NULL,
    "is_primary_destination" boolean DEFAULT false NOT NULL,
    "priority_order" integer DEFAULT 100 NOT NULL,
    "creator_goal" "text",
    "release_strategy" "text",
    "rights_confirmed" boolean DEFAULT false NOT NULL,
    "required_fields_complete" boolean DEFAULT false NOT NULL,
    "required_assets_complete" boolean DEFAULT false NOT NULL,
    "guidance_reviewed" boolean DEFAULT false NOT NULL,
    "planned_submission_at" timestamp with time zone,
    "submitted_at" timestamp with time zone,
    "decision_received_at" timestamp with time zone,
    "target_release_at" timestamp with time zone,
    "external_submission_reference" "text",
    "creator_notes" "text",
    "internal_notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "project_destination_selections_priority_order_check" CHECK (("priority_order" > 0)),
    CONSTRAINT "project_destination_selections_release_strategy_check" CHECK (("release_strategy" = ANY (ARRAY['Exclusive'::"text", 'Non-Exclusive'::"text", 'Festival First'::"text", 'Theatrical First'::"text", 'Direct First'::"text", 'Hybrid'::"text", 'TBD'::"text"]))),
    CONSTRAINT "project_destination_selections_selection_status_check" CHECK (("selection_status" = ANY (ARRAY['Considering'::"text", 'Selected'::"text", 'Preparing'::"text", 'Ready'::"text", 'Submitted'::"text", 'Accepted'::"text", 'Released'::"text", 'On Hold'::"text", 'Rejected'::"text", 'Withdrawn'::"text"]))),
    CONSTRAINT "project_destination_selections_submission_package_status_check" CHECK (("submission_package_status" = ANY (ARRAY['Not Started'::"text", 'In Progress'::"text", 'Ready for Review'::"text", 'Ready to Submit'::"text", 'Submitted'::"text", 'Needs Revision'::"text", 'Approved'::"text", 'Closed'::"text"])))
)

-- statement 123 of 775
ALTER TABLE "public"."project_destination_selections" OWNER TO "postgres"

-- statement 124 of 775
CREATE OR REPLACE VIEW "public"."project_destination_summary_view" AS
 SELECT "s"."id" AS "project_destination_selection_id",
    "s"."project_id",
    "p"."title",
    "s"."destination_id",
    "d"."destination_name",
    "d"."destination_slug",
    "d"."destination_category",
    "d"."is_alleystreet",
    "s"."is_primary_destination",
    "s"."priority_order",
    "s"."selection_status",
    "s"."submission_package_status",
    "s"."creator_goal",
    "s"."release_strategy",
    "s"."rights_confirmed",
    "s"."required_fields_complete",
    "s"."required_assets_complete",
    "s"."guidance_reviewed",
    "s"."planned_submission_at",
    "s"."submitted_at",
    "s"."decision_received_at",
    "s"."target_release_at",
    "dsv"."field_mapping_rows",
    "dsv"."required_field_rows",
    "dsv"."asset_requirement_rows",
    "dsv"."required_asset_rows",
    "dsv"."required_field_keys",
    "dsv"."required_asset_keys",
    "dsv"."has_minimum_submission_structure",
        CASE
            WHEN (("s"."rights_confirmed" = true) AND ("s"."required_fields_complete" = true) AND ("s"."required_assets_complete" = true) AND ("s"."guidance_reviewed" = true) AND ("s"."submission_package_status" = ANY (ARRAY['Ready for Review'::"text", 'Ready to Submit'::"text", 'Approved'::"text", 'Submitted'::"text"]))) THEN true
            ELSE false
        END AS "ready_to_submit",
        CASE
            WHEN ("s"."selection_status" = 'Submitted'::"text") THEN 'Wait for decision'::"text"
            WHEN ("s"."selection_status" = 'Accepted'::"text") THEN 'Prepare release plan'::"text"
            WHEN ("s"."selection_status" = 'Released'::"text") THEN 'Monitor release performance'::"text"
            WHEN ("s"."rights_confirmed" = false) THEN 'Confirm rights'::"text"
            WHEN ("s"."required_fields_complete" = false) THEN 'Complete required fields'::"text"
            WHEN ("s"."required_assets_complete" = false) THEN 'Complete required assets'::"text"
            WHEN ("s"."guidance_reviewed" = false) THEN 'Review destination guidance'::"text"
            WHEN ("s"."submission_package_status" = 'Not Started'::"text") THEN 'Start submission package'::"text"
            WHEN ("s"."submission_package_status" = 'In Progress'::"text") THEN 'Finish submission package'::"text"
            WHEN ("s"."submission_package_status" = 'Ready for Review'::"text") THEN 'Review before submit'::"text"
            WHEN ("s"."submission_package_status" = 'Ready to Submit'::"text") THEN 'Submit to destination'::"text"
            WHEN ("s"."submission_package_status" = 'Needs Revision'::"text") THEN 'Revise submission package'::"text"
            ELSE 'Monitor destination'::"text"
        END AS "next_destination_action",
    "concat_ws"('; '::"text",
        CASE
            WHEN ("s"."rights_confirmed" = false) THEN 'rights not confirmed'::"text"
            ELSE NULL::"text"
        END,
        CASE
            WHEN ("s"."required_fields_complete" = false) THEN 'required fields incomplete'::"text"
            ELSE NULL::"text"
        END,
        CASE
            WHEN ("s"."required_assets_complete" = false) THEN 'required assets incomplete'::"text"
            ELSE NULL::"text"
        END,
        CASE
            WHEN ("s"."guidance_reviewed" = false) THEN 'guidance not reviewed'::"text"
            ELSE NULL::"text"
        END) AS "readiness_gap_summary",
    "s"."creator_notes",
    "s"."internal_notes",
    "s"."created_at",
    "s"."updated_at"
   FROM ((("public"."project_destination_selections" "s"
     JOIN "public"."projects" "p" ON (("p"."id" = "s"."project_id")))
     JOIN "public"."distribution_destinations" "d" ON (("d"."id" = "s"."destination_id")))
     LEFT JOIN "public"."distribution_destination_summary_view" "dsv" ON (("dsv"."destination_id" = "s"."destination_id")))

-- statement 125 of 775
ALTER VIEW "public"."project_destination_summary_view" OWNER TO "postgres"

-- statement 126 of 775
CREATE OR REPLACE VIEW "public"."project_destination_action_queue_view" AS
 WITH "base" AS (
         SELECT "project_destination_summary_view"."project_destination_selection_id",
            "project_destination_summary_view"."project_id",
            "project_destination_summary_view"."title",
            "project_destination_summary_view"."destination_id",
            "project_destination_summary_view"."destination_name",
            "project_destination_summary_view"."destination_slug",
            "project_destination_summary_view"."destination_category",
            "project_destination_summary_view"."is_alleystreet",
            "project_destination_summary_view"."is_primary_destination",
            "project_destination_summary_view"."priority_order",
            "project_destination_summary_view"."selection_status",
            "project_destination_summary_view"."submission_package_status",
            "project_destination_summary_view"."creator_goal",
            "project_destination_summary_view"."release_strategy",
            "project_destination_summary_view"."rights_confirmed",
            "project_destination_summary_view"."required_fields_complete",
            "project_destination_summary_view"."required_assets_complete",
            "project_destination_summary_view"."guidance_reviewed",
            "project_destination_summary_view"."planned_submission_at",
            "project_destination_summary_view"."submitted_at",
            "project_destination_summary_view"."decision_received_at",
            "project_destination_summary_view"."target_release_at",
            "project_destination_summary_view"."field_mapping_rows",
            "project_destination_summary_view"."required_field_rows",
            "project_destination_summary_view"."asset_requirement_rows",
            "project_destination_summary_view"."required_asset_rows",
            "project_destination_summary_view"."required_field_keys",
            "project_destination_summary_view"."required_asset_keys",
            "project_destination_summary_view"."has_minimum_submission_structure",
            "project_destination_summary_view"."ready_to_submit",
            "project_destination_summary_view"."next_destination_action",
            "project_destination_summary_view"."readiness_gap_summary",
            "project_destination_summary_view"."creator_notes",
            "project_destination_summary_view"."internal_notes",
            "project_destination_summary_view"."created_at",
            "project_destination_summary_view"."updated_at"
           FROM "public"."project_destination_summary_view"
        ), "queue_rows" AS (
         SELECT "b"."project_id",
            "b"."title",
            "b"."destination_id",
            "b"."destination_name",
            "b"."destination_slug",
            "b"."destination_category",
            "b"."is_primary_destination",
            "b"."priority_order",
            'Rights'::"text" AS "queue_group",
            'CONFIRM_RIGHTS'::"text" AS "queue_code",
            'CRITICAL'::"text" AS "queue_priority",
            10 AS "priority_rank",
            'Confirm rights'::"text" AS "queue_title",
            'Confirm ownership, permissions, and release rights before submission work continues.'::"text" AS "queue_detail",
            "b"."planned_submission_at" AS "target_at",
            "b"."selection_status",
            "b"."submission_package_status",
            "b"."ready_to_submit",
            "b"."next_destination_action"
           FROM "base" "b"
          WHERE ("b"."rights_confirmed" = false)
        UNION ALL
         SELECT "b"."project_id",
            "b"."title",
            "b"."destination_id",
            "b"."destination_name",
            "b"."destination_slug",
            "b"."destination_category",
            "b"."is_primary_destination",
            "b"."priority_order",
            'Metadata'::"text" AS "queue_group",
            'COMPLETE_REQUIRED_FIELDS'::"text" AS "queue_code",
            'ATTENTION'::"text" AS "queue_priority",
            20 AS "priority_rank",
            'Complete required fields'::"text" AS "queue_title",
            'Required destination fields are incomplete and must be finished before submission.'::"text" AS "queue_detail",
            "b"."planned_submission_at" AS "target_at",
            "b"."selection_status",
            "b"."submission_package_status",
            "b"."ready_to_submit",
            "b"."next_destination_action"
           FROM "base" "b"
          WHERE ("b"."required_fields_complete" = false)
        UNION ALL
         SELECT "b"."project_id",
            "b"."title",
            "b"."destination_id",
            "b"."destination_name",
            "b"."destination_slug",
            "b"."destination_category",
            "b"."is_primary_destination",
            "b"."priority_order",
            'Assets'::"text" AS "queue_group",
            'COMPLETE_REQUIRED_ASSETS'::"text" AS "queue_code",
            'ATTENTION'::"text" AS "queue_priority",
            30 AS "priority_rank",
            'Complete required assets'::"text" AS "queue_title",
            'Required destination assets are incomplete and must be prepared before submission.'::"text" AS "queue_detail",
            "b"."planned_submission_at" AS "target_at",
            "b"."selection_status",
            "b"."submission_package_status",
            "b"."ready_to_submit",
            "b"."next_destination_action"
           FROM "base" "b"
          WHERE ("b"."required_assets_complete" = false)
        UNION ALL
         SELECT "b"."project_id",
            "b"."title",
            "b"."destination_id",
            "b"."destination_name",
            "b"."destination_slug",
            "b"."destination_category",
            "b"."is_primary_destination",
            "b"."priority_order",
            'Guidance'::"text" AS "queue_group",
            'REVIEW_DESTINATION_GUIDANCE'::"text" AS "queue_code",
            'WATCH'::"text" AS "queue_priority",
            40 AS "priority_rank",
            'Review destination guidance'::"text" AS "queue_title",
            'Destination requirements exist, but the guidance review flag is still incomplete.'::"text" AS "queue_detail",
            "b"."planned_submission_at" AS "target_at",
            "b"."selection_status",
            "b"."submission_package_status",
            "b"."ready_to_submit",
            "b"."next_destination_action"
           FROM "base" "b"
          WHERE ("b"."guidance_reviewed" = false)
        UNION ALL
         SELECT "b"."project_id",
            "b"."title",
            "b"."destination_id",
            "b"."destination_name",
            "b"."destination_slug",
            "b"."destination_category",
            "b"."is_primary_destination",
            "b"."priority_order",
            'Package'::"text" AS "queue_group",
            'START_SUBMISSION_PACKAGE'::"text" AS "queue_code",
            'WATCH'::"text" AS "queue_priority",
            50 AS "priority_rank",
            'Start submission package'::"text" AS "queue_title",
            'This destination is selected, but package preparation has not started yet.'::"text" AS "queue_detail",
            "b"."planned_submission_at" AS "target_at",
            "b"."selection_status",
            "b"."submission_package_status",
            "b"."ready_to_submit",
            "b"."next_destination_action"
           FROM "base" "b"
          WHERE (("b"."submission_package_status" = 'Not Started'::"text") AND ("b"."selection_status" = ANY (ARRAY['Selected'::"text", 'Preparing'::"text", 'Ready'::"text"])))
        UNION ALL
         SELECT "b"."project_id",
            "b"."title",
            "b"."destination_id",
            "b"."destination_name",
            "b"."destination_slug",
            "b"."destination_category",
            "b"."is_primary_destination",
            "b"."priority_order",
            'Package'::"text" AS "queue_group",
            'FINISH_SUBMISSION_PACKAGE'::"text" AS "queue_code",
            'ATTENTION'::"text" AS "queue_priority",
            60 AS "priority_rank",
            'Finish submission package'::"text" AS "queue_title",
            'Package work is in progress and needs completion before submission.'::"text" AS "queue_detail",
            "b"."planned_submission_at" AS "target_at",
            "b"."selection_status",
            "b"."submission_package_status",
            "b"."ready_to_submit",
            "b"."next_destination_action"
           FROM "base" "b"
          WHERE ("b"."submission_package_status" = 'In Progress'::"text")
        UNION ALL
         SELECT "b"."project_id",
            "b"."title",
            "b"."destination_id",
            "b"."destination_name",
            "b"."destination_slug",
            "b"."destination_category",
            "b"."is_primary_destination",
            "b"."priority_order",
            'Review'::"text" AS "queue_group",
            'REVIEW_BEFORE_SUBMIT'::"text" AS "queue_code",
            'ATTENTION'::"text" AS "queue_priority",
            70 AS "priority_rank",
            'Review before submit'::"text" AS "queue_title",
            'Package is ready for review and should be checked before submission.'::"text" AS "queue_detail",
            "b"."planned_submission_at" AS "target_at",
            "b"."selection_status",
            "b"."submission_package_status",
            "b"."ready_to_submit",
            "b"."next_destination_action"
           FROM "base" "b"
          WHERE ("b"."submission_package_status" = 'Ready for Review'::"text")
        UNION ALL
         SELECT "b"."project_id",
            "b"."title",
            "b"."destination_id",
            "b"."destination_name",
            "b"."destination_slug",
            "b"."destination_category",
            "b"."is_primary_destination",
            "b"."priority_order",
            'Submission'::"text" AS "queue_group",
            'SUBMIT_TO_DESTINATION'::"text" AS "queue_code",
                CASE
                    WHEN "b"."is_primary_destination" THEN 'ATTENTION'::"text"
                    ELSE 'WATCH'::"text"
                END AS "queue_priority",
                CASE
                    WHEN "b"."is_primary_destination" THEN 80
                    ELSE 90
                END AS "priority_rank",
            'Submit to destination'::"text" AS "queue_title",
            'This destination appears ready and can move into submission.'::"text" AS "queue_detail",
            "b"."planned_submission_at" AS "target_at",
            "b"."selection_status",
            "b"."submission_package_status",
            "b"."ready_to_submit",
            "b"."next_destination_action"
           FROM "base" "b"
          WHERE (("b"."ready_to_submit" = true) AND ("b"."selection_status" = ANY (ARRAY['Preparing'::"text", 'Ready'::"text", 'Selected'::"text"])) AND ("b"."submission_package_status" = ANY (ARRAY['Ready for Review'::"text", 'Ready to Submit'::"text", 'Approved'::"text"])))
        UNION ALL
         SELECT "b"."project_id",
            "b"."title",
            "b"."destination_id",
            "b"."destination_name",
            "b"."destination_slug",
            "b"."destination_category",
            "b"."is_primary_destination",
            "b"."priority_order",
            'Decision'::"text" AS "queue_group",
            'WAIT_FOR_DECISION'::"text" AS "queue_code",
            'WATCH'::"text" AS "queue_priority",
            100 AS "priority_rank",
            'Wait for decision'::"text" AS "queue_title",
            'Submission has been made and is awaiting a destination response.'::"text" AS "queue_detail",
            COALESCE("b"."decision_received_at", "b"."target_release_at", "b"."planned_submission_at") AS "target_at",
            "b"."selection_status",
            "b"."submission_package_status",
            "b"."ready_to_submit",
            "b"."next_destination_action"
           FROM "base" "b"
          WHERE ("b"."selection_status" = 'Submitted'::"text")
        UNION ALL
         SELECT "b"."project_id",
            "b"."title",
            "b"."destination_id",
            "b"."destination_name",
            "b"."destination_slug",
            "b"."destination_category",
            "b"."is_primary_destination",
            "b"."priority_order",
            'Release'::"text" AS "queue_group",
            'PREPARE_RELEASE_PLAN'::"text" AS "queue_code",
            'ATTENTION'::"text" AS "queue_priority",
            110 AS "priority_rank",
            'Prepare release plan'::"text" AS "queue_title",
            'The destination accepted the project and release planning should continue.'::"text" AS "queue_detail",
            "b"."target_release_at" AS "target_at",
            "b"."selection_status",
            "b"."submission_package_status",
            "b"."ready_to_submit",
            "b"."next_destination_action"
           FROM "base" "b"
          WHERE ("b"."selection_status" = 'Accepted'::"text")
        )
 SELECT "md5"(((((("project_id")::"text" || ':'::"text") || ("destination_id")::"text") || ':'::"text") || "queue_code")) AS "queue_key",
    "project_id",
    "title",
    "destination_id",
    "destination_name",
    "destination_slug",
    "destination_category",
    "is_primary_destination",
    "priority_order",
    "queue_group",
    "queue_code",
    "queue_priority",
    "priority_rank",
    "queue_title",
    "queue_detail",
    "target_at",
    "selection_status",
    "submission_package_status",
    "ready_to_submit",
    "next_destination_action"
   FROM "queue_rows"

-- statement 127 of 775
ALTER VIEW "public"."project_destination_action_queue_view" OWNER TO "postgres"

-- statement 128 of 775
CREATE OR REPLACE VIEW "public"."project_destination_action_queue_primary_view" AS
 SELECT DISTINCT ON ("project_id", "destination_name") "project_id",
    "title",
    "destination_name",
    "is_primary_destination",
    "queue_priority",
    "queue_group",
    "queue_code",
    "queue_title",
    "queue_key",
    "target_at",
    "priority_rank",
    "priority_order"
   FROM "public"."project_destination_action_queue_view"
  WHERE ("is_primary_destination" = true)
  ORDER BY "project_id", "destination_name", "priority_rank", "priority_order", "queue_priority", "queue_code"

-- statement 129 of 775
ALTER VIEW "public"."project_destination_action_queue_primary_view" OWNER TO "postgres"

-- statement 130 of 775
CREATE OR REPLACE VIEW "public"."project_destination_guidance_view" AS
 WITH "required_field_guidance" AS (
         SELECT "m"."destination_id",
            "count"(*) FILTER (WHERE (("m"."is_active" = true) AND ("m"."is_required" = true))) AS "required_field_rows",
            "string_agg"(('- '::"text" || "concat_ws"(' | '::"text", (("m"."source_field_label" || ' → '::"text") || "m"."destination_term"),
                CASE
                    WHEN (("m"."min_length" IS NOT NULL) OR ("m"."max_length" IS NOT NULL)) THEN ((('length: '::"text" || COALESCE(("m"."min_length")::"text", '?'::"text")) || ' to '::"text") || COALESCE(("m"."max_length")::"text", '?'::"text"))
                    ELSE NULL::"text"
                END, NULLIF("m"."formatting_rule", ''::"text"), NULLIF("m"."instruction_text", ''::"text"))), '
'::"text" ORDER BY "m"."display_order", "m"."source_field_key") FILTER (WHERE (("m"."is_active" = true) AND ("m"."is_required" = true))) AS "required_field_guidance"
           FROM "public"."destination_field_mappings" "m"
          GROUP BY "m"."destination_id"
        ), "required_asset_guidance" AS (
         SELECT "a"."destination_id",
            "count"(*) FILTER (WHERE (("a"."is_active" = true) AND ("a"."is_required" = true))) AS "required_asset_rows",
            "string_agg"(('- '::"text" || "concat_ws"(' | '::"text", ((("a"."asset_label" || ' ('::"text") || "a"."asset_key") || ')'::"text"),
                CASE
                    WHEN ("a"."accepted_file_types" IS NOT NULL) THEN ('types: '::"text" || "array_to_string"("a"."accepted_file_types", ', '::"text"))
                    ELSE NULL::"text"
                END,
                CASE
                    WHEN (("a"."min_files" IS NOT NULL) OR ("a"."max_files" IS NOT NULL)) THEN ((('files: '::"text" || COALESCE(("a"."min_files")::"text", '?'::"text")) || ' to '::"text") || COALESCE(("a"."max_files")::"text", '?'::"text"))
                    ELSE NULL::"text"
                END,
                CASE
                    WHEN (("a"."min_runtime_seconds" IS NOT NULL) OR ("a"."max_runtime_seconds" IS NOT NULL)) THEN ((('runtime sec: '::"text" || COALESCE(("a"."min_runtime_seconds")::"text", '?'::"text")) || ' to '::"text") || COALESCE(("a"."max_runtime_seconds")::"text", '?'::"text"))
                    ELSE NULL::"text"
                END,
                CASE
                    WHEN (("a"."min_image_width" IS NOT NULL) OR ("a"."min_image_height" IS NOT NULL)) THEN ((('min image: '::"text" || COALESCE(("a"."min_image_width")::"text", '?'::"text")) || 'x'::"text") || COALESCE(("a"."min_image_height")::"text", '?'::"text"))
                    ELSE NULL::"text"
                END,
                CASE
                    WHEN ("a"."max_file_size_mb" IS NOT NULL) THEN ('max size mb: '::"text" || ("a"."max_file_size_mb")::"text")
                    ELSE NULL::"text"
                END, NULLIF("a"."delivery_rule", ''::"text"), NULLIF("a"."instruction_text", ''::"text"))), '
'::"text" ORDER BY "a"."display_order", "a"."asset_key") FILTER (WHERE (("a"."is_active" = true) AND ("a"."is_required" = true))) AS "required_asset_guidance"
           FROM "public"."destination_asset_requirements" "a"
          GROUP BY "a"."destination_id"
        )
 SELECT "pds"."project_destination_selection_id",
    "pds"."project_id",
    "pds"."title",
    "pds"."destination_id",
    "pds"."destination_name",
    "pds"."destination_slug",
    "pds"."destination_category",
    "pds"."is_alleystreet",
    "pds"."is_primary_destination",
    "pds"."priority_order",
    "pds"."selection_status",
    "pds"."submission_package_status",
    "pds"."release_strategy",
    "pds"."rights_confirmed",
    "pds"."required_fields_complete",
    "pds"."required_assets_complete",
    "pds"."guidance_reviewed",
    "pds"."ready_to_submit",
    "pds"."next_destination_action",
    "pds"."readiness_gap_summary",
    "pds"."planned_submission_at",
    "pds"."target_release_at",
    "pds"."required_field_keys",
    "pds"."required_asset_keys",
    COALESCE("rfg"."required_field_rows", (0)::bigint) AS "guidance_required_field_rows",
    COALESCE("rag"."required_asset_rows", (0)::bigint) AS "guidance_required_asset_rows",
    "rfg"."required_field_guidance",
    "rag"."required_asset_guidance",
        CASE
            WHEN ("pds"."rights_confirmed" = false) THEN 'Resolve rights first'::"text"
            WHEN ("pds"."guidance_reviewed" = false) THEN 'Review destination guidance'::"text"
            WHEN ("pds"."required_fields_complete" = false) THEN 'Complete destination fields'::"text"
            WHEN ("pds"."required_assets_complete" = false) THEN 'Prepare destination assets'::"text"
            WHEN ("pds"."ready_to_submit" = true) THEN 'Submit to destination'::"text"
            ELSE "pds"."next_destination_action"
        END AS "guidance_stage",
        CASE
            WHEN ("pds"."ready_to_submit" = true) THEN (('Ready to submit to '::"text" || "pds"."destination_name") || '.'::"text")
            WHEN (("pds"."readiness_gap_summary" IS NOT NULL) AND ("pds"."readiness_gap_summary" <> ''::"text")) THEN (('Not ready yet: '::"text" || "pds"."readiness_gap_summary") || '.'::"text")
            ELSE 'Continue destination preparation.'::"text"
        END AS "readiness_message",
    "concat_ws"('

'::"text", (('Truth rule: Enter the project truth once. Adapt the format to '::"text" || "pds"."destination_name") || ' without changing the facts.'::"text"),
        CASE
            WHEN ("rfg"."required_field_guidance" IS NOT NULL) THEN (('Required fields:'::"text" || '
'::"text") || "rfg"."required_field_guidance")
            ELSE NULL::"text"
        END,
        CASE
            WHEN ("rag"."required_asset_guidance" IS NOT NULL) THEN (('Required assets:'::"text" || '
'::"text") || "rag"."required_asset_guidance")
            ELSE NULL::"text"
        END, ('Next step: '::"text" || COALESCE(
        CASE
            WHEN ("pds"."rights_confirmed" = false) THEN 'Confirm rights.'::"text"
            WHEN ("pds"."required_fields_complete" = false) THEN 'Complete required fields.'::"text"
            WHEN ("pds"."required_assets_complete" = false) THEN 'Complete required assets.'::"text"
            WHEN ("pds"."guidance_reviewed" = false) THEN 'Review destination guidance.'::"text"
            WHEN ("pds"."ready_to_submit" = true) THEN (('Submit to '::"text" || "pds"."destination_name") || '.'::"text")
            ELSE ("pds"."next_destination_action" || '.'::"text")
        END, 'Monitor destination.'::"text"))) AS "destination_guidance_text"
   FROM (("public"."project_destination_summary_view" "pds"
     LEFT JOIN "required_field_guidance" "rfg" ON (("rfg"."destination_id" = "pds"."destination_id")))
     LEFT JOIN "required_asset_guidance" "rag" ON (("rag"."destination_id" = "pds"."destination_id")))

-- statement 131 of 775
ALTER VIEW "public"."project_destination_guidance_view" OWNER TO "postgres"

-- statement 132 of 775
CREATE OR REPLACE VIEW "public"."project_destination_submission_prep_view" AS
 SELECT "project_id",
    "title",
    "destination_name",
    "ready_to_submit",
    "guidance_stage",
    "next_destination_action",
    "readiness_gap_summary",
    "destination_guidance_text",
    "priority_order",
        CASE
            WHEN (COALESCE("ready_to_submit", false) = true) THEN 'Submission package is ready for final review and upload.'::"text"
            WHEN (COALESCE("readiness_gap_summary", ''::"text") = ''::"text") THEN 'Review destination requirements and complete any remaining submission items.'::"text"
            ELSE "concat"('Complete outstanding readiness items before submission: ', "readiness_gap_summary")
        END AS "submission_prep_notes",
        CASE
            WHEN (("lower"(COALESCE("destination_name", ''::"text")) ~~ '%netflix%'::"text") OR ("lower"(COALESCE("destination_name", ''::"text")) ~~ '%prime%'::"text") OR ("lower"(COALESCE("destination_name", ''::"text")) ~~ '%amazon%'::"text") OR ("lower"(COALESCE("destination_name", ''::"text")) ~~ '%hulu%'::"text") OR ("lower"(COALESCE("destination_name", ''::"text")) ~~ '%tubi%'::"text") OR ("lower"(COALESCE("destination_name", ''::"text")) ~~ '%stream%'::"text")) THEN 'Prepare master video file, artwork, synopsis, metadata, captions/subtitles if required, and rights/supporting documents.'::"text"
            WHEN ("lower"(COALESCE("destination_name", ''::"text")) ~~ '%festival%'::"text") THEN 'Prepare screener, synopsis, stills, runtime, credits, premiere-status details, and festival submission materials.'::"text"
            WHEN (("lower"(COALESCE("destination_name", ''::"text")) ~~ '%theatr%'::"text") OR ("lower"(COALESCE("destination_name", ''::"text")) ~~ '%cinema%'::"text")) THEN 'Prepare exhibition-ready master, poster/artwork, synopsis, trailer materials, and release-supporting documents.'::"text"
            ELSE 'Prepare the required project assets, metadata, and supporting documents for the selected destination.'::"text"
        END AS "upload_instruction_text",
        CASE
            WHEN (COALESCE("ready_to_submit", false) = true) THEN "concat"('Next step: ', COALESCE("next_destination_action", 'begin destination submission'::"text"), '.')
            ELSE "concat"('Not ready yet. Resolve the listed gaps, then return to submission prep for ', COALESCE("destination_name", 'this destination'::"text"), '.')
        END AS "submission_instruction_text"
   FROM "public"."project_destination_guidance_view" "g"
  ORDER BY "project_id", "priority_order", "destination_name"

-- statement 133 of 775
ALTER VIEW "public"."project_destination_submission_prep_view" OWNER TO "postgres"

-- statement 134 of 775
CREATE OR REPLACE VIEW "public"."project_destination_submission_package_view" AS
 WITH "prep" AS (
         SELECT "s"."project_id",
            "s"."title",
            "s"."destination_name",
            "s"."ready_to_submit",
            "s"."guidance_stage",
            "s"."next_destination_action",
            "s"."readiness_gap_summary",
            "s"."destination_guidance_text",
            "s"."priority_order",
            "s"."submission_prep_notes",
            "s"."upload_instruction_text",
            "s"."submission_instruction_text"
           FROM "public"."project_destination_submission_prep_view" "s"
        ), "queue" AS (
         SELECT "q"."project_id",
            "q"."destination_name",
            "q"."queue_code",
            "q"."queue_title"
           FROM "public"."project_destination_action_queue_primary_view" "q"
        ), "final" AS (
         SELECT "p"."project_id",
            "p"."title",
            "p"."destination_name",
            "p"."priority_order",
            "p"."guidance_stage",
            "p"."ready_to_submit",
                CASE
                    WHEN (COALESCE("p"."ready_to_submit", false) = true) THEN 'package_ready'::"text"
                    WHEN (COALESCE("p"."readiness_gap_summary", ''::"text") = ''::"text") THEN 'package_in_progress'::"text"
                    ELSE 'package_incomplete'::"text"
                END AS "submission_package_status",
                CASE
                    WHEN (COALESCE("p"."ready_to_submit", false) = true) THEN 'Ready for upload / submission review.'::"text"
                    WHEN (COALESCE("p"."readiness_gap_summary", ''::"text") = ''::"text") THEN 'Submission package is being assembled.'::"text"
                    ELSE "concat"('Package still missing required readiness items: ', "p"."readiness_gap_summary")
                END AS "package_status_note",
                CASE
                    WHEN (COALESCE("p"."ready_to_submit", false) = true) THEN 'Core destination submission package appears included from current readiness state.'::"text"
                    ELSE 'Submission package is not fully included yet because readiness is still incomplete.'::"text"
                END AS "included_assets_summary",
                CASE
                    WHEN (COALESCE("p"."ready_to_submit", false) = true) THEN 'No blocking package gaps identified at this stage.'::"text"
                    WHEN (COALESCE("p"."readiness_gap_summary", ''::"text") = ''::"text") THEN 'Final destination-specific review may still be needed before upload.'::"text"
                    ELSE "p"."readiness_gap_summary"
                END AS "missing_assets_summary",
                CASE
                    WHEN (COALESCE("p"."ready_to_submit", false) = true) THEN 'Supporting submission guidance is available and ready for final operator review.'::"text"
                    ELSE 'Supporting package guidance exists, but final submission support is not yet complete.'::"text"
                END AS "included_documents_summary",
                CASE
                    WHEN (COALESCE("p"."ready_to_submit", false) = true) THEN 'No blocking document gaps identified from the current guidance layer.'::"text"
                    WHEN (COALESCE("p"."readiness_gap_summary", ''::"text") = ''::"text") THEN 'Check destination-specific documentation before final upload.'::"text"
                    ELSE "concat"('Resolve documentation/readiness gaps before submission: ', "p"."readiness_gap_summary")
                END AS "missing_documents_summary",
            "p"."submission_prep_notes",
            "p"."upload_instruction_text",
            "p"."submission_instruction_text",
            COALESCE("q"."queue_code", "p"."next_destination_action", 'begin submission package review'::"text") AS "next_destination_action",
                CASE
                    WHEN (COALESCE("p"."ready_to_submit", false) = true) THEN 'upload_ready'::"text"
                    WHEN (COALESCE("p"."readiness_gap_summary", ''::"text") = ''::"text") THEN 'awaiting_final_review'::"text"
                    ELSE 'blocked'::"text"
                END AS "upload_state",
                CASE
                    WHEN (COALESCE("p"."ready_to_submit", false) = true) THEN 'submission_ready'::"text"
                    WHEN (COALESCE("p"."readiness_gap_summary", ''::"text") = ''::"text") THEN 'submission_in_progress'::"text"
                    ELSE 'not_ready'::"text"
                END AS "submission_state",
            "p"."destination_guidance_text",
            "q"."queue_title"
           FROM ("prep" "p"
             LEFT JOIN "queue" "q" ON ((("q"."project_id" = "p"."project_id") AND ("q"."destination_name" = "p"."destination_name"))))
        )
 SELECT "project_id",
    "title",
    "destination_name",
    "priority_order",
    "guidance_stage",
    "ready_to_submit",
    "submission_package_status",
    "package_status_note",
    "included_assets_summary",
    "missing_assets_summary",
    "included_documents_summary",
    "missing_documents_summary",
    "submission_prep_notes",
    "upload_instruction_text",
    "submission_instruction_text",
    "next_destination_action",
    "upload_state",
    "submission_state",
    "destination_guidance_text",
    "queue_title"
   FROM "final"
  ORDER BY "project_id", "priority_order", "destination_name"

-- statement 135 of 775
ALTER VIEW "public"."project_destination_submission_package_view" OWNER TO "postgres"

-- statement 136 of 775
CREATE OR REPLACE VIEW "public"."project_destination_final_readiness_view" AS
 WITH "pkg" AS (
         SELECT "p"."project_id",
            "p"."title",
            "p"."destination_name",
            "p"."priority_order",
            "p"."guidance_stage",
            "p"."ready_to_submit",
            "p"."submission_package_status",
            "p"."package_status_note",
            "p"."included_assets_summary",
            "p"."missing_assets_summary",
            "p"."included_documents_summary",
            "p"."missing_documents_summary",
            "p"."submission_prep_notes",
            "p"."upload_instruction_text",
            "p"."submission_instruction_text",
            "p"."next_destination_action",
            "p"."upload_state",
            "p"."submission_state",
            "p"."destination_guidance_text"
           FROM "public"."project_destination_submission_package_view" "p"
        ), "final" AS (
         SELECT "pkg"."project_id",
            "pkg"."title",
            "pkg"."destination_name",
            "pkg"."priority_order",
            "pkg"."guidance_stage",
            "pkg"."ready_to_submit",
            "pkg"."submission_package_status",
            "pkg"."package_status_note",
            "pkg"."upload_state",
            "pkg"."submission_state",
                CASE
                    WHEN ((COALESCE("pkg"."ready_to_submit", false) = true) AND (COALESCE("pkg"."upload_state", ''::"text") = 'upload_ready'::"text") AND (COALESCE("pkg"."submission_state", ''::"text") = 'submission_ready'::"text")) THEN true
                    ELSE false
                END AS "final_submission_ready",
                CASE
                    WHEN ((COALESCE("pkg"."ready_to_submit", false) = true) AND (COALESCE("pkg"."upload_state", ''::"text") = 'upload_ready'::"text") AND (COALESCE("pkg"."submission_state", ''::"text") = 'submission_ready'::"text")) THEN 'ready_for_final_submission'::"text"
                    WHEN (COALESCE("pkg"."submission_package_status", ''::"text") = 'package_in_progress'::"text") THEN 'pending_final_review'::"text"
                    ELSE 'blocked_before_submission'::"text"
                END AS "final_readiness_status",
                CASE
                    WHEN ((COALESCE("pkg"."ready_to_submit", false) = true) AND (COALESCE("pkg"."upload_state", ''::"text") = 'upload_ready'::"text") AND (COALESCE("pkg"."submission_state", ''::"text") = 'submission_ready'::"text")) THEN 'Destination package is ready for final submission and release handoff.'::"text"
                    WHEN (COALESCE("pkg"."submission_package_status", ''::"text") = 'package_in_progress'::"text") THEN 'Package is close, but still needs final operator review before submission.'::"text"
                    ELSE 'Destination is not ready for final submission yet.'::"text"
                END AS "final_readiness_note",
                CASE
                    WHEN ((COALESCE("pkg"."ready_to_submit", false) = true) AND (COALESCE("pkg"."upload_state", ''::"text") = 'upload_ready'::"text") AND (COALESCE("pkg"."submission_state", ''::"text") = 'submission_ready'::"text")) THEN 'No blocking submission gaps remain.'::"text"
                    WHEN ((COALESCE("pkg"."missing_assets_summary", ''::"text") <> ''::"text") AND (COALESCE("pkg"."missing_documents_summary", ''::"text") <> ''::"text")) THEN "concat"("pkg"."missing_assets_summary", ' ', "pkg"."missing_documents_summary")
                    WHEN (COALESCE("pkg"."missing_assets_summary", ''::"text") <> ''::"text") THEN "pkg"."missing_assets_summary"
                    WHEN (COALESCE("pkg"."missing_documents_summary", ''::"text") <> ''::"text") THEN "pkg"."missing_documents_summary"
                    ELSE 'Final operator review still required.'::"text"
                END AS "final_blocker_summary",
                CASE
                    WHEN ((COALESCE("pkg"."ready_to_submit", false) = true) AND (COALESCE("pkg"."upload_state", ''::"text") = 'upload_ready'::"text") AND (COALESCE("pkg"."submission_state", ''::"text") = 'submission_ready'::"text")) THEN 'Proceed to final submission and release handoff.'::"text"
                    WHEN (COALESCE("pkg"."submission_package_status", ''::"text") = 'package_in_progress'::"text") THEN 'Complete final package review and confirm destination delivery.'::"text"
                    ELSE 'Resolve remaining package and readiness blockers before final submission.'::"text"
                END AS "operator_handoff_instruction",
                CASE
                    WHEN ((COALESCE("pkg"."ready_to_submit", false) = true) AND (COALESCE("pkg"."upload_state", ''::"text") = 'upload_ready'::"text") AND (COALESCE("pkg"."submission_state", ''::"text") = 'submission_ready'::"text")) THEN 'handoff_to_release'::"text"
                    WHEN (COALESCE("pkg"."submission_package_status", ''::"text") = 'package_in_progress'::"text") THEN 'final_review_required'::"text"
                    ELSE 'hold_submission'::"text"
                END AS "release_handoff_state",
                CASE
                    WHEN ((COALESCE("pkg"."ready_to_submit", false) = true) AND (COALESCE("pkg"."upload_state", ''::"text") = 'upload_ready'::"text") AND (COALESCE("pkg"."submission_state", ''::"text") = 'submission_ready'::"text")) THEN 'final_submit_now'::"text"
                    WHEN (COALESCE("pkg"."submission_package_status", ''::"text") = 'package_in_progress'::"text") THEN 'review_and_confirm'::"text"
                    ELSE 'resolve_blockers'::"text"
                END AS "next_handoff_action",
            "pkg"."included_assets_summary",
            "pkg"."missing_assets_summary",
            "pkg"."included_documents_summary",
            "pkg"."missing_documents_summary",
            "pkg"."submission_prep_notes",
            "pkg"."upload_instruction_text",
            "pkg"."submission_instruction_text",
            "pkg"."next_destination_action",
            "pkg"."destination_guidance_text"
           FROM "pkg"
        )
 SELECT "project_id",
    "title",
    "destination_name",
    "priority_order",
    "guidance_stage",
    "ready_to_submit",
    "submission_package_status",
    "package_status_note",
    "upload_state",
    "submission_state",
    "final_submission_ready",
    "final_readiness_status",
    "final_readiness_note",
    "final_blocker_summary",
    "operator_handoff_instruction",
    "release_handoff_state",
    "next_handoff_action",
    "included_assets_summary",
    "missing_assets_summary",
    "included_documents_summary",
    "missing_documents_summary",
    "submission_prep_notes",
    "upload_instruction_text",
    "submission_instruction_text",
    "next_destination_action",
    "destination_guidance_text"
   FROM "final"
  ORDER BY "project_id", "priority_order", "destination_name"

-- statement 137 of 775
ALTER VIEW "public"."project_destination_final_readiness_view" OWNER TO "postgres"

-- statement 138 of 775
CREATE OR REPLACE VIEW "public"."project_destination_submission_release_action_view" AS
 WITH "final_ready" AS (
         SELECT "f"."project_id",
            "f"."title",
            "f"."destination_name",
            "f"."priority_order",
            "f"."guidance_stage",
            "f"."ready_to_submit",
            "f"."submission_package_status",
            "f"."package_status_note",
            "f"."upload_state",
            "f"."submission_state",
            "f"."final_submission_ready",
            "f"."final_readiness_status",
            "f"."final_readiness_note",
            "f"."final_blocker_summary",
            "f"."operator_handoff_instruction",
            "f"."release_handoff_state",
            "f"."next_handoff_action",
            "f"."included_assets_summary",
            "f"."missing_assets_summary",
            "f"."included_documents_summary",
            "f"."missing_documents_summary",
            "f"."submission_prep_notes",
            "f"."upload_instruction_text",
            "f"."submission_instruction_text",
            "f"."next_destination_action",
            "f"."destination_guidance_text"
           FROM "public"."project_destination_final_readiness_view" "f"
        ), "final" AS (
         SELECT "fr"."project_id",
            "fr"."title",
            "fr"."destination_name",
            "fr"."priority_order",
            "fr"."guidance_stage",
            "fr"."ready_to_submit",
            "fr"."submission_package_status",
            "fr"."final_submission_ready",
            "fr"."final_readiness_status",
            "fr"."release_handoff_state",
                CASE
                    WHEN (COALESCE("fr"."final_submission_ready", false) = true) THEN 'submit_and_handoff'::"text"
                    WHEN (COALESCE("fr"."final_readiness_status", ''::"text") = 'pending_final_review'::"text") THEN 'review_before_submit'::"text"
                    ELSE 'hold_and_fix'::"text"
                END AS "action_status",
                CASE
                    WHEN (COALESCE("fr"."final_submission_ready", false) = true) THEN 'Project destination is cleared for submission and release handoff.'::"text"
                    WHEN (COALESCE("fr"."final_readiness_status", ''::"text") = 'pending_final_review'::"text") THEN 'Project destination needs final review before submission.'::"text"
                    ELSE 'Project destination is blocked and must be corrected before submission.'::"text"
                END AS "action_status_note",
                CASE
                    WHEN (COALESCE("fr"."final_submission_ready", false) = true) THEN 'Submit package now and hand off to release operations.'::"text"
                    WHEN (COALESCE("fr"."final_readiness_status", ''::"text") = 'pending_final_review'::"text") THEN 'Review final package details and confirm destination requirements.'::"text"
                    ELSE 'Hold submission and resolve blockers.'::"text"
                END AS "primary_operator_action",
                CASE
                    WHEN (COALESCE("fr"."final_submission_ready", false) = true) THEN 'release_handoff_ready'::"text"
                    WHEN (COALESCE("fr"."final_readiness_status", ''::"text") = 'pending_final_review'::"text") THEN 'awaiting_operator_review'::"text"
                    ELSE 'blocked'::"text"
                END AS "operator_action_state",
                CASE
                    WHEN (COALESCE("fr"."final_submission_ready", false) = true) THEN 'final_submit_now'::"text"
                    WHEN (COALESCE("fr"."final_readiness_status", ''::"text") = 'pending_final_review'::"text") THEN 'review_and_confirm'::"text"
                    ELSE 'resolve_blockers_first'::"text"
                END AS "recommended_next_step",
            "fr"."final_readiness_note",
            "fr"."final_blocker_summary",
            "fr"."operator_handoff_instruction",
            "fr"."next_handoff_action",
            "fr"."package_status_note",
            "fr"."upload_state",
            "fr"."submission_state",
            "fr"."included_assets_summary",
            "fr"."missing_assets_summary",
            "fr"."included_documents_summary",
            "fr"."missing_documents_summary",
            "fr"."submission_prep_notes",
            "fr"."upload_instruction_text",
            "fr"."submission_instruction_text",
            "fr"."next_destination_action",
            "fr"."destination_guidance_text"
           FROM "final_ready" "fr"
        )
 SELECT "project_id",
    "title",
    "destination_name",
    "priority_order",
    "guidance_stage",
    "ready_to_submit",
    "submission_package_status",
    "final_submission_ready",
    "final_readiness_status",
    "release_handoff_state",
    "action_status",
    "action_status_note",
    "primary_operator_action",
    "operator_action_state",
    "recommended_next_step",
    "final_readiness_note",
    "final_blocker_summary",
    "operator_handoff_instruction",
    "next_handoff_action",
    "package_status_note",
    "upload_state",
    "submission_state",
    "included_assets_summary",
    "missing_assets_summary",
    "included_documents_summary",
    "missing_documents_summary",
    "submission_prep_notes",
    "upload_instruction_text",
    "submission_instruction_text",
    "next_destination_action",
    "destination_guidance_text"
   FROM "final"
  ORDER BY "project_id", "priority_order", "destination_name"

-- statement 139 of 775
ALTER VIEW "public"."project_destination_submission_release_action_view" OWNER TO "postgres"

-- statement 140 of 775
CREATE OR REPLACE VIEW "public"."project_destination_submission_release_dashboard_view" AS
 WITH "action_view" AS (
         SELECT "a"."project_id",
            "a"."title",
            "a"."destination_name",
            "a"."priority_order",
            "a"."guidance_stage",
            "a"."ready_to_submit",
            "a"."submission_package_status",
            "a"."final_submission_ready",
            "a"."final_readiness_status",
            "a"."release_handoff_state",
            "a"."action_status",
            "a"."action_status_note",
            "a"."primary_operator_action",
            "a"."operator_action_state",
            "a"."recommended_next_step",
            "a"."final_readiness_note",
            "a"."final_blocker_summary",
            "a"."operator_handoff_instruction",
            "a"."next_handoff_action",
            "a"."package_status_note",
            "a"."upload_state",
            "a"."submission_state",
            "a"."included_assets_summary",
            "a"."missing_assets_summary",
            "a"."included_documents_summary",
            "a"."missing_documents_summary",
            "a"."submission_prep_notes",
            "a"."upload_instruction_text",
            "a"."submission_instruction_text",
            "a"."next_destination_action",
            "a"."destination_guidance_text"
           FROM "public"."project_destination_submission_release_action_view" "a"
        ), "project_rollup" AS (
         SELECT "action_view"."project_id",
            "max"("action_view"."title") AS "title",
            "count"(*) AS "destination_count",
            "count"(*) FILTER (WHERE (COALESCE("action_view"."final_submission_ready", false) = true)) AS "ready_destination_count",
            "count"(*) FILTER (WHERE (COALESCE("action_view"."final_submission_ready", false) = false)) AS "blocked_destination_count",
            "count"(*) FILTER (WHERE (COALESCE("action_view"."action_status", ''::"text") = 'review_before_submit'::"text")) AS "review_destination_count",
            "count"(*) FILTER (WHERE (COALESCE("action_view"."release_handoff_state", ''::"text") = 'handoff_to_release'::"text")) AS "handoff_ready_count"
           FROM "action_view"
          GROUP BY "action_view"."project_id"
        ), "final" AS (
         SELECT "av"."project_id",
            "av"."title",
            "av"."destination_name",
            "av"."priority_order",
            "pr"."destination_count",
            "pr"."ready_destination_count",
            "pr"."blocked_destination_count",
            "pr"."review_destination_count",
            "pr"."handoff_ready_count",
                CASE
                    WHEN (("pr"."destination_count" > 0) AND ("pr"."ready_destination_count" = "pr"."destination_count")) THEN 'all_destinations_ready'::"text"
                    WHEN (("pr"."ready_destination_count" > 0) AND ("pr"."blocked_destination_count" > 0)) THEN 'mixed_readiness'::"text"
                    WHEN ("pr"."review_destination_count" > 0) THEN 'review_in_progress'::"text"
                    ELSE 'blocked'::"text"
                END AS "dashboard_status",
                CASE
                    WHEN (COALESCE("av"."final_submission_ready", false) = true) THEN 'ready'::"text"
                    WHEN (COALESCE("av"."action_status", ''::"text") = 'review_before_submit'::"text") THEN 'review'::"text"
                    ELSE 'blocked'::"text"
                END AS "destination_dashboard_state",
                CASE
                    WHEN (COALESCE("av"."final_submission_ready", false) = true) THEN 'Destination is ready for final submission and release handoff.'::"text"
                    WHEN (COALESCE("av"."action_status", ''::"text") = 'review_before_submit'::"text") THEN 'Destination is in final review before submission.'::"text"
                    ELSE 'Destination is blocked before submission.'::"text"
                END AS "destination_dashboard_note",
                CASE
                    WHEN (("pr"."destination_count" > 0) AND ("pr"."ready_destination_count" = "pr"."destination_count")) THEN 'All selected destinations are ready.'::"text"
                    WHEN (("pr"."ready_destination_count" > 0) AND ("pr"."blocked_destination_count" > 0)) THEN "concat"("pr"."ready_destination_count", ' destination(s) ready, ', "pr"."blocked_destination_count", ' still blocked.')
                    WHEN ("pr"."review_destination_count" > 0) THEN "concat"("pr"."review_destination_count", ' destination(s) awaiting final review.')
                    ELSE 'No destinations are fully ready yet.'::"text"
                END AS "project_dashboard_summary",
            "av"."guidance_stage",
            "av"."ready_to_submit",
            "av"."submission_package_status",
            "av"."final_submission_ready",
            "av"."final_readiness_status",
            "av"."release_handoff_state",
            "av"."action_status",
            "av"."action_status_note",
            "av"."primary_operator_action",
            "av"."operator_action_state",
            "av"."recommended_next_step",
            "av"."final_readiness_note",
            "av"."final_blocker_summary",
            "av"."operator_handoff_instruction",
            "av"."next_handoff_action",
            "av"."package_status_note",
            "av"."upload_state",
            "av"."submission_state",
            "av"."included_assets_summary",
            "av"."missing_assets_summary",
            "av"."included_documents_summary",
            "av"."missing_documents_summary",
            "av"."submission_prep_notes",
            "av"."upload_instruction_text",
            "av"."submission_instruction_text",
            "av"."next_destination_action",
            "av"."destination_guidance_text"
           FROM ("action_view" "av"
             LEFT JOIN "project_rollup" "pr" ON (("pr"."project_id" = "av"."project_id")))
        )
 SELECT "project_id",
    "title",
    "destination_name",
    "priority_order",
    "destination_count",
    "ready_destination_count",
    "blocked_destination_count",
    "review_destination_count",
    "handoff_ready_count",
    "dashboard_status",
    "destination_dashboard_state",
    "destination_dashboard_note",
    "project_dashboard_summary",
    "guidance_stage",
    "ready_to_submit",
    "submission_package_status",
    "final_submission_ready",
    "final_readiness_status",
    "release_handoff_state",
    "action_status",
    "action_status_note",
    "primary_operator_action",
    "operator_action_state",
    "recommended_next_step",
    "final_readiness_note",
    "final_blocker_summary",
    "operator_handoff_instruction",
    "next_handoff_action",
    "package_status_note",
    "upload_state",
    "submission_state",
    "included_assets_summary",
    "missing_assets_summary",
    "included_documents_summary",
    "missing_documents_summary",
    "submission_prep_notes",
    "upload_instruction_text",
    "submission_instruction_text",
    "next_destination_action",
    "destination_guidance_text"
   FROM "final"
  ORDER BY "project_id", "priority_order", "destination_name"

-- statement 141 of 775
ALTER VIEW "public"."project_destination_submission_release_dashboard_view" OWNER TO "postgres"

-- statement 142 of 775
CREATE OR REPLACE VIEW "public"."project_destination_operator_workboard_view" AS
 WITH "dash" AS (
         SELECT "d"."project_id",
            "d"."title",
            "d"."destination_name",
            "d"."priority_order",
            "d"."destination_count",
            "d"."ready_destination_count",
            "d"."blocked_destination_count",
            "d"."review_destination_count",
            "d"."handoff_ready_count",
            "d"."dashboard_status",
            "d"."destination_dashboard_state",
            "d"."destination_dashboard_note",
            "d"."project_dashboard_summary",
            "d"."guidance_stage",
            "d"."ready_to_submit",
            "d"."submission_package_status",
            "d"."final_submission_ready",
            "d"."final_readiness_status",
            "d"."release_handoff_state",
            "d"."action_status",
            "d"."action_status_note",
            "d"."primary_operator_action",
            "d"."operator_action_state",
            "d"."recommended_next_step",
            "d"."final_readiness_note",
            "d"."final_blocker_summary",
            "d"."operator_handoff_instruction",
            "d"."next_handoff_action",
            "d"."package_status_note",
            "d"."upload_state",
            "d"."submission_state",
            "d"."included_assets_summary",
            "d"."missing_assets_summary",
            "d"."included_documents_summary",
            "d"."missing_documents_summary",
            "d"."submission_prep_notes",
            "d"."upload_instruction_text",
            "d"."submission_instruction_text",
            "d"."next_destination_action",
            "d"."destination_guidance_text"
           FROM "public"."project_destination_submission_release_dashboard_view" "d"
        ), "final" AS (
         SELECT "dash"."project_id",
            "dash"."title",
            "dash"."destination_name",
            "dash"."priority_order",
                CASE
                    WHEN (COALESCE("dash"."final_submission_ready", false) = true) THEN 'ready_now'::"text"
                    WHEN (COALESCE("dash"."destination_dashboard_state", ''::"text") = 'review'::"text") THEN 'review_now'::"text"
                    ELSE 'fix_now'::"text"
                END AS "operator_lane",
                CASE
                    WHEN (COALESCE("dash"."final_submission_ready", false) = true) THEN 1
                    WHEN (COALESCE("dash"."destination_dashboard_state", ''::"text") = 'review'::"text") THEN 2
                    ELSE 3
                END AS "operator_lane_order",
                CASE
                    WHEN (COALESCE("dash"."final_submission_ready", false) = true) THEN 'Submit now'::"text"
                    WHEN (COALESCE("dash"."destination_dashboard_state", ''::"text") = 'review'::"text") THEN 'Review now'::"text"
                    ELSE 'Resolve blockers'::"text"
                END AS "operator_card_label",
                CASE
                    WHEN (COALESCE("dash"."final_submission_ready", false) = true) THEN 'Destination is cleared for final submission and release handoff.'::"text"
                    WHEN (COALESCE("dash"."destination_dashboard_state", ''::"text") = 'review'::"text") THEN 'Destination needs final operator review before submission.'::"text"
                    ELSE 'Destination is blocked and needs correction before it can move forward.'::"text"
                END AS "operator_card_note",
                CASE
                    WHEN (COALESCE("dash"."final_submission_ready", false) = true) THEN 'Execute final submission, confirm destination acceptance, and hand off to release.'::"text"
                    WHEN (COALESCE("dash"."destination_dashboard_state", ''::"text") = 'review'::"text") THEN 'Perform final review of package, metadata, and destination requirements.'::"text"
                    ELSE 'Resolve missing package, document, or readiness issues before review.'::"text"
                END AS "operator_work_instruction",
                CASE
                    WHEN (COALESCE("dash"."final_submission_ready", false) = true) THEN 'high'::"text"
                    WHEN (COALESCE("dash"."destination_dashboard_state", ''::"text") = 'review'::"text") THEN 'medium'::"text"
                    ELSE 'critical'::"text"
                END AS "operator_priority_band",
                CASE
                    WHEN (COALESCE("dash"."final_submission_ready", false) = true) THEN 'submission_execution'::"text"
                    WHEN (COALESCE("dash"."destination_dashboard_state", ''::"text") = 'review'::"text") THEN 'final_review'::"text"
                    ELSE 'blocker_resolution'::"text"
                END AS "operator_work_type",
                CASE
                    WHEN (COALESCE("dash"."final_submission_ready", false) = true) THEN COALESCE("dash"."next_handoff_action", 'final_submit_now'::"text")
                    WHEN (COALESCE("dash"."destination_dashboard_state", ''::"text") = 'review'::"text") THEN COALESCE("dash"."recommended_next_step", 'review_and_confirm'::"text")
                    ELSE COALESCE("dash"."recommended_next_step", 'resolve_blockers_first'::"text")
                END AS "operator_next_step",
                CASE
                    WHEN (COALESCE("dash"."final_submission_ready", false) = true) THEN 'release_handoff_ready'::"text"
                    WHEN (COALESCE("dash"."destination_dashboard_state", ''::"text") = 'review'::"text") THEN 'awaiting_review'::"text"
                    ELSE 'blocked'::"text"
                END AS "operator_board_state",
            "dash"."destination_count",
            "dash"."ready_destination_count",
            "dash"."blocked_destination_count",
            "dash"."review_destination_count",
            "dash"."handoff_ready_count",
            "dash"."dashboard_status",
            "dash"."destination_dashboard_state",
            "dash"."destination_dashboard_note",
            "dash"."project_dashboard_summary",
            "dash"."guidance_stage",
            "dash"."ready_to_submit",
            "dash"."submission_package_status",
            "dash"."final_submission_ready",
            "dash"."final_readiness_status",
            "dash"."release_handoff_state",
            "dash"."action_status",
            "dash"."action_status_note",
            "dash"."primary_operator_action",
            "dash"."operator_action_state",
            "dash"."recommended_next_step",
            "dash"."final_readiness_note",
            "dash"."final_blocker_summary",
            "dash"."operator_handoff_instruction",
            "dash"."next_handoff_action",
            "dash"."package_status_note",
            "dash"."upload_state",
            "dash"."submission_state",
            "dash"."included_assets_summary",
            "dash"."missing_assets_summary",
            "dash"."included_documents_summary",
            "dash"."missing_documents_summary",
            "dash"."submission_prep_notes",
            "dash"."upload_instruction_text",
            "dash"."submission_instruction_text",
            "dash"."next_destination_action",
            "dash"."destination_guidance_text"
           FROM "dash"
        )
 SELECT "project_id",
    "title",
    "destination_name",
    "priority_order",
    "operator_lane",
    "operator_lane_order",
    "operator_card_label",
    "operator_card_note",
    "operator_work_instruction",
    "operator_priority_band",
    "operator_work_type",
    "operator_next_step",
    "operator_board_state",
    "destination_count",
    "ready_destination_count",
    "blocked_destination_count",
    "review_destination_count",
    "handoff_ready_count",
    "dashboard_status",
    "destination_dashboard_state",
    "destination_dashboard_note",
    "project_dashboard_summary",
    "guidance_stage",
    "ready_to_submit",
    "submission_package_status",
    "final_submission_ready",
    "final_readiness_status",
    "release_handoff_state",
    "action_status",
    "action_status_note",
    "primary_operator_action",
    "operator_action_state",
    "recommended_next_step",
    "final_readiness_note",
    "final_blocker_summary",
    "operator_handoff_instruction",
    "next_handoff_action",
    "package_status_note",
    "upload_state",
    "submission_state",
    "included_assets_summary",
    "missing_assets_summary",
    "included_documents_summary",
    "missing_documents_summary",
    "submission_prep_notes",
    "upload_instruction_text",
    "submission_instruction_text",
    "next_destination_action",
    "destination_guidance_text"
   FROM "final"
  ORDER BY "operator_lane_order", "project_id", "priority_order", "destination_name"

-- statement 143 of 775
ALTER VIEW "public"."project_destination_operator_workboard_view" OWNER TO "postgres"

-- statement 144 of 775
CREATE OR REPLACE VIEW "public"."project_destination_final_delivery_queue_view" AS
 WITH "workboard" AS (
         SELECT "w"."project_id",
            "w"."title",
            "w"."destination_name",
            "w"."priority_order",
            "w"."operator_lane",
            "w"."operator_lane_order",
            "w"."operator_card_label",
            "w"."operator_card_note",
            "w"."operator_work_instruction",
            "w"."operator_priority_band",
            "w"."operator_work_type",
            "w"."operator_next_step",
            "w"."operator_board_state",
            "w"."destination_count",
            "w"."ready_destination_count",
            "w"."blocked_destination_count",
            "w"."review_destination_count",
            "w"."handoff_ready_count",
            "w"."dashboard_status",
            "w"."destination_dashboard_state",
            "w"."destination_dashboard_note",
            "w"."project_dashboard_summary",
            "w"."guidance_stage",
            "w"."ready_to_submit",
            "w"."submission_package_status",
            "w"."final_submission_ready",
            "w"."final_readiness_status",
            "w"."release_handoff_state",
            "w"."action_status",
            "w"."action_status_note",
            "w"."primary_operator_action",
            "w"."operator_action_state",
            "w"."recommended_next_step",
            "w"."final_readiness_note",
            "w"."final_blocker_summary",
            "w"."operator_handoff_instruction",
            "w"."next_handoff_action",
            "w"."package_status_note",
            "w"."upload_state",
            "w"."submission_state",
            "w"."included_assets_summary",
            "w"."missing_assets_summary",
            "w"."included_documents_summary",
            "w"."missing_documents_summary",
            "w"."submission_prep_notes",
            "w"."upload_instruction_text",
            "w"."submission_instruction_text",
            "w"."next_destination_action",
            "w"."destination_guidance_text"
           FROM "public"."project_destination_operator_workboard_view" "w"
        ), "final" AS (
         SELECT "w"."project_id",
            "w"."title",
            "w"."destination_name",
            "w"."priority_order",
                CASE
                    WHEN (COALESCE("w"."final_submission_ready", false) = true) THEN 'ready_for_delivery'::"text"
                    WHEN (COALESCE("w"."operator_lane", ''::"text") = 'review_now'::"text") THEN 'review_before_delivery'::"text"
                    ELSE 'blocked_before_delivery'::"text"
                END AS "delivery_queue_status",
                CASE
                    WHEN (COALESCE("w"."final_submission_ready", false) = true) THEN 1
                    WHEN (COALESCE("w"."operator_lane", ''::"text") = 'review_now'::"text") THEN 2
                    ELSE 3
                END AS "delivery_queue_order",
                CASE
                    WHEN (COALESCE("w"."final_submission_ready", false) = true) THEN 'Send to destination'::"text"
                    WHEN (COALESCE("w"."operator_lane", ''::"text") = 'review_now'::"text") THEN 'Review before send'::"text"
                    ELSE 'Fix before send'::"text"
                END AS "delivery_queue_label",
                CASE
                    WHEN (COALESCE("w"."final_submission_ready", false) = true) THEN 'Destination package is ready to be delivered and handed off.'::"text"
                    WHEN (COALESCE("w"."operator_lane", ''::"text") = 'review_now'::"text") THEN 'Destination package is close, but requires final review before delivery.'::"text"
                    ELSE 'Destination package is blocked and cannot be delivered yet.'::"text"
                END AS "delivery_queue_note",
                CASE
                    WHEN (COALESCE("w"."final_submission_ready", false) = true) THEN 'Submit package, confirm destination receipt, and move into release tracking.'::"text"
                    WHEN (COALESCE("w"."operator_lane", ''::"text") = 'review_now'::"text") THEN 'Review final package details, confirm metadata, and clear for delivery.'::"text"
                    ELSE 'Resolve blockers before destination delivery can proceed.'::"text"
                END AS "delivery_operator_instruction",
                CASE
                    WHEN (COALESCE("w"."final_submission_ready", false) = true) THEN 'deliver_now'::"text"
                    WHEN (COALESCE("w"."operator_lane", ''::"text") = 'review_now'::"text") THEN 'review_then_deliver'::"text"
                    ELSE 'hold_delivery'::"text"
                END AS "delivery_next_step",
                CASE
                    WHEN (COALESCE("w"."final_submission_ready", false) = true) THEN 'delivery_ready'::"text"
                    WHEN (COALESCE("w"."operator_lane", ''::"text") = 'review_now'::"text") THEN 'awaiting_delivery_review'::"text"
                    ELSE 'delivery_blocked'::"text"
                END AS "delivery_board_state",
            "w"."operator_lane",
            "w"."operator_lane_order",
            "w"."operator_card_label",
            "w"."operator_card_note",
            "w"."operator_work_instruction",
            "w"."operator_priority_band",
            "w"."operator_work_type",
            "w"."operator_next_step",
            "w"."operator_board_state",
            "w"."destination_count",
            "w"."ready_destination_count",
            "w"."blocked_destination_count",
            "w"."review_destination_count",
            "w"."handoff_ready_count",
            "w"."dashboard_status",
            "w"."destination_dashboard_state",
            "w"."destination_dashboard_note",
            "w"."project_dashboard_summary",
            "w"."guidance_stage",
            "w"."ready_to_submit",
            "w"."submission_package_status",
            "w"."final_submission_ready",
            "w"."final_readiness_status",
            "w"."release_handoff_state",
            "w"."action_status",
            "w"."action_status_note",
            "w"."primary_operator_action",
            "w"."operator_action_state",
            "w"."recommended_next_step",
            "w"."final_readiness_note",
            "w"."final_blocker_summary",
            "w"."operator_handoff_instruction",
            "w"."next_handoff_action",
            "w"."package_status_note",
            "w"."upload_state",
            "w"."submission_state",
            "w"."included_assets_summary",
            "w"."missing_assets_summary",
            "w"."included_documents_summary",
            "w"."missing_documents_summary",
            "w"."submission_prep_notes",
            "w"."upload_instruction_text",
            "w"."submission_instruction_text",
            "w"."next_destination_action",
            "w"."destination_guidance_text"
           FROM "workboard" "w"
        )
 SELECT "project_id",
    "title",
    "destination_name",
    "priority_order",
    "delivery_queue_status",
    "delivery_queue_order",
    "delivery_queue_label",
    "delivery_queue_note",
    "delivery_operator_instruction",
    "delivery_next_step",
    "delivery_board_state",
    "operator_lane",
    "operator_lane_order",
    "operator_card_label",
    "operator_card_note",
    "operator_work_instruction",
    "operator_priority_band",
    "operator_work_type",
    "operator_next_step",
    "operator_board_state",
    "destination_count",
    "ready_destination_count",
    "blocked_destination_count",
    "review_destination_count",
    "handoff_ready_count",
    "dashboard_status",
    "destination_dashboard_state",
    "destination_dashboard_note",
    "project_dashboard_summary",
    "guidance_stage",
    "ready_to_submit",
    "submission_package_status",
    "final_submission_ready",
    "final_readiness_status",
    "release_handoff_state",
    "action_status",
    "action_status_note",
    "primary_operator_action",
    "operator_action_state",
    "recommended_next_step",
    "final_readiness_note",
    "final_blocker_summary",
    "operator_handoff_instruction",
    "next_handoff_action",
    "package_status_note",
    "upload_state",
    "submission_state",
    "included_assets_summary",
    "missing_assets_summary",
    "included_documents_summary",
    "missing_documents_summary",
    "submission_prep_notes",
    "upload_instruction_text",
    "submission_instruction_text",
    "next_destination_action",
    "destination_guidance_text"
   FROM "final"
  ORDER BY "delivery_queue_order", "project_id", "priority_order", "destination_name"

-- statement 145 of 775
ALTER VIEW "public"."project_destination_final_delivery_queue_view" OWNER TO "postgres"

-- statement 146 of 775
CREATE TABLE IF NOT EXISTS "public"."project_distribution_release_tracking" (
    "id" bigint NOT NULL,
    "project_id" bigint NOT NULL,
    "destination_id" bigint NOT NULL,
    "submission_packet_id" bigint,
    "approval_decision_id" bigint,
    "release_status" "text" DEFAULT 'Planned'::"text" NOT NULL,
    "release_type" "text",
    "platform_label" "text",
    "territory_scope" "text",
    "scheduled_release_at" timestamp with time zone,
    "actual_release_at" timestamp with time zone,
    "release_url" "text",
    "release_notes" "text",
    "internal_notes" "text",
    "public_visible" boolean DEFAULT false NOT NULL,
    "active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
)

-- statement 147 of 775
ALTER TABLE "public"."project_distribution_release_tracking" OWNER TO "postgres"

-- statement 148 of 775
CREATE TABLE IF NOT EXISTS "public"."project_monetization_tracking" (
    "id" bigint NOT NULL,
    "project_id" bigint NOT NULL,
    "destination_id" bigint NOT NULL,
    "release_tracking_id" bigint,
    "revenue_stream_type" "text" NOT NULL,
    "monetization_status" "text" DEFAULT 'Planned'::"text" NOT NULL,
    "agreement_type" "text",
    "currency_code" "text" DEFAULT 'USD'::"text" NOT NULL,
    "gross_revenue" numeric(12,2) DEFAULT 0.00 NOT NULL,
    "platform_fees" numeric(12,2) DEFAULT 0.00 NOT NULL,
    "distribution_fees" numeric(12,2) DEFAULT 0.00 NOT NULL,
    "other_costs" numeric(12,2) DEFAULT 0.00 NOT NULL,
    "net_revenue" numeric(12,2) DEFAULT 0.00 NOT NULL,
    "creator_share_amount" numeric(12,2) DEFAULT 0.00 NOT NULL,
    "alleystreet_share_amount" numeric(12,2) DEFAULT 0.00 NOT NULL,
    "creator_share_pct" numeric(5,2),
    "alleystreet_share_pct" numeric(5,2),
    "first_revenue_at" timestamp with time zone,
    "last_revenue_at" timestamp with time zone,
    "payout_due_at" timestamp with time zone,
    "payout_sent_at" timestamp with time zone,
    "revenue_notes" "text",
    "internal_notes" "text",
    "active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
)

-- statement 149 of 775
ALTER TABLE "public"."project_monetization_tracking" OWNER TO "postgres"

-- statement 150 of 775
CREATE TABLE IF NOT EXISTS "public"."project_rights_tracking" (
    "id" bigint NOT NULL,
    "project_id" bigint NOT NULL,
    "rights_check_item_id" bigint NOT NULL,
    "required_for_this_project" boolean DEFAULT false NOT NULL,
    "completed" boolean DEFAULT false NOT NULL,
    "approved" boolean DEFAULT false NOT NULL,
    "evidence_url" "text",
    "evidence_file_name" "text",
    "notes" "text",
    "review_notes" "text",
    "completed_at" timestamp with time zone,
    "approved_at" timestamp with time zone,
    "active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
)

-- statement 151 of 775
ALTER TABLE "public"."project_rights_tracking" OWNER TO "postgres"

-- statement 152 of 775
CREATE TABLE IF NOT EXISTS "public"."project_submission_review_log" (
    "id" bigint NOT NULL,
    "submission_packet_id" bigint NOT NULL,
    "project_id" bigint NOT NULL,
    "review_stage" "text" NOT NULL,
    "review_action" "text" NOT NULL,
    "review_status" "text" NOT NULL,
    "decision_summary" "text",
    "review_notes" "text",
    "requested_changes" "text",
    "reviewer_label" "text",
    "reviewed_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "internal_only" boolean DEFAULT true NOT NULL,
    "active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
)

-- statement 153 of 775
ALTER TABLE "public"."project_submission_review_log" OWNER TO "postgres"

-- statement 154 of 775
CREATE OR REPLACE VIEW "public"."project_destination_release_outcome_view" AS
 WITH "base" AS (
         SELECT "s"."project_destination_selection_id",
            "s"."project_id",
            "s"."title",
            "s"."destination_id",
            "s"."destination_name",
            "s"."destination_slug",
            "s"."destination_category",
            "s"."is_alleystreet",
            "s"."is_primary_destination",
            "s"."priority_order",
            "s"."selection_status",
            "s"."creator_goal",
            "s"."release_strategy",
            "s"."rights_confirmed",
            "s"."required_fields_complete",
            "s"."required_assets_complete",
            "s"."guidance_reviewed",
            "s"."planned_submission_at",
            "s"."submitted_at",
            "s"."decision_received_at",
            "s"."target_release_at",
            "s"."ready_to_submit",
            "s"."next_destination_action",
            "s"."readiness_gap_summary",
            "s"."creator_notes",
            "s"."internal_notes",
            "s"."created_at",
            "s"."updated_at"
           FROM "public"."project_destination_summary_view" "s"
        ), "rt" AS (
         SELECT "r"."project_id",
            "r"."destination_id",
            "r"."submission_packet_id",
            "r"."approval_decision_id",
            "r"."release_status",
            "r"."release_type",
            "r"."platform_label",
            "r"."territory_scope",
            "r"."scheduled_release_at",
            "r"."actual_release_at",
            "r"."release_url",
            "r"."release_notes",
            "r"."internal_notes" AS "release_internal_notes",
            "r"."public_visible",
            "r"."active" AS "release_tracking_active"
           FROM "public"."project_distribution_release_tracking" "r"
        ), "fr" AS (
         SELECT "f"."project_id",
            "f"."destination_name",
            "f"."guidance_stage",
            "f"."ready_to_submit",
            "f"."submission_package_status",
            "f"."package_status_note",
            "f"."upload_state",
            "f"."submission_state",
            "f"."final_submission_ready",
            "f"."final_readiness_status",
            "f"."final_readiness_note",
            "f"."final_blocker_summary",
            "f"."operator_handoff_instruction",
            "f"."release_handoff_state",
            "f"."next_handoff_action",
            "f"."included_assets_summary",
            "f"."missing_assets_summary",
            "f"."included_documents_summary",
            "f"."missing_documents_summary",
            "f"."submission_prep_notes",
            "f"."upload_instruction_text",
            "f"."submission_instruction_text",
            "f"."next_destination_action" AS "readiness_next_destination_action",
            "f"."destination_guidance_text"
           FROM "public"."project_destination_final_readiness_view" "f"
        ), "ra" AS (
         SELECT "a"."project_id",
            "a"."destination_name",
            "a"."action_status",
            "a"."action_status_note",
            "a"."primary_operator_action",
            "a"."operator_action_state",
            "a"."recommended_next_step"
           FROM "public"."project_destination_submission_release_action_view" "a"
        ), "rd" AS (
         SELECT "d"."project_id",
            "d"."destination_name",
            "d"."destination_count",
            "d"."ready_destination_count",
            "d"."blocked_destination_count",
            "d"."review_destination_count",
            "d"."handoff_ready_count",
            "d"."dashboard_status",
            "d"."destination_dashboard_state",
            "d"."destination_dashboard_note",
            "d"."project_dashboard_summary"
           FROM "public"."project_destination_submission_release_dashboard_view" "d"
        ), "fd" AS (
         SELECT "q"."project_id",
            "q"."destination_name",
            "q"."delivery_queue_status",
            "q"."delivery_queue_order",
            "q"."delivery_queue_label",
            "q"."delivery_queue_note",
            "q"."delivery_operator_instruction",
            "q"."delivery_next_step",
            "q"."delivery_board_state",
            "q"."operator_lane",
            "q"."operator_lane_order",
            "q"."operator_card_label",
            "q"."operator_card_note",
            "q"."operator_work_instruction",
            "q"."operator_priority_band",
            "q"."operator_work_type",
            "q"."operator_next_step",
            "q"."operator_board_state"
           FROM "public"."project_destination_final_delivery_queue_view" "q"
        ), "rights_rollup" AS (
         SELECT "r"."project_id",
            "count"(*) FILTER (WHERE COALESCE("r"."required_for_this_project", false)) AS "rights_required_count",
            "count"(*) FILTER (WHERE (COALESCE("r"."required_for_this_project", false) AND COALESCE("r"."completed", false))) AS "rights_completed_count",
            "count"(*) FILTER (WHERE (COALESCE("r"."required_for_this_project", false) AND COALESCE("r"."approved", false))) AS "rights_approved_count"
           FROM "public"."project_rights_tracking" "r"
          WHERE COALESCE("r"."active", true)
          GROUP BY "r"."project_id"
        ), "deliverable_rollup" AS (
         SELECT "d"."project_id",
            "count"(*) FILTER (WHERE COALESCE("d"."required_for_this_project", false)) AS "deliverables_required_count",
            "count"(*) FILTER (WHERE (COALESCE("d"."required_for_this_project", false) AND COALESCE("d"."completed", false))) AS "deliverables_completed_count",
            "count"(*) FILTER (WHERE (COALESCE("d"."required_for_this_project", false) AND COALESCE("d"."approved", false))) AS "deliverables_approved_count"
           FROM "public"."project_deliverable_tracking" "d"
          WHERE COALESCE("d"."active", true)
          GROUP BY "d"."project_id"
        ), "monetization_rollup" AS (
         SELECT "m"."project_id",
            "m"."destination_id",
            "max"("m"."monetization_status") AS "monetization_status",
            "sum"(COALESCE("m"."gross_revenue", (0)::numeric)) AS "gross_revenue",
            "sum"(COALESCE("m"."net_revenue", (0)::numeric)) AS "net_revenue",
            "max"("m"."first_revenue_at") AS "first_revenue_at",
            "max"("m"."last_revenue_at") AS "last_revenue_at",
            "max"("m"."payout_due_at") AS "payout_due_at",
            "max"("m"."payout_sent_at") AS "payout_sent_at"
           FROM "public"."project_monetization_tracking" "m"
          WHERE COALESCE("m"."active", true)
          GROUP BY "m"."project_id", "m"."destination_id"
        ), "review_rollup" AS (
         SELECT "l"."project_id",
            "l"."submission_packet_id",
            "max"("l"."review_stage") AS "latest_review_stage",
            "max"("l"."review_action") AS "latest_review_action",
            "max"("l"."review_status") AS "latest_review_status",
            "max"("l"."decision_summary") AS "latest_decision_summary",
            "max"("l"."reviewed_at") AS "latest_reviewed_at"
           FROM "public"."project_submission_review_log" "l"
          WHERE COALESCE("l"."active", true)
          GROUP BY "l"."project_id", "l"."submission_packet_id"
        )
 SELECT "b"."project_destination_selection_id",
    "b"."project_id",
    "b"."title",
    "b"."destination_id",
    "b"."destination_name",
    "b"."destination_slug",
    "b"."destination_category",
    "b"."is_alleystreet",
    "b"."is_primary_destination",
    "b"."priority_order",
    "b"."selection_status",
    "rt"."submission_packet_id",
    "rt"."approval_decision_id",
    "rt"."release_status",
    "rt"."release_type",
    "rt"."platform_label",
    "rt"."territory_scope",
    "rt"."scheduled_release_at",
    "rt"."actual_release_at",
    "rt"."release_url",
    "rt"."public_visible",
    "rt"."release_tracking_active",
    "fr"."guidance_stage",
    "fr"."ready_to_submit",
    "fr"."submission_package_status",
    "fr"."package_status_note",
    "fr"."upload_state",
    "fr"."submission_state",
    "fr"."final_submission_ready",
    "fr"."final_readiness_status",
    "fr"."final_readiness_note",
    "fr"."final_blocker_summary",
    "fr"."operator_handoff_instruction",
    "fr"."release_handoff_state",
    "fr"."next_handoff_action",
    "fr"."included_assets_summary",
    "fr"."missing_assets_summary",
    "fr"."included_documents_summary",
    "fr"."missing_documents_summary",
    "fr"."submission_prep_notes",
    "fr"."upload_instruction_text",
    "fr"."submission_instruction_text",
    "fr"."readiness_next_destination_action",
    "fr"."destination_guidance_text",
    "ra"."action_status",
    "ra"."action_status_note",
    "ra"."primary_operator_action",
    "ra"."operator_action_state",
    "ra"."recommended_next_step",
    "rd"."dashboard_status",
    "rd"."destination_dashboard_state",
    "rd"."destination_dashboard_note",
    "rd"."project_dashboard_summary",
    "rd"."destination_count",
    "rd"."ready_destination_count",
    "rd"."blocked_destination_count",
    "rd"."review_destination_count",
    "rd"."handoff_ready_count",
    "fd"."delivery_queue_status",
    "fd"."delivery_queue_order",
    "fd"."delivery_queue_label",
    "fd"."delivery_queue_note",
    "fd"."delivery_operator_instruction",
    "fd"."delivery_next_step",
    "fd"."delivery_board_state",
    "fd"."operator_lane",
    "fd"."operator_lane_order",
    "fd"."operator_card_label",
    "fd"."operator_card_note",
    "fd"."operator_work_instruction",
    "fd"."operator_priority_band",
    "fd"."operator_work_type",
    "fd"."operator_next_step",
    "fd"."operator_board_state",
    "rr"."rights_required_count",
    "rr"."rights_completed_count",
    "rr"."rights_approved_count",
    "dr"."deliverables_required_count",
    "dr"."deliverables_completed_count",
    "dr"."deliverables_approved_count",
    "mr"."monetization_status",
    "mr"."gross_revenue",
    "mr"."net_revenue",
    "mr"."first_revenue_at",
    "mr"."last_revenue_at",
    "mr"."payout_due_at",
    "mr"."payout_sent_at",
    "rv"."latest_review_stage",
    "rv"."latest_review_action",
    "rv"."latest_review_status",
    "rv"."latest_decision_summary",
    "rv"."latest_reviewed_at",
        CASE
            WHEN ("rt"."actual_release_at" IS NOT NULL) THEN 'released'::"text"
            WHEN ("lower"(COALESCE("rt"."release_status", ''::"text")) = 'scheduled'::"text") THEN 'scheduled'::"text"
            WHEN ("lower"(COALESCE("rt"."release_status", ''::"text")) = 'planned'::"text") THEN 'planned'::"text"
            WHEN ("lower"(COALESCE("fr"."release_handoff_state", ''::"text")) = ANY (ARRAY['withdrawn'::"text", 'cancelled'::"text", 'canceled'::"text"])) THEN 'withdrawn'::"text"
            WHEN ("lower"(COALESCE("fr"."submission_package_status", ''::"text")) = ANY (ARRAY['rejected'::"text", 'declined'::"text"])) THEN 'rejected'::"text"
            WHEN ("lower"(COALESCE("ra"."action_status", ''::"text")) = ANY (ARRAY['blocked'::"text", 'error'::"text"])) THEN 'blocked'::"text"
            WHEN (COALESCE("fr"."final_submission_ready", false) = false) THEN 'incomplete'::"text"
            WHEN (COALESCE("fr"."final_submission_ready", false) = true) THEN 'ready_for_release'::"text"
            ELSE 'in_progress'::"text"
        END AS "outcome_label",
        CASE
            WHEN ("rt"."actual_release_at" IS NOT NULL) THEN 'Actual release timestamp present'::"text"
            WHEN ("lower"(COALESCE("rt"."release_status", ''::"text")) = 'scheduled'::"text") THEN 'Release scheduled'::"text"
            WHEN ("lower"(COALESCE("rt"."release_status", ''::"text")) = 'planned'::"text") THEN 'Release path planned'::"text"
            WHEN ("lower"(COALESCE("fr"."release_handoff_state", ''::"text")) = ANY (ARRAY['withdrawn'::"text", 'cancelled'::"text", 'canceled'::"text"])) THEN 'Release handoff withdrawn'::"text"
            WHEN ("lower"(COALESCE("fr"."submission_package_status", ''::"text")) = ANY (ARRAY['rejected'::"text", 'declined'::"text"])) THEN COALESCE("fr"."package_status_note", 'Submission rejected'::"text")
            WHEN ("lower"(COALESCE("ra"."action_status", ''::"text")) = ANY (ARRAY['blocked'::"text", 'error'::"text"])) THEN COALESCE("ra"."action_status_note", 'Blocked by action state'::"text")
            WHEN (COALESCE("fr"."final_submission_ready", false) = false) THEN COALESCE("fr"."final_blocker_summary", 'Requirements incomplete'::"text")
            WHEN (COALESCE("fr"."final_submission_ready", false) = true) THEN 'Ready for release handoff'::"text"
            ELSE COALESCE("ra"."recommended_next_step", "b"."next_destination_action", 'Continue workflow'::"text")
        END AS "outcome_reason",
    COALESCE("rt"."actual_release_at", "rt"."scheduled_release_at", "b"."target_release_at") AS "outcome_effective_at"
   FROM ((((((((("base" "b"
     LEFT JOIN "rt" ON ((("rt"."project_id" = "b"."project_id") AND ("rt"."destination_id" = "b"."destination_id"))))
     LEFT JOIN "fr" ON ((("fr"."project_id" = "b"."project_id") AND ("fr"."destination_name" = "b"."destination_name"))))
     LEFT JOIN "ra" ON ((("ra"."project_id" = "b"."project_id") AND ("ra"."destination_name" = "b"."destination_name"))))
     LEFT JOIN "rd" ON ((("rd"."project_id" = "b"."project_id") AND ("rd"."destination_name" = "b"."destination_name"))))
     LEFT JOIN "fd" ON ((("fd"."project_id" = "b"."project_id") AND ("fd"."destination_name" = "b"."destination_name"))))
     LEFT JOIN "rights_rollup" "rr" ON (("rr"."project_id" = "b"."project_id")))
     LEFT JOIN "deliverable_rollup" "dr" ON (("dr"."project_id" = "b"."project_id")))
     LEFT JOIN "monetization_rollup" "mr" ON ((("mr"."project_id" = "b"."project_id") AND ("mr"."destination_id" = "b"."destination_id"))))
     LEFT JOIN "review_rollup" "rv" ON ((("rv"."project_id" = "b"."project_id") AND ("rv"."submission_packet_id" = "rt"."submission_packet_id"))))

-- statement 155 of 775
ALTER VIEW "public"."project_destination_release_outcome_view" OWNER TO "postgres"

-- statement 156 of 775
CREATE OR REPLACE VIEW "public"."project_destination_master_lifecycle_view" AS
 WITH "base" AS (
         SELECT "s"."project_destination_selection_id",
            "s"."project_id",
            "s"."title",
            "s"."destination_id",
            "s"."destination_name",
            "s"."destination_slug",
            "s"."destination_category",
            "s"."is_alleystreet",
            "s"."is_primary_destination",
            "s"."priority_order",
            "s"."selection_status",
            "s"."creator_goal",
            "s"."release_strategy",
            "s"."rights_confirmed",
            "s"."required_fields_complete",
            "s"."required_assets_complete",
            "s"."guidance_reviewed",
            "s"."planned_submission_at",
            "s"."submitted_at",
            "s"."decision_received_at",
            "s"."target_release_at",
            "s"."field_mapping_rows",
            "s"."required_field_rows",
            "s"."asset_requirement_rows",
            "s"."required_asset_rows",
            "s"."required_field_keys",
            "s"."required_asset_keys",
            "s"."has_minimum_submission_structure",
            "s"."ready_to_submit",
            "s"."next_destination_action",
            "s"."readiness_gap_summary",
            "s"."creator_notes",
            "s"."internal_notes",
            "s"."created_at",
            "s"."updated_at"
           FROM "public"."project_destination_summary_view" "s"
        ), "ro" AS (
         SELECT "r"."project_destination_selection_id",
            "r"."project_id",
            "r"."destination_id",
            "r"."submission_packet_id",
            "r"."approval_decision_id",
            "r"."release_status",
            "r"."release_type",
            "r"."platform_label",
            "r"."territory_scope",
            "r"."scheduled_release_at",
            "r"."actual_release_at",
            "r"."release_url",
            "r"."public_visible",
            "r"."release_tracking_active",
            "r"."guidance_stage",
            "r"."ready_to_submit" AS "release_ready_to_submit",
            "r"."submission_package_status",
            "r"."package_status_note",
            "r"."upload_state",
            "r"."submission_state",
            "r"."final_submission_ready",
            "r"."final_readiness_status",
            "r"."final_readiness_note",
            "r"."final_blocker_summary",
            "r"."operator_handoff_instruction",
            "r"."release_handoff_state",
            "r"."next_handoff_action",
            "r"."included_assets_summary",
            "r"."missing_assets_summary",
            "r"."included_documents_summary",
            "r"."missing_documents_summary",
            "r"."submission_prep_notes",
            "r"."upload_instruction_text",
            "r"."submission_instruction_text",
            "r"."readiness_next_destination_action",
            "r"."destination_guidance_text",
            "r"."action_status",
            "r"."action_status_note",
            "r"."primary_operator_action",
            "r"."operator_action_state",
            "r"."recommended_next_step",
            "r"."dashboard_status",
            "r"."destination_dashboard_state",
            "r"."destination_dashboard_note",
            "r"."project_dashboard_summary",
            "r"."destination_count",
            "r"."ready_destination_count",
            "r"."blocked_destination_count",
            "r"."review_destination_count",
            "r"."handoff_ready_count",
            "r"."delivery_queue_status",
            "r"."delivery_queue_order",
            "r"."delivery_queue_label",
            "r"."delivery_queue_note",
            "r"."delivery_operator_instruction",
            "r"."delivery_next_step",
            "r"."delivery_board_state",
            "r"."operator_lane",
            "r"."operator_lane_order",
            "r"."operator_card_label",
            "r"."operator_card_note",
            "r"."operator_work_instruction",
            "r"."operator_priority_band",
            "r"."operator_work_type",
            "r"."operator_next_step",
            "r"."operator_board_state",
            "r"."rights_required_count",
            "r"."rights_completed_count",
            "r"."rights_approved_count",
            "r"."deliverables_required_count",
            "r"."deliverables_completed_count",
            "r"."deliverables_approved_count",
            "r"."monetization_status",
            "r"."gross_revenue",
            "r"."net_revenue",
            "r"."first_revenue_at",
            "r"."last_revenue_at",
            "r"."payout_due_at",
            "r"."payout_sent_at",
            "r"."latest_review_stage",
            "r"."latest_review_action",
            "r"."latest_review_status",
            "r"."latest_decision_summary",
            "r"."latest_reviewed_at",
            "r"."outcome_label",
            "r"."outcome_reason",
            "r"."outcome_effective_at"
           FROM "public"."project_destination_release_outcome_view" "r"
        ), "joined" AS (
         SELECT "b"."project_destination_selection_id",
            "b"."project_id",
            "b"."title",
            "b"."destination_id",
            "b"."destination_name",
            "b"."destination_slug",
            "b"."destination_category",
            "b"."is_alleystreet",
            "b"."is_primary_destination",
            "b"."priority_order",
            "b"."selection_status",
            "b"."creator_goal",
            "b"."release_strategy",
            "b"."rights_confirmed",
            "b"."required_fields_complete",
            "b"."required_assets_complete",
            "b"."guidance_reviewed",
            "b"."planned_submission_at",
            "b"."submitted_at",
            "b"."decision_received_at",
            "b"."target_release_at",
            "b"."field_mapping_rows",
            "b"."required_field_rows",
            "b"."asset_requirement_rows",
            "b"."required_asset_rows",
            "b"."required_field_keys",
            "b"."required_asset_keys",
            "b"."has_minimum_submission_structure",
            "b"."ready_to_submit",
            "b"."next_destination_action",
            "b"."readiness_gap_summary",
            "b"."creator_notes",
            "b"."internal_notes",
            "b"."created_at",
            "b"."updated_at",
            "ro"."submission_packet_id",
            "ro"."approval_decision_id",
            "ro"."release_status",
            "ro"."release_type",
            "ro"."platform_label",
            "ro"."territory_scope",
            "ro"."scheduled_release_at",
            "ro"."actual_release_at",
            "ro"."release_url",
            "ro"."public_visible",
            "ro"."release_tracking_active",
            "ro"."guidance_stage",
            "ro"."release_ready_to_submit",
            "ro"."submission_package_status",
            "ro"."package_status_note",
            "ro"."upload_state",
            "ro"."submission_state",
            "ro"."final_submission_ready",
            "ro"."final_readiness_status",
            "ro"."final_readiness_note",
            "ro"."final_blocker_summary",
            "ro"."operator_handoff_instruction",
            "ro"."release_handoff_state",
            "ro"."next_handoff_action",
            "ro"."included_assets_summary",
            "ro"."missing_assets_summary",
            "ro"."included_documents_summary",
            "ro"."missing_documents_summary",
            "ro"."submission_prep_notes",
            "ro"."upload_instruction_text",
            "ro"."submission_instruction_text",
            "ro"."readiness_next_destination_action",
            "ro"."destination_guidance_text",
            "ro"."action_status",
            "ro"."action_status_note",
            "ro"."primary_operator_action",
            "ro"."operator_action_state",
            "ro"."recommended_next_step",
            "ro"."dashboard_status",
            "ro"."destination_dashboard_state",
            "ro"."destination_dashboard_note",
            "ro"."project_dashboard_summary",
            "ro"."destination_count",
            "ro"."ready_destination_count",
            "ro"."blocked_destination_count",
            "ro"."review_destination_count",
            "ro"."handoff_ready_count",
            "ro"."delivery_queue_status",
            "ro"."delivery_queue_order",
            "ro"."delivery_queue_label",
            "ro"."delivery_queue_note",
            "ro"."delivery_operator_instruction",
            "ro"."delivery_next_step",
            "ro"."delivery_board_state",
            "ro"."operator_lane",
            "ro"."operator_lane_order",
            "ro"."operator_card_label",
            "ro"."operator_card_note",
            "ro"."operator_work_instruction",
            "ro"."operator_priority_band",
            "ro"."operator_work_type",
            "ro"."operator_next_step",
            "ro"."operator_board_state",
            "ro"."rights_required_count",
            "ro"."rights_completed_count",
            "ro"."rights_approved_count",
            "ro"."deliverables_required_count",
            "ro"."deliverables_completed_count",
            "ro"."deliverables_approved_count",
            "ro"."monetization_status",
            "ro"."gross_revenue",
            "ro"."net_revenue",
            "ro"."first_revenue_at",
            "ro"."last_revenue_at",
            "ro"."payout_due_at",
            "ro"."payout_sent_at",
            "ro"."latest_review_stage",
            "ro"."latest_review_action",
            "ro"."latest_review_status",
            "ro"."latest_decision_summary",
            "ro"."latest_reviewed_at",
            "ro"."outcome_label",
            "ro"."outcome_reason",
            "ro"."outcome_effective_at"
           FROM ("base" "b"
             LEFT JOIN "ro" ON ((("ro"."project_id" = "b"."project_id") AND ("ro"."destination_id" = "b"."destination_id"))))
        ), "final" AS (
         SELECT "j"."project_destination_selection_id",
            "j"."project_id",
            "j"."title",
            "j"."destination_id",
            "j"."destination_name",
            "j"."destination_slug",
            "j"."destination_category",
            "j"."is_alleystreet",
            "j"."is_primary_destination",
            "j"."priority_order",
            "j"."selection_status",
            "j"."creator_goal",
            "j"."release_strategy",
            "j"."rights_confirmed",
            "j"."required_fields_complete",
            "j"."required_assets_complete",
            "j"."guidance_reviewed",
            "j"."planned_submission_at",
            "j"."submitted_at",
            "j"."decision_received_at",
            "j"."target_release_at",
            "j"."field_mapping_rows",
            "j"."required_field_rows",
            "j"."asset_requirement_rows",
            "j"."required_asset_rows",
            "j"."required_field_keys",
            "j"."required_asset_keys",
            "j"."has_minimum_submission_structure",
            "j"."ready_to_submit",
            "j"."next_destination_action",
            "j"."readiness_gap_summary",
            "j"."creator_notes",
            "j"."internal_notes",
            "j"."created_at",
            "j"."updated_at",
            "j"."submission_packet_id",
            "j"."approval_decision_id",
            "j"."release_status",
            "j"."release_type",
            "j"."platform_label",
            "j"."territory_scope",
            "j"."scheduled_release_at",
            "j"."actual_release_at",
            "j"."release_url",
            "j"."public_visible",
            "j"."release_tracking_active",
            "j"."guidance_stage",
            "j"."release_ready_to_submit",
            "j"."submission_package_status",
            "j"."package_status_note",
            "j"."upload_state",
            "j"."submission_state",
            "j"."final_submission_ready",
            "j"."final_readiness_status",
            "j"."final_readiness_note",
            "j"."final_blocker_summary",
            "j"."operator_handoff_instruction",
            "j"."release_handoff_state",
            "j"."next_handoff_action",
            "j"."included_assets_summary",
            "j"."missing_assets_summary",
            "j"."included_documents_summary",
            "j"."missing_documents_summary",
            "j"."submission_prep_notes",
            "j"."upload_instruction_text",
            "j"."submission_instruction_text",
            "j"."readiness_next_destination_action",
            "j"."destination_guidance_text",
            "j"."action_status",
            "j"."action_status_note",
            "j"."primary_operator_action",
            "j"."operator_action_state",
            "j"."recommended_next_step",
            "j"."dashboard_status",
            "j"."destination_dashboard_state",
            "j"."destination_dashboard_note",
            "j"."project_dashboard_summary",
            "j"."destination_count",
            "j"."ready_destination_count",
            "j"."blocked_destination_count",
            "j"."review_destination_count",
            "j"."handoff_ready_count",
            "j"."delivery_queue_status",
            "j"."delivery_queue_order",
            "j"."delivery_queue_label",
            "j"."delivery_queue_note",
            "j"."delivery_operator_instruction",
            "j"."delivery_next_step",
            "j"."delivery_board_state",
            "j"."operator_lane",
            "j"."operator_lane_order",
            "j"."operator_card_label",
            "j"."operator_card_note",
            "j"."operator_work_instruction",
            "j"."operator_priority_band",
            "j"."operator_work_type",
            "j"."operator_next_step",
            "j"."operator_board_state",
            "j"."rights_required_count",
            "j"."rights_completed_count",
            "j"."rights_approved_count",
            "j"."deliverables_required_count",
            "j"."deliverables_completed_count",
            "j"."deliverables_approved_count",
            "j"."monetization_status",
            "j"."gross_revenue",
            "j"."net_revenue",
            "j"."first_revenue_at",
            "j"."last_revenue_at",
            "j"."payout_due_at",
            "j"."payout_sent_at",
            "j"."latest_review_stage",
            "j"."latest_review_action",
            "j"."latest_review_status",
            "j"."latest_decision_summary",
            "j"."latest_reviewed_at",
            "j"."outcome_label",
            "j"."outcome_reason",
            "j"."outcome_effective_at",
                CASE
                    WHEN ("lower"(COALESCE("j"."outcome_label", ''::"text")) = 'released'::"text") THEN 'released'::"text"
                    WHEN ("lower"(COALESCE("j"."outcome_label", ''::"text")) = 'scheduled'::"text") THEN 'scheduled'::"text"
                    WHEN ("lower"(COALESCE("j"."outcome_label", ''::"text")) = 'withdrawn'::"text") THEN 'withdrawn'::"text"
                    WHEN ("lower"(COALESCE("j"."outcome_label", ''::"text")) = 'rejected'::"text") THEN 'rejected'::"text"
                    WHEN ("lower"(COALESCE("j"."outcome_label", ''::"text")) = 'blocked'::"text") THEN 'blocked'::"text"
                    WHEN ((COALESCE("j"."final_submission_ready", false) = true) AND ("lower"(COALESCE("j"."release_handoff_state", ''::"text")) = ANY (ARRAY['ready'::"text", 'handoff_ready'::"text", 'queued'::"text"]))) THEN 'handoff_ready'::"text"
                    WHEN ((COALESCE("j"."ready_to_submit", false) = true) AND (COALESCE("j"."final_submission_ready", false) = false)) THEN 'submission_ready'::"text"
                    WHEN ((COALESCE("j"."required_fields_complete", false) = false) OR (COALESCE("j"."required_assets_complete", false) = false) OR (COALESCE("j"."has_minimum_submission_structure", false) = false)) THEN 'structurally_incomplete'::"text"
                    WHEN ("lower"(COALESCE("j"."outcome_label", ''::"text")) = 'incomplete'::"text") THEN 'incomplete'::"text"
                    ELSE 'in_progress'::"text"
                END AS "lifecycle_stage",
                CASE
                    WHEN ("lower"(COALESCE("j"."outcome_label", ''::"text")) = 'released'::"text") THEN 900
                    WHEN ("lower"(COALESCE("j"."outcome_label", ''::"text")) = 'scheduled'::"text") THEN 800
                    WHEN ("lower"(COALESCE("j"."release_handoff_state", ''::"text")) = ANY (ARRAY['ready'::"text", 'handoff_ready'::"text", 'queued'::"text"])) THEN 700
                    WHEN (COALESCE("j"."final_submission_ready", false) = true) THEN 600
                    WHEN (COALESCE("j"."ready_to_submit", false) = true) THEN 500
                    WHEN (COALESCE("j"."has_minimum_submission_structure", false) = true) THEN 400
                    WHEN ((COALESCE("j"."required_fields_complete", false) = true) OR (COALESCE("j"."required_assets_complete", false) = true)) THEN 300
                    ELSE 100
                END AS "lifecycle_stage_rank",
                CASE
                    WHEN ("lower"(COALESCE("j"."outcome_label", ''::"text")) = 'released'::"text") THEN 'Project has completed downstream release'::"text"
                    WHEN ("lower"(COALESCE("j"."outcome_label", ''::"text")) = 'scheduled'::"text") THEN 'Project is scheduled for release'::"text"
                    WHEN ("lower"(COALESCE("j"."release_handoff_state", ''::"text")) = ANY (ARRAY['ready'::"text", 'handoff_ready'::"text", 'queued'::"text"])) THEN 'Project is ready for release handoff'::"text"
                    WHEN (COALESCE("j"."final_submission_ready", false) = true) THEN 'Project passed final submission readiness'::"text"
                    WHEN (COALESCE("j"."ready_to_submit", false) = true) THEN 'Project is ready to submit but not yet final-handoff ready'::"text"
                    WHEN (COALESCE("j"."has_minimum_submission_structure", false) = false) THEN 'Minimum submission structure is still incomplete'::"text"
                    WHEN (COALESCE("j"."required_fields_complete", false) = false) THEN 'Required submission fields are incomplete'::"text"
                    WHEN (COALESCE("j"."required_assets_complete", false) = false) THEN 'Required submission assets are incomplete'::"text"
                    ELSE COALESCE("j"."outcome_reason", "j"."readiness_gap_summary", "j"."next_destination_action", 'Continue lifecycle progression'::"text")
                END AS "lifecycle_summary",
                CASE
                    WHEN ("lower"(COALESCE("j"."outcome_label", ''::"text")) = ANY (ARRAY['released'::"text", 'scheduled'::"text", 'withdrawn'::"text", 'rejected'::"text", 'blocked'::"text"])) THEN true
                    ELSE false
                END AS "lifecycle_terminal_state",
            COALESCE("j"."outcome_effective_at", "j"."actual_release_at", "j"."scheduled_release_at", "j"."decision_received_at", "j"."submitted_at", "j"."planned_submission_at", "j"."target_release_at", "j"."updated_at", "j"."created_at") AS "lifecycle_effective_at"
           FROM "joined" "j"
        )
 SELECT "project_destination_selection_id",
    "project_id",
    "title",
    "destination_id",
    "destination_name",
    "destination_slug",
    "destination_category",
    "is_alleystreet",
    "is_primary_destination",
    "priority_order",
    "selection_status",
    "creator_goal",
    "release_strategy",
    "rights_confirmed",
    "required_fields_complete",
    "required_assets_complete",
    "guidance_reviewed",
    "planned_submission_at",
    "submitted_at",
    "decision_received_at",
    "target_release_at",
    "field_mapping_rows",
    "required_field_rows",
    "asset_requirement_rows",
    "required_asset_rows",
    "required_field_keys",
    "required_asset_keys",
    "has_minimum_submission_structure",
    "ready_to_submit",
    "next_destination_action",
    "readiness_gap_summary",
    "creator_notes",
    "internal_notes",
    "created_at",
    "updated_at",
    "submission_packet_id",
    "approval_decision_id",
    "release_status",
    "release_type",
    "platform_label",
    "territory_scope",
    "scheduled_release_at",
    "actual_release_at",
    "release_url",
    "public_visible",
    "release_tracking_active",
    "guidance_stage",
    "release_ready_to_submit",
    "submission_package_status",
    "package_status_note",
    "upload_state",
    "submission_state",
    "final_submission_ready",
    "final_readiness_status",
    "final_readiness_note",
    "final_blocker_summary",
    "operator_handoff_instruction",
    "release_handoff_state",
    "next_handoff_action",
    "included_assets_summary",
    "missing_assets_summary",
    "included_documents_summary",
    "missing_documents_summary",
    "submission_prep_notes",
    "upload_instruction_text",
    "submission_instruction_text",
    "readiness_next_destination_action",
    "destination_guidance_text",
    "action_status",
    "action_status_note",
    "primary_operator_action",
    "operator_action_state",
    "recommended_next_step",
    "dashboard_status",
    "destination_dashboard_state",
    "destination_dashboard_note",
    "project_dashboard_summary",
    "destination_count",
    "ready_destination_count",
    "blocked_destination_count",
    "review_destination_count",
    "handoff_ready_count",
    "delivery_queue_status",
    "delivery_queue_order",
    "delivery_queue_label",
    "delivery_queue_note",
    "delivery_operator_instruction",
    "delivery_next_step",
    "delivery_board_state",
    "operator_lane",
    "operator_lane_order",
    "operator_card_label",
    "operator_card_note",
    "operator_work_instruction",
    "operator_priority_band",
    "operator_work_type",
    "operator_next_step",
    "operator_board_state",
    "rights_required_count",
    "rights_completed_count",
    "rights_approved_count",
    "deliverables_required_count",
    "deliverables_completed_count",
    "deliverables_approved_count",
    "monetization_status",
    "gross_revenue",
    "net_revenue",
    "first_revenue_at",
    "last_revenue_at",
    "payout_due_at",
    "payout_sent_at",
    "latest_review_stage",
    "latest_review_action",
    "latest_review_status",
    "latest_decision_summary",
    "latest_reviewed_at",
    "outcome_label",
    "outcome_reason",
    "outcome_effective_at",
    "lifecycle_stage",
    "lifecycle_stage_rank",
    "lifecycle_summary",
    "lifecycle_terminal_state",
    "lifecycle_effective_at"
   FROM "final"

-- statement 157 of 775
ALTER VIEW "public"."project_destination_master_lifecycle_view" OWNER TO "postgres"

-- statement 158 of 775
CREATE OR REPLACE VIEW "public"."project_destination_live_release_monitor_view" AS
 WITH "base" AS (
         SELECT "z"."project_destination_selection_id",
            "z"."project_id",
            "z"."title",
            "z"."destination_id",
            "z"."destination_name",
            "z"."destination_slug",
            "z"."destination_category",
            "z"."is_alleystreet",
            "z"."is_primary_destination",
            "z"."priority_order",
            "z"."selection_status",
            "z"."creator_goal",
            "z"."release_strategy",
            "z"."submission_packet_id",
            "z"."approval_decision_id",
            "z"."release_status",
            "z"."release_type",
            "z"."platform_label",
            "z"."territory_scope",
            "z"."scheduled_release_at",
            "z"."actual_release_at",
            "z"."release_url",
            "z"."public_visible",
            "z"."release_tracking_active",
            "z"."submission_package_status",
            "z"."upload_state",
            "z"."submission_state",
            "z"."final_submission_ready",
            "z"."final_readiness_status",
            "z"."final_readiness_note",
            "z"."final_blocker_summary",
            "z"."release_handoff_state",
            "z"."next_handoff_action",
            "z"."action_status",
            "z"."action_status_note",
            "z"."primary_operator_action",
            "z"."operator_action_state",
            "z"."recommended_next_step",
            "z"."delivery_queue_status",
            "z"."delivery_queue_order",
            "z"."delivery_queue_label",
            "z"."delivery_queue_note",
            "z"."delivery_operator_instruction",
            "z"."delivery_next_step",
            "z"."delivery_board_state",
            "z"."operator_lane",
            "z"."operator_lane_order",
            "z"."operator_card_label",
            "z"."operator_card_note",
            "z"."operator_work_instruction",
            "z"."operator_priority_band",
            "z"."operator_work_type",
            "z"."operator_next_step",
            "z"."operator_board_state",
            "z"."latest_review_stage",
            "z"."latest_review_action",
            "z"."latest_review_status",
            "z"."latest_decision_summary",
            "z"."latest_reviewed_at",
            "z"."outcome_label",
            "z"."outcome_reason",
            "z"."outcome_effective_at",
            "z"."lifecycle_stage",
            "z"."lifecycle_stage_rank",
            "z"."lifecycle_summary",
            "z"."lifecycle_terminal_state",
            "z"."lifecycle_effective_at",
            "z"."created_at",
            "z"."updated_at"
           FROM "public"."project_destination_master_lifecycle_view" "z"
        ), "final" AS (
         SELECT "b"."project_destination_selection_id",
            "b"."project_id",
            "b"."title",
            "b"."destination_id",
            "b"."destination_name",
            "b"."destination_slug",
            "b"."destination_category",
            "b"."is_alleystreet",
            "b"."is_primary_destination",
            "b"."priority_order",
            "b"."selection_status",
            "b"."creator_goal",
            "b"."release_strategy",
            "b"."submission_packet_id",
            "b"."approval_decision_id",
            "b"."release_status",
            "b"."release_type",
            "b"."platform_label",
            "b"."territory_scope",
            "b"."scheduled_release_at",
            "b"."actual_release_at",
            "b"."release_url",
            "b"."public_visible",
            "b"."release_tracking_active",
            "b"."submission_package_status",
            "b"."upload_state",
            "b"."submission_state",
            "b"."final_submission_ready",
            "b"."final_readiness_status",
            "b"."final_readiness_note",
            "b"."final_blocker_summary",
            "b"."release_handoff_state",
            "b"."next_handoff_action",
            "b"."action_status",
            "b"."action_status_note",
            "b"."primary_operator_action",
            "b"."operator_action_state",
            "b"."recommended_next_step",
            "b"."delivery_queue_status",
            "b"."delivery_queue_order",
            "b"."delivery_queue_label",
            "b"."delivery_queue_note",
            "b"."delivery_operator_instruction",
            "b"."delivery_next_step",
            "b"."delivery_board_state",
            "b"."operator_lane",
            "b"."operator_lane_order",
            "b"."operator_card_label",
            "b"."operator_card_note",
            "b"."operator_work_instruction",
            "b"."operator_priority_band",
            "b"."operator_work_type",
            "b"."operator_next_step",
            "b"."operator_board_state",
            "b"."latest_review_stage",
            "b"."latest_review_action",
            "b"."latest_review_status",
            "b"."latest_decision_summary",
            "b"."latest_reviewed_at",
            "b"."outcome_label",
            "b"."outcome_reason",
            "b"."outcome_effective_at",
            "b"."lifecycle_stage",
            "b"."lifecycle_stage_rank",
            "b"."lifecycle_summary",
            "b"."lifecycle_terminal_state",
            "b"."lifecycle_effective_at",
            "b"."created_at",
            "b"."updated_at",
                CASE
                    WHEN ("lower"(COALESCE("b"."outcome_label", ''::"text")) = 'released'::"text") THEN 'live'::"text"
                    WHEN ("lower"(COALESCE("b"."release_status", ''::"text")) = 'live'::"text") THEN 'live'::"text"
                    WHEN ("b"."actual_release_at" IS NOT NULL) THEN 'live'::"text"
                    WHEN ("lower"(COALESCE("b"."outcome_label", ''::"text")) = 'scheduled'::"text") THEN 'scheduled'::"text"
                    WHEN ("b"."scheduled_release_at" IS NOT NULL) THEN 'scheduled'::"text"
                    WHEN ("lower"(COALESCE("b"."release_handoff_state", ''::"text")) = ANY (ARRAY['ready'::"text", 'handoff_ready'::"text", 'queued'::"text"])) THEN 'handoff_ready'::"text"
                    WHEN ("lower"(COALESCE("b"."action_status", ''::"text")) = ANY (ARRAY['blocked'::"text", 'error'::"text"])) THEN 'blocked'::"text"
                    WHEN ("lower"(COALESCE("b"."outcome_label", ''::"text")) = ANY (ARRAY['rejected'::"text", 'withdrawn'::"text"])) THEN "lower"("b"."outcome_label")
                    WHEN ("lower"(COALESCE("b"."lifecycle_stage", ''::"text")) = ANY (ARRAY['structurally_incomplete'::"text", 'incomplete'::"text"])) THEN 'not_ready'::"text"
                    ELSE 'watch'::"text"
                END AS "live_monitor_state",
                CASE
                    WHEN ("lower"(COALESCE("b"."outcome_label", ''::"text")) = 'released'::"text") THEN 900
                    WHEN ("lower"(COALESCE("b"."release_status", ''::"text")) = 'live'::"text") THEN 900
                    WHEN ("b"."actual_release_at" IS NOT NULL) THEN 900
                    WHEN ("lower"(COALESCE("b"."outcome_label", ''::"text")) = 'scheduled'::"text") THEN 800
                    WHEN ("b"."scheduled_release_at" IS NOT NULL) THEN 800
                    WHEN ("lower"(COALESCE("b"."release_handoff_state", ''::"text")) = ANY (ARRAY['ready'::"text", 'handoff_ready'::"text", 'queued'::"text"])) THEN 700
                    WHEN ("lower"(COALESCE("b"."action_status", ''::"text")) = ANY (ARRAY['blocked'::"text", 'error'::"text"])) THEN 200
                    WHEN ("lower"(COALESCE("b"."lifecycle_stage", ''::"text")) = ANY (ARRAY['structurally_incomplete'::"text", 'incomplete'::"text"])) THEN 100
                    ELSE 500
                END AS "live_monitor_rank",
                CASE
                    WHEN (("lower"(COALESCE("b"."outcome_label", ''::"text")) = 'released'::"text") OR ("lower"(COALESCE("b"."release_status", ''::"text")) = 'live'::"text") OR ("b"."actual_release_at" IS NOT NULL)) THEN 'Live release confirmed'::"text"
                    WHEN (("lower"(COALESCE("b"."outcome_label", ''::"text")) = 'scheduled'::"text") OR ("b"."scheduled_release_at" IS NOT NULL)) THEN 'Scheduled release is being monitored'::"text"
                    WHEN ("lower"(COALESCE("b"."release_handoff_state", ''::"text")) = ANY (ARRAY['ready'::"text", 'handoff_ready'::"text", 'queued'::"text"])) THEN 'Ready for release handoff monitoring'::"text"
                    WHEN ("lower"(COALESCE("b"."action_status", ''::"text")) = ANY (ARRAY['blocked'::"text", 'error'::"text"])) THEN COALESCE("b"."action_status_note", 'Blocked and requires operator attention'::"text")
                    WHEN ("lower"(COALESCE("b"."outcome_label", ''::"text")) = 'rejected'::"text") THEN COALESCE("b"."latest_decision_summary", "b"."outcome_reason", 'Rejected during downstream process'::"text")
                    WHEN ("lower"(COALESCE("b"."outcome_label", ''::"text")) = 'withdrawn'::"text") THEN COALESCE("b"."outcome_reason", 'Withdrawn from downstream release path'::"text")
                    WHEN ("lower"(COALESCE("b"."lifecycle_stage", ''::"text")) = ANY (ARRAY['structurally_incomplete'::"text", 'incomplete'::"text"])) THEN COALESCE("b"."final_blocker_summary", "b"."lifecycle_summary", 'Not yet ready for live monitoring'::"text")
                    ELSE COALESCE("b"."lifecycle_summary", "b"."outcome_reason", 'Monitor downstream progress'::"text")
                END AS "live_monitor_summary",
                CASE
                    WHEN (("lower"(COALESCE("b"."outcome_label", ''::"text")) = 'released'::"text") OR ("lower"(COALESCE("b"."release_status", ''::"text")) = 'live'::"text") OR ("b"."actual_release_at" IS NOT NULL)) THEN COALESCE("b"."release_url", 'Live release confirmed'::"text")
                    WHEN (("lower"(COALESCE("b"."outcome_label", ''::"text")) = 'scheduled'::"text") OR ("b"."scheduled_release_at" IS NOT NULL)) THEN 'Confirm launch timing and final release checks'::"text"
                    WHEN ("lower"(COALESCE("b"."release_handoff_state", ''::"text")) = ANY (ARRAY['ready'::"text", 'handoff_ready'::"text", 'queued'::"text"])) THEN COALESCE("b"."next_handoff_action", "b"."recommended_next_step", 'Execute release handoff'::"text")
                    WHEN ("lower"(COALESCE("b"."action_status", ''::"text")) = ANY (ARRAY['blocked'::"text", 'error'::"text"])) THEN COALESCE("b"."recommended_next_step", "b"."action_status_note", 'Resolve blocked workflow'::"text")
                    WHEN ("lower"(COALESCE("b"."lifecycle_stage", ''::"text")) = ANY (ARRAY['structurally_incomplete'::"text", 'incomplete'::"text"])) THEN COALESCE("b"."final_blocker_summary", 'Complete missing requirements before live monitoring'::"text")
                    WHEN ("lower"(COALESCE("b"."outcome_label", ''::"text")) = 'rejected'::"text") THEN COALESCE("b"."latest_decision_summary", 'Review rejection and determine next move'::"text")
                    WHEN ("lower"(COALESCE("b"."outcome_label", ''::"text")) = 'withdrawn'::"text") THEN 'Confirm archive, reopen, or reroute destination path'::"text"
                    ELSE COALESCE("b"."recommended_next_step", "b"."delivery_next_step", "b"."operator_next_step", 'Continue monitoring'::"text")
                END AS "live_monitor_next_step",
                CASE
                    WHEN (("lower"(COALESCE("b"."outcome_label", ''::"text")) = ANY (ARRAY['released'::"text", 'scheduled'::"text"])) OR ("b"."actual_release_at" IS NOT NULL) OR ("b"."scheduled_release_at" IS NOT NULL)) THEN true
                    ELSE false
                END AS "appears_on_release_watch",
            COALESCE("b"."actual_release_at", "b"."scheduled_release_at", "b"."outcome_effective_at", "b"."lifecycle_effective_at", "b"."updated_at", "b"."created_at") AS "live_monitor_effective_at"
           FROM "base" "b"
        )
 SELECT "project_destination_selection_id",
    "project_id",
    "title",
    "destination_id",
    "destination_name",
    "destination_slug",
    "destination_category",
    "is_alleystreet",
    "is_primary_destination",
    "priority_order",
    "selection_status",
    "creator_goal",
    "release_strategy",
    "submission_packet_id",
    "approval_decision_id",
    "release_status",
    "release_type",
    "platform_label",
    "territory_scope",
    "scheduled_release_at",
    "actual_release_at",
    "release_url",
    "public_visible",
    "release_tracking_active",
    "submission_package_status",
    "upload_state",
    "submission_state",
    "final_submission_ready",
    "final_readiness_status",
    "final_readiness_note",
    "final_blocker_summary",
    "release_handoff_state",
    "next_handoff_action",
    "action_status",
    "action_status_note",
    "primary_operator_action",
    "operator_action_state",
    "recommended_next_step",
    "delivery_queue_status",
    "delivery_queue_order",
    "delivery_queue_label",
    "delivery_queue_note",
    "delivery_operator_instruction",
    "delivery_next_step",
    "delivery_board_state",
    "operator_lane",
    "operator_lane_order",
    "operator_card_label",
    "operator_card_note",
    "operator_work_instruction",
    "operator_priority_band",
    "operator_work_type",
    "operator_next_step",
    "operator_board_state",
    "latest_review_stage",
    "latest_review_action",
    "latest_review_status",
    "latest_decision_summary",
    "latest_reviewed_at",
    "outcome_label",
    "outcome_reason",
    "outcome_effective_at",
    "lifecycle_stage",
    "lifecycle_stage_rank",
    "lifecycle_summary",
    "lifecycle_terminal_state",
    "lifecycle_effective_at",
    "live_monitor_state",
    "live_monitor_rank",
    "live_monitor_summary",
    "live_monitor_next_step",
    "appears_on_release_watch",
    "live_monitor_effective_at"
   FROM "final"

-- statement 159 of 775
ALTER VIEW "public"."project_destination_live_release_monitor_view" OWNER TO "postgres"

-- statement 160 of 775
CREATE OR REPLACE VIEW "public"."project_destination_release_completion_view" AS
 WITH "base" AS (
         SELECT "z"."project_destination_selection_id",
            "z"."project_id",
            "z"."title",
            "z"."destination_id",
            "z"."destination_name",
            "z"."destination_slug",
            "z"."destination_category",
            "z"."is_alleystreet",
            "z"."is_primary_destination",
            "z"."priority_order",
            "z"."selection_status",
            "z"."creator_goal",
            "z"."release_strategy",
            "z"."ready_to_submit",
            "z"."required_fields_complete",
            "z"."required_assets_complete",
            "z"."submission_packet_id",
            "z"."approval_decision_id",
            "z"."release_status",
            "z"."release_type",
            "z"."platform_label",
            "z"."territory_scope",
            "z"."scheduled_release_at",
            "z"."actual_release_at",
            "z"."release_url",
            "z"."public_visible",
            "z"."release_tracking_active",
            "z"."submission_package_status",
            "z"."upload_state",
            "z"."submission_state",
            "z"."final_submission_ready",
            "z"."final_readiness_status",
            "z"."final_readiness_note",
            "z"."final_blocker_summary",
            "z"."release_handoff_state",
            "z"."next_handoff_action",
            "z"."action_status",
            "z"."action_status_note",
            "z"."primary_operator_action",
            "z"."operator_action_state",
            "z"."recommended_next_step",
            "z"."delivery_queue_status",
            "z"."delivery_queue_order",
            "z"."delivery_queue_label",
            "z"."delivery_queue_note",
            "z"."delivery_operator_instruction",
            "z"."delivery_next_step",
            "z"."delivery_board_state",
            "z"."operator_lane",
            "z"."operator_lane_order",
            "z"."operator_card_label",
            "z"."operator_card_note",
            "z"."operator_work_instruction",
            "z"."operator_priority_band",
            "z"."operator_work_type",
            "z"."operator_next_step",
            "z"."operator_board_state",
            "z"."rights_required_count",
            "z"."rights_completed_count",
            "z"."rights_approved_count",
            "z"."deliverables_required_count",
            "z"."deliverables_completed_count",
            "z"."deliverables_approved_count",
            "z"."monetization_status",
            "z"."gross_revenue",
            "z"."net_revenue",
            "z"."first_revenue_at",
            "z"."last_revenue_at",
            "z"."payout_due_at",
            "z"."payout_sent_at",
            "z"."latest_review_stage",
            "z"."latest_review_action",
            "z"."latest_review_status",
            "z"."latest_decision_summary",
            "z"."latest_reviewed_at",
            "z"."outcome_label",
            "z"."outcome_reason",
            "z"."outcome_effective_at",
            "z"."lifecycle_stage",
            "z"."lifecycle_stage_rank",
            "z"."lifecycle_summary",
            "z"."lifecycle_terminal_state",
            "z"."lifecycle_effective_at",
            "s"."live_monitor_state",
            "s"."live_monitor_rank",
            "s"."live_monitor_summary",
            "s"."live_monitor_next_step",
            "s"."appears_on_release_watch",
            "s"."live_monitor_effective_at",
            "z"."created_at",
            "z"."updated_at"
           FROM ("public"."project_destination_master_lifecycle_view" "z"
             LEFT JOIN "public"."project_destination_live_release_monitor_view" "s" ON ((("s"."project_id" = "z"."project_id") AND ("s"."destination_id" = "z"."destination_id"))))
        ), "final" AS (
         SELECT "b"."project_destination_selection_id",
            "b"."project_id",
            "b"."title",
            "b"."destination_id",
            "b"."destination_name",
            "b"."destination_slug",
            "b"."destination_category",
            "b"."is_alleystreet",
            "b"."is_primary_destination",
            "b"."priority_order",
            "b"."selection_status",
            "b"."creator_goal",
            "b"."release_strategy",
            "b"."ready_to_submit",
            "b"."required_fields_complete",
            "b"."required_assets_complete",
            "b"."submission_packet_id",
            "b"."approval_decision_id",
            "b"."release_status",
            "b"."release_type",
            "b"."platform_label",
            "b"."territory_scope",
            "b"."scheduled_release_at",
            "b"."actual_release_at",
            "b"."release_url",
            "b"."public_visible",
            "b"."release_tracking_active",
            "b"."submission_package_status",
            "b"."upload_state",
            "b"."submission_state",
            "b"."final_submission_ready",
            "b"."final_readiness_status",
            "b"."final_readiness_note",
            "b"."final_blocker_summary",
            "b"."release_handoff_state",
            "b"."next_handoff_action",
            "b"."action_status",
            "b"."action_status_note",
            "b"."primary_operator_action",
            "b"."operator_action_state",
            "b"."recommended_next_step",
            "b"."delivery_queue_status",
            "b"."delivery_queue_order",
            "b"."delivery_queue_label",
            "b"."delivery_queue_note",
            "b"."delivery_operator_instruction",
            "b"."delivery_next_step",
            "b"."delivery_board_state",
            "b"."operator_lane",
            "b"."operator_lane_order",
            "b"."operator_card_label",
            "b"."operator_card_note",
            "b"."operator_work_instruction",
            "b"."operator_priority_band",
            "b"."operator_work_type",
            "b"."operator_next_step",
            "b"."operator_board_state",
            "b"."rights_required_count",
            "b"."rights_completed_count",
            "b"."rights_approved_count",
            "b"."deliverables_required_count",
            "b"."deliverables_completed_count",
            "b"."deliverables_approved_count",
            "b"."monetization_status",
            "b"."gross_revenue",
            "b"."net_revenue",
            "b"."first_revenue_at",
            "b"."last_revenue_at",
            "b"."payout_due_at",
            "b"."payout_sent_at",
            "b"."latest_review_stage",
            "b"."latest_review_action",
            "b"."latest_review_status",
            "b"."latest_decision_summary",
            "b"."latest_reviewed_at",
            "b"."outcome_label",
            "b"."outcome_reason",
            "b"."outcome_effective_at",
            "b"."lifecycle_stage",
            "b"."lifecycle_stage_rank",
            "b"."lifecycle_summary",
            "b"."lifecycle_terminal_state",
            "b"."lifecycle_effective_at",
            "b"."live_monitor_state",
            "b"."live_monitor_rank",
            "b"."live_monitor_summary",
            "b"."live_monitor_next_step",
            "b"."appears_on_release_watch",
            "b"."live_monitor_effective_at",
            "b"."created_at",
            "b"."updated_at",
                CASE
                    WHEN (("lower"(COALESCE("b"."outcome_label", ''::"text")) = 'released'::"text") OR ("b"."actual_release_at" IS NOT NULL)) THEN 'completed'::"text"
                    WHEN ("lower"(COALESCE("b"."outcome_label", ''::"text")) = ANY (ARRAY['withdrawn'::"text", 'rejected'::"text"])) THEN "lower"("b"."outcome_label")
                    WHEN ("lower"(COALESCE("b"."action_status", ''::"text")) = ANY (ARRAY['blocked'::"text", 'error'::"text"])) THEN 'blocked'::"text"
                    WHEN (("lower"(COALESCE("b"."release_status", ''::"text")) = 'scheduled'::"text") OR ("b"."scheduled_release_at" IS NOT NULL)) THEN 'scheduled_pending_completion'::"text"
                    WHEN ("lower"(COALESCE("b"."release_handoff_state", ''::"text")) = ANY (ARRAY['ready'::"text", 'handoff_ready'::"text", 'queued'::"text"])) THEN 'handoff_pending_completion'::"text"
                    WHEN (COALESCE("b"."final_submission_ready", false) = true) THEN 'ready_pending_completion'::"text"
                    WHEN ("lower"(COALESCE("b"."lifecycle_stage", ''::"text")) = ANY (ARRAY['structurally_incomplete'::"text", 'incomplete'::"text"])) THEN 'incomplete'::"text"
                    ELSE 'in_progress'::"text"
                END AS "completion_state",
                CASE
                    WHEN (("lower"(COALESCE("b"."outcome_label", ''::"text")) = 'released'::"text") OR ("b"."actual_release_at" IS NOT NULL)) THEN 100
                    WHEN ("lower"(COALESCE("b"."outcome_label", ''::"text")) = ANY (ARRAY['withdrawn'::"text", 'rejected'::"text"])) THEN 90
                    WHEN (("lower"(COALESCE("b"."release_status", ''::"text")) = 'scheduled'::"text") OR ("b"."scheduled_release_at" IS NOT NULL)) THEN 75
                    WHEN ("lower"(COALESCE("b"."release_handoff_state", ''::"text")) = ANY (ARRAY['ready'::"text", 'handoff_ready'::"text", 'queued'::"text"])) THEN 65
                    WHEN (COALESCE("b"."final_submission_ready", false) = true) THEN 55
                    WHEN ("lower"(COALESCE("b"."action_status", ''::"text")) = ANY (ARRAY['blocked'::"text", 'error'::"text"])) THEN 20
                    WHEN ("lower"(COALESCE("b"."lifecycle_stage", ''::"text")) = ANY (ARRAY['structurally_incomplete'::"text", 'incomplete'::"text"])) THEN 10
                    ELSE 35
                END AS "completion_rank",
                CASE
                    WHEN (("lower"(COALESCE("b"."outcome_label", ''::"text")) = 'released'::"text") OR ("b"."actual_release_at" IS NOT NULL)) THEN true
                    WHEN ("lower"(COALESCE("b"."outcome_label", ''::"text")) = ANY (ARRAY['withdrawn'::"text", 'rejected'::"text"])) THEN true
                    ELSE false
                END AS "completion_terminal_state",
                CASE
                    WHEN (("lower"(COALESCE("b"."outcome_label", ''::"text")) = 'released'::"text") OR ("b"."actual_release_at" IS NOT NULL)) THEN 'Release completion confirmed'::"text"
                    WHEN ("lower"(COALESCE("b"."outcome_label", ''::"text")) = 'withdrawn'::"text") THEN COALESCE("b"."outcome_reason", 'Destination path withdrawn before completion'::"text")
                    WHEN ("lower"(COALESCE("b"."outcome_label", ''::"text")) = 'rejected'::"text") THEN COALESCE("b"."latest_decision_summary", "b"."outcome_reason", 'Destination path rejected before completion'::"text")
                    WHEN ("lower"(COALESCE("b"."action_status", ''::"text")) = ANY (ARRAY['blocked'::"text", 'error'::"text"])) THEN COALESCE("b"."action_status_note", 'Blocked before completion'::"text")
                    WHEN (("lower"(COALESCE("b"."release_status", ''::"text")) = 'scheduled'::"text") OR ("b"."scheduled_release_at" IS NOT NULL)) THEN 'Release scheduled but not yet completed'::"text"
                    WHEN ("lower"(COALESCE("b"."release_handoff_state", ''::"text")) = ANY (ARRAY['ready'::"text", 'handoff_ready'::"text", 'queued'::"text"])) THEN 'Release handoff ready but not yet completed'::"text"
                    WHEN (COALESCE("b"."final_submission_ready", false) = true) THEN 'Submission is complete enough to move toward release completion'::"text"
                    WHEN ("lower"(COALESCE("b"."lifecycle_stage", ''::"text")) = ANY (ARRAY['structurally_incomplete'::"text", 'incomplete'::"text"])) THEN COALESCE("b"."final_blocker_summary", "b"."lifecycle_summary", 'Requirements remain incomplete'::"text")
                    ELSE COALESCE("b"."outcome_reason", "b"."lifecycle_summary", 'Completion path still in progress'::"text")
                END AS "completion_summary",
                CASE
                    WHEN (("lower"(COALESCE("b"."outcome_label", ''::"text")) = 'released'::"text") OR ("b"."actual_release_at" IS NOT NULL)) THEN COALESCE("b"."release_url", 'Release completed'::"text")
                    WHEN ("lower"(COALESCE("b"."outcome_label", ''::"text")) = 'withdrawn'::"text") THEN 'Confirm whether to archive or reopen this destination path'::"text"
                    WHEN ("lower"(COALESCE("b"."outcome_label", ''::"text")) = 'rejected'::"text") THEN 'Review rejection and determine resubmission strategy'::"text"
                    WHEN ("lower"(COALESCE("b"."action_status", ''::"text")) = ANY (ARRAY['blocked'::"text", 'error'::"text"])) THEN COALESCE("b"."recommended_next_step", "b"."action_status_note", 'Resolve blocking issue'::"text")
                    WHEN (("lower"(COALESCE("b"."release_status", ''::"text")) = 'scheduled'::"text") OR ("b"."scheduled_release_at" IS NOT NULL)) THEN 'Monitor schedule and confirm actual release'::"text"
                    WHEN ("lower"(COALESCE("b"."release_handoff_state", ''::"text")) = ANY (ARRAY['ready'::"text", 'handoff_ready'::"text", 'queued'::"text"])) THEN COALESCE("b"."next_handoff_action", "b"."live_monitor_next_step", 'Complete release handoff'::"text")
                    WHEN (COALESCE("b"."final_submission_ready", false) = true) THEN COALESCE("b"."recommended_next_step", 'Advance toward release completion'::"text")
                    WHEN ("lower"(COALESCE("b"."lifecycle_stage", ''::"text")) = ANY (ARRAY['structurally_incomplete'::"text", 'incomplete'::"text"])) THEN COALESCE("b"."final_blocker_summary", 'Complete missing requirements'::"text")
                    ELSE COALESCE("b"."recommended_next_step", "b"."operator_next_step", 'Continue completion workflow'::"text")
                END AS "completion_next_step",
                CASE
                    WHEN (("lower"(COALESCE("b"."outcome_label", ''::"text")) = 'released'::"text") OR ("b"."actual_release_at" IS NOT NULL)) THEN 100.00
                    WHEN ("lower"(COALESCE("b"."outcome_label", ''::"text")) = ANY (ARRAY['withdrawn'::"text", 'rejected'::"text"])) THEN 100.00
                    WHEN (("lower"(COALESCE("b"."release_status", ''::"text")) = 'scheduled'::"text") OR ("b"."scheduled_release_at" IS NOT NULL)) THEN 85.00
                    WHEN ("lower"(COALESCE("b"."release_handoff_state", ''::"text")) = ANY (ARRAY['ready'::"text", 'handoff_ready'::"text", 'queued'::"text"])) THEN 75.00
                    WHEN (COALESCE("b"."final_submission_ready", false) = true) THEN 65.00
                    WHEN (COALESCE("b"."ready_to_submit", false) = true) THEN 50.00
                    WHEN ((COALESCE("b"."required_fields_complete", false) = true) AND (COALESCE("b"."required_assets_complete", false) = true)) THEN 35.00
                    ELSE 15.00
                END AS "completion_percent",
            COALESCE("b"."actual_release_at", "b"."outcome_effective_at", "b"."live_monitor_effective_at", "b"."lifecycle_effective_at", "b"."scheduled_release_at", "b"."updated_at", "b"."created_at") AS "completion_effective_at"
           FROM "base" "b"
        )
 SELECT "project_destination_selection_id",
    "project_id",
    "title",
    "destination_id",
    "destination_name",
    "destination_slug",
    "destination_category",
    "is_alleystreet",
    "is_primary_destination",
    "priority_order",
    "selection_status",
    "creator_goal",
    "release_strategy",
    "ready_to_submit",
    "required_fields_complete",
    "required_assets_complete",
    "submission_packet_id",
    "approval_decision_id",
    "release_status",
    "release_type",
    "platform_label",
    "territory_scope",
    "scheduled_release_at",
    "actual_release_at",
    "release_url",
    "public_visible",
    "release_tracking_active",
    "submission_package_status",
    "upload_state",
    "submission_state",
    "final_submission_ready",
    "final_readiness_status",
    "final_readiness_note",
    "final_blocker_summary",
    "release_handoff_state",
    "next_handoff_action",
    "action_status",
    "action_status_note",
    "primary_operator_action",
    "operator_action_state",
    "recommended_next_step",
    "delivery_queue_status",
    "delivery_queue_order",
    "delivery_queue_label",
    "delivery_queue_note",
    "delivery_operator_instruction",
    "delivery_next_step",
    "delivery_board_state",
    "operator_lane",
    "operator_lane_order",
    "operator_card_label",
    "operator_card_note",
    "operator_work_instruction",
    "operator_priority_band",
    "operator_work_type",
    "operator_next_step",
    "operator_board_state",
    "rights_required_count",
    "rights_completed_count",
    "rights_approved_count",
    "deliverables_required_count",
    "deliverables_completed_count",
    "deliverables_approved_count",
    "monetization_status",
    "gross_revenue",
    "net_revenue",
    "first_revenue_at",
    "last_revenue_at",
    "payout_due_at",
    "payout_sent_at",
    "latest_review_stage",
    "latest_review_action",
    "latest_review_status",
    "latest_decision_summary",
    "latest_reviewed_at",
    "outcome_label",
    "outcome_reason",
    "outcome_effective_at",
    "lifecycle_stage",
    "lifecycle_stage_rank",
    "lifecycle_summary",
    "lifecycle_terminal_state",
    "lifecycle_effective_at",
    "live_monitor_state",
    "live_monitor_rank",
    "live_monitor_summary",
    "live_monitor_next_step",
    "appears_on_release_watch",
    "live_monitor_effective_at",
    "completion_state",
    "completion_rank",
    "completion_terminal_state",
    "completion_summary",
    "completion_next_step",
    "completion_percent",
    "completion_effective_at"
   FROM "final"

-- statement 161 of 775
ALTER VIEW "public"."project_destination_release_completion_view" OWNER TO "postgres"

-- statement 162 of 775
CREATE OR REPLACE VIEW "public"."project_destination_completion_dashboard_view" AS
 WITH "base" AS (
         SELECT "t"."project_destination_selection_id",
            "t"."project_id",
            "t"."title",
            "t"."destination_id",
            "t"."destination_name",
            "t"."destination_slug",
            "t"."destination_category",
            "t"."is_alleystreet",
            "t"."is_primary_destination",
            "t"."priority_order",
            "t"."selection_status",
            "t"."creator_goal",
            "t"."release_strategy",
            "t"."ready_to_submit",
            "t"."required_fields_complete",
            "t"."required_assets_complete",
            "t"."submission_packet_id",
            "t"."approval_decision_id",
            "t"."release_status",
            "t"."release_type",
            "t"."platform_label",
            "t"."territory_scope",
            "t"."scheduled_release_at",
            "t"."actual_release_at",
            "t"."release_url",
            "t"."submission_package_status",
            "t"."upload_state",
            "t"."submission_state",
            "t"."final_submission_ready",
            "t"."final_readiness_status",
            "t"."final_readiness_note",
            "t"."final_blocker_summary",
            "t"."release_handoff_state",
            "t"."next_handoff_action",
            "t"."action_status",
            "t"."action_status_note",
            "t"."primary_operator_action",
            "t"."operator_action_state",
            "t"."recommended_next_step",
            "t"."delivery_queue_status",
            "t"."delivery_queue_order",
            "t"."delivery_queue_label",
            "t"."delivery_queue_note",
            "t"."delivery_operator_instruction",
            "t"."delivery_next_step",
            "t"."delivery_board_state",
            "t"."operator_lane",
            "t"."operator_lane_order",
            "t"."operator_card_label",
            "t"."operator_card_note",
            "t"."operator_work_instruction",
            "t"."operator_priority_band",
            "t"."operator_work_type",
            "t"."operator_next_step",
            "t"."operator_board_state",
            "t"."rights_required_count",
            "t"."rights_completed_count",
            "t"."rights_approved_count",
            "t"."deliverables_required_count",
            "t"."deliverables_completed_count",
            "t"."deliverables_approved_count",
            "t"."monetization_status",
            "t"."gross_revenue",
            "t"."net_revenue",
            "t"."first_revenue_at",
            "t"."last_revenue_at",
            "t"."payout_due_at",
            "t"."payout_sent_at",
            "t"."latest_review_stage",
            "t"."latest_review_action",
            "t"."latest_review_status",
            "t"."latest_decision_summary",
            "t"."latest_reviewed_at",
            "t"."outcome_label",
            "t"."outcome_reason",
            "t"."outcome_effective_at",
            "t"."lifecycle_stage",
            "t"."lifecycle_stage_rank",
            "t"."lifecycle_summary",
            "t"."lifecycle_terminal_state",
            "t"."lifecycle_effective_at",
            "t"."live_monitor_state",
            "t"."live_monitor_rank",
            "t"."live_monitor_summary",
            "t"."live_monitor_next_step",
            "t"."appears_on_release_watch",
            "t"."live_monitor_effective_at",
            "t"."completion_state",
            "t"."completion_rank",
            "t"."completion_terminal_state",
            "t"."completion_summary",
            "t"."completion_next_step",
            "t"."completion_percent",
            "t"."completion_effective_at"
           FROM "public"."project_destination_release_completion_view" "t"
        ), "final" AS (
         SELECT "b"."project_destination_selection_id",
            "b"."project_id",
            "b"."title",
            "b"."destination_id",
            "b"."destination_name",
            "b"."destination_slug",
            "b"."destination_category",
            "b"."is_alleystreet",
            "b"."is_primary_destination",
            "b"."priority_order",
            "b"."selection_status",
            "b"."creator_goal",
            "b"."release_strategy",
            "b"."ready_to_submit",
            "b"."required_fields_complete",
            "b"."required_assets_complete",
            "b"."submission_packet_id",
            "b"."approval_decision_id",
            "b"."release_status",
            "b"."release_type",
            "b"."platform_label",
            "b"."territory_scope",
            "b"."scheduled_release_at",
            "b"."actual_release_at",
            "b"."release_url",
            "b"."submission_package_status",
            "b"."upload_state",
            "b"."submission_state",
            "b"."final_submission_ready",
            "b"."final_readiness_status",
            "b"."final_readiness_note",
            "b"."final_blocker_summary",
            "b"."release_handoff_state",
            "b"."next_handoff_action",
            "b"."action_status",
            "b"."action_status_note",
            "b"."primary_operator_action",
            "b"."operator_action_state",
            "b"."recommended_next_step",
            "b"."delivery_queue_status",
            "b"."delivery_queue_order",
            "b"."delivery_queue_label",
            "b"."delivery_queue_note",
            "b"."delivery_operator_instruction",
            "b"."delivery_next_step",
            "b"."delivery_board_state",
            "b"."operator_lane",
            "b"."operator_lane_order",
            "b"."operator_card_label",
            "b"."operator_card_note",
            "b"."operator_work_instruction",
            "b"."operator_priority_band",
            "b"."operator_work_type",
            "b"."operator_next_step",
            "b"."operator_board_state",
            "b"."rights_required_count",
            "b"."rights_completed_count",
            "b"."rights_approved_count",
            "b"."deliverables_required_count",
            "b"."deliverables_completed_count",
            "b"."deliverables_approved_count",
            "b"."monetization_status",
            "b"."gross_revenue",
            "b"."net_revenue",
            "b"."first_revenue_at",
            "b"."last_revenue_at",
            "b"."payout_due_at",
            "b"."payout_sent_at",
            "b"."latest_review_stage",
            "b"."latest_review_action",
            "b"."latest_review_status",
            "b"."latest_decision_summary",
            "b"."latest_reviewed_at",
            "b"."outcome_label",
            "b"."outcome_reason",
            "b"."outcome_effective_at",
            "b"."lifecycle_stage",
            "b"."lifecycle_stage_rank",
            "b"."lifecycle_summary",
            "b"."lifecycle_terminal_state",
            "b"."lifecycle_effective_at",
            "b"."live_monitor_state",
            "b"."live_monitor_rank",
            "b"."live_monitor_summary",
            "b"."live_monitor_next_step",
            "b"."appears_on_release_watch",
            "b"."live_monitor_effective_at",
            "b"."completion_state",
            "b"."completion_rank",
            "b"."completion_terminal_state",
            "b"."completion_summary",
            "b"."completion_next_step",
            "b"."completion_percent",
            "b"."completion_effective_at",
                CASE
                    WHEN ("lower"(COALESCE("b"."completion_state", ''::"text")) = 'completed'::"text") THEN 'complete'::"text"
                    WHEN ("lower"(COALESCE("b"."completion_state", ''::"text")) = ANY (ARRAY['withdrawn'::"text", 'rejected'::"text"])) THEN 'closed'::"text"
                    WHEN ("lower"(COALESCE("b"."completion_state", ''::"text")) = 'blocked'::"text") THEN 'attention'::"text"
                    WHEN ("lower"(COALESCE("b"."completion_state", ''::"text")) = 'scheduled_pending_completion'::"text") THEN 'scheduled'::"text"
                    WHEN ("lower"(COALESCE("b"."completion_state", ''::"text")) = ANY (ARRAY['handoff_pending_completion'::"text", 'ready_pending_completion'::"text"])) THEN 'ready'::"text"
                    WHEN ("lower"(COALESCE("b"."completion_state", ''::"text")) = 'incomplete'::"text") THEN 'attention'::"text"
                    ELSE 'active'::"text"
                END AS "dashboard_band",
                CASE
                    WHEN ("lower"(COALESCE("b"."completion_state", ''::"text")) = 'completed'::"text") THEN 'Complete'::"text"
                    WHEN ("lower"(COALESCE("b"."completion_state", ''::"text")) = 'scheduled_pending_completion'::"text") THEN 'Scheduled Pending Completion'::"text"
                    WHEN ("lower"(COALESCE("b"."completion_state", ''::"text")) = 'handoff_pending_completion'::"text") THEN 'Handoff Pending Completion'::"text"
                    WHEN ("lower"(COALESCE("b"."completion_state", ''::"text")) = 'ready_pending_completion'::"text") THEN 'Ready Pending Completion'::"text"
                    WHEN ("lower"(COALESCE("b"."completion_state", ''::"text")) = 'blocked'::"text") THEN 'Blocked'::"text"
                    WHEN ("lower"(COALESCE("b"."completion_state", ''::"text")) = 'incomplete'::"text") THEN 'Incomplete'::"text"
                    WHEN ("lower"(COALESCE("b"."completion_state", ''::"text")) = 'withdrawn'::"text") THEN 'Withdrawn'::"text"
                    WHEN ("lower"(COALESCE("b"."completion_state", ''::"text")) = 'rejected'::"text") THEN 'Rejected'::"text"
                    ELSE 'In Progress'::"text"
                END AS "dashboard_status_label",
                CASE
                    WHEN ("lower"(COALESCE("b"."completion_state", ''::"text")) = 'completed'::"text") THEN 'Destination release path is complete.'::"text"
                    WHEN ("lower"(COALESCE("b"."completion_state", ''::"text")) = 'scheduled_pending_completion'::"text") THEN 'Destination is scheduled and awaiting final completion.'::"text"
                    WHEN ("lower"(COALESCE("b"."completion_state", ''::"text")) = 'handoff_pending_completion'::"text") THEN 'Destination is handoff-ready and awaiting completion.'::"text"
                    WHEN ("lower"(COALESCE("b"."completion_state", ''::"text")) = 'ready_pending_completion'::"text") THEN 'Destination is ready and needs completion actions.'::"text"
                    WHEN ("lower"(COALESCE("b"."completion_state", ''::"text")) = 'blocked'::"text") THEN COALESCE("b"."action_status_note", "b"."completion_summary", 'Destination is blocked.'::"text")
                    WHEN ("lower"(COALESCE("b"."completion_state", ''::"text")) = 'incomplete'::"text") THEN COALESCE("b"."final_blocker_summary", "b"."completion_summary", 'Requirements are incomplete.'::"text")
                    WHEN ("lower"(COALESCE("b"."completion_state", ''::"text")) = 'withdrawn'::"text") THEN COALESCE("b"."completion_summary", 'Destination path has been withdrawn.'::"text")
                    WHEN ("lower"(COALESCE("b"."completion_state", ''::"text")) = 'rejected'::"text") THEN COALESCE("b"."latest_decision_summary", "b"."completion_summary", 'Destination path has been rejected.'::"text")
                    ELSE COALESCE("b"."completion_summary", 'Continue completion workflow.'::"text")
                END AS "dashboard_summary_text",
                CASE
                    WHEN ("lower"(COALESCE("b"."completion_state", ''::"text")) = 'completed'::"text") THEN COALESCE("b"."release_url", 'Completion confirmed'::"text")
                    WHEN ("lower"(COALESCE("b"."completion_state", ''::"text")) = 'scheduled_pending_completion'::"text") THEN 'Monitor schedule and confirm live completion'::"text"
                    WHEN ("lower"(COALESCE("b"."completion_state", ''::"text")) = 'handoff_pending_completion'::"text") THEN COALESCE("b"."next_handoff_action", "b"."completion_next_step", 'Complete release handoff'::"text")
                    WHEN ("lower"(COALESCE("b"."completion_state", ''::"text")) = 'ready_pending_completion'::"text") THEN COALESCE("b"."completion_next_step", "b"."recommended_next_step", 'Advance to completion'::"text")
                    WHEN ("lower"(COALESCE("b"."completion_state", ''::"text")) = 'blocked'::"text") THEN COALESCE("b"."recommended_next_step", 'Resolve blocked completion path'::"text")
                    WHEN ("lower"(COALESCE("b"."completion_state", ''::"text")) = 'incomplete'::"text") THEN COALESCE("b"."final_blocker_summary", 'Complete missing requirements'::"text")
                    WHEN ("lower"(COALESCE("b"."completion_state", ''::"text")) = 'withdrawn'::"text") THEN 'Confirm archive or reopen decision'::"text"
                    WHEN ("lower"(COALESCE("b"."completion_state", ''::"text")) = 'rejected'::"text") THEN 'Review rejection and determine next strategy'::"text"
                    ELSE COALESCE("b"."completion_next_step", "b"."operator_next_step", 'Continue workflow'::"text")
                END AS "dashboard_next_step"
           FROM "base" "b"
        )
 SELECT "project_destination_selection_id",
    "project_id",
    "title",
    "destination_id",
    "destination_name",
    "destination_slug",
    "destination_category",
    "is_alleystreet",
    "is_primary_destination",
    "priority_order",
    "selection_status",
    "creator_goal",
    "release_strategy",
    "ready_to_submit",
    "required_fields_complete",
    "required_assets_complete",
    "submission_packet_id",
    "approval_decision_id",
    "release_status",
    "release_type",
    "platform_label",
    "territory_scope",
    "scheduled_release_at",
    "actual_release_at",
    "release_url",
    "submission_package_status",
    "upload_state",
    "submission_state",
    "final_submission_ready",
    "final_readiness_status",
    "final_readiness_note",
    "final_blocker_summary",
    "release_handoff_state",
    "next_handoff_action",
    "action_status",
    "action_status_note",
    "primary_operator_action",
    "operator_action_state",
    "recommended_next_step",
    "delivery_queue_status",
    "delivery_queue_order",
    "delivery_queue_label",
    "delivery_queue_note",
    "delivery_operator_instruction",
    "delivery_next_step",
    "delivery_board_state",
    "operator_lane",
    "operator_lane_order",
    "operator_card_label",
    "operator_card_note",
    "operator_work_instruction",
    "operator_priority_band",
    "operator_work_type",
    "operator_next_step",
    "operator_board_state",
    "rights_required_count",
    "rights_completed_count",
    "rights_approved_count",
    "deliverables_required_count",
    "deliverables_completed_count",
    "deliverables_approved_count",
    "monetization_status",
    "gross_revenue",
    "net_revenue",
    "first_revenue_at",
    "last_revenue_at",
    "payout_due_at",
    "payout_sent_at",
    "latest_review_stage",
    "latest_review_action",
    "latest_review_status",
    "latest_decision_summary",
    "latest_reviewed_at",
    "outcome_label",
    "outcome_reason",
    "outcome_effective_at",
    "lifecycle_stage",
    "lifecycle_stage_rank",
    "lifecycle_summary",
    "lifecycle_terminal_state",
    "lifecycle_effective_at",
    "live_monitor_state",
    "live_monitor_rank",
    "live_monitor_summary",
    "live_monitor_next_step",
    "appears_on_release_watch",
    "live_monitor_effective_at",
    "completion_state",
    "completion_rank",
    "completion_terminal_state",
    "completion_summary",
    "completion_next_step",
    "completion_percent",
    "completion_effective_at",
    "dashboard_band",
    "dashboard_status_label",
    "dashboard_summary_text",
    "dashboard_next_step"
   FROM "final"

-- statement 163 of 775
ALTER VIEW "public"."project_destination_completion_dashboard_view" OWNER TO "postgres"

-- statement 164 of 775
CREATE OR REPLACE VIEW "public"."project_destination_closeout_workboard_view" AS
 WITH "base" AS (
         SELECT "u"."project_destination_selection_id",
            "u"."project_id",
            "u"."title",
            "u"."destination_id",
            "u"."destination_name",
            "u"."destination_slug",
            "u"."destination_category",
            "u"."is_alleystreet",
            "u"."is_primary_destination",
            "u"."priority_order",
            "u"."selection_status",
            "u"."creator_goal",
            "u"."release_strategy",
            "u"."ready_to_submit",
            "u"."required_fields_complete",
            "u"."required_assets_complete",
            "u"."submission_packet_id",
            "u"."approval_decision_id",
            "u"."release_status",
            "u"."release_type",
            "u"."platform_label",
            "u"."territory_scope",
            "u"."scheduled_release_at",
            "u"."actual_release_at",
            "u"."release_url",
            "u"."submission_package_status",
            "u"."upload_state",
            "u"."submission_state",
            "u"."final_submission_ready",
            "u"."final_readiness_status",
            "u"."final_readiness_note",
            "u"."final_blocker_summary",
            "u"."release_handoff_state",
            "u"."next_handoff_action",
            "u"."action_status",
            "u"."action_status_note",
            "u"."primary_operator_action",
            "u"."operator_action_state",
            "u"."recommended_next_step",
            "u"."delivery_queue_status",
            "u"."delivery_queue_order",
            "u"."delivery_queue_label",
            "u"."delivery_queue_note",
            "u"."delivery_operator_instruction",
            "u"."delivery_next_step",
            "u"."delivery_board_state",
            "u"."operator_lane",
            "u"."operator_lane_order",
            "u"."operator_card_label",
            "u"."operator_card_note",
            "u"."operator_work_instruction",
            "u"."operator_priority_band",
            "u"."operator_work_type",
            "u"."operator_next_step",
            "u"."operator_board_state",
            "u"."rights_required_count",
            "u"."rights_completed_count",
            "u"."rights_approved_count",
            "u"."deliverables_required_count",
            "u"."deliverables_completed_count",
            "u"."deliverables_approved_count",
            "u"."monetization_status",
            "u"."gross_revenue",
            "u"."net_revenue",
            "u"."first_revenue_at",
            "u"."last_revenue_at",
            "u"."payout_due_at",
            "u"."payout_sent_at",
            "u"."latest_review_stage",
            "u"."latest_review_action",
            "u"."latest_review_status",
            "u"."latest_decision_summary",
            "u"."latest_reviewed_at",
            "u"."outcome_label",
            "u"."outcome_reason",
            "u"."outcome_effective_at",
            "u"."lifecycle_stage",
            "u"."lifecycle_stage_rank",
            "u"."lifecycle_summary",
            "u"."lifecycle_terminal_state",
            "u"."lifecycle_effective_at",
            "u"."live_monitor_state",
            "u"."live_monitor_rank",
            "u"."live_monitor_summary",
            "u"."live_monitor_next_step",
            "u"."appears_on_release_watch",
            "u"."live_monitor_effective_at",
            "u"."completion_state",
            "u"."completion_rank",
            "u"."completion_terminal_state",
            "u"."completion_summary",
            "u"."completion_next_step",
            "u"."completion_percent",
            "u"."completion_effective_at",
            "u"."dashboard_band",
            "u"."dashboard_status_label",
            "u"."dashboard_summary_text",
            "u"."dashboard_next_step"
           FROM "public"."project_destination_completion_dashboard_view" "u"
        ), "final" AS (
         SELECT "b"."project_destination_selection_id",
            "b"."project_id",
            "b"."title",
            "b"."destination_id",
            "b"."destination_name",
            "b"."destination_slug",
            "b"."destination_category",
            "b"."is_alleystreet",
            "b"."is_primary_destination",
            "b"."priority_order",
            "b"."selection_status",
            "b"."creator_goal",
            "b"."release_strategy",
            "b"."ready_to_submit",
            "b"."required_fields_complete",
            "b"."required_assets_complete",
            "b"."submission_packet_id",
            "b"."approval_decision_id",
            "b"."release_status",
            "b"."release_type",
            "b"."platform_label",
            "b"."territory_scope",
            "b"."scheduled_release_at",
            "b"."actual_release_at",
            "b"."release_url",
            "b"."submission_package_status",
            "b"."upload_state",
            "b"."submission_state",
            "b"."final_submission_ready",
            "b"."final_readiness_status",
            "b"."final_readiness_note",
            "b"."final_blocker_summary",
            "b"."release_handoff_state",
            "b"."next_handoff_action",
            "b"."action_status",
            "b"."action_status_note",
            "b"."primary_operator_action",
            "b"."operator_action_state",
            "b"."recommended_next_step",
            "b"."delivery_queue_status",
            "b"."delivery_queue_order",
            "b"."delivery_queue_label",
            "b"."delivery_queue_note",
            "b"."delivery_operator_instruction",
            "b"."delivery_next_step",
            "b"."delivery_board_state",
            "b"."operator_lane",
            "b"."operator_lane_order",
            "b"."operator_card_label",
            "b"."operator_card_note",
            "b"."operator_work_instruction",
            "b"."operator_priority_band",
            "b"."operator_work_type",
            "b"."operator_next_step",
            "b"."operator_board_state",
            "b"."rights_required_count",
            "b"."rights_completed_count",
            "b"."rights_approved_count",
            "b"."deliverables_required_count",
            "b"."deliverables_completed_count",
            "b"."deliverables_approved_count",
            "b"."monetization_status",
            "b"."gross_revenue",
            "b"."net_revenue",
            "b"."first_revenue_at",
            "b"."last_revenue_at",
            "b"."payout_due_at",
            "b"."payout_sent_at",
            "b"."latest_review_stage",
            "b"."latest_review_action",
            "b"."latest_review_status",
            "b"."latest_decision_summary",
            "b"."latest_reviewed_at",
            "b"."outcome_label",
            "b"."outcome_reason",
            "b"."outcome_effective_at",
            "b"."lifecycle_stage",
            "b"."lifecycle_stage_rank",
            "b"."lifecycle_summary",
            "b"."lifecycle_terminal_state",
            "b"."lifecycle_effective_at",
            "b"."live_monitor_state",
            "b"."live_monitor_rank",
            "b"."live_monitor_summary",
            "b"."live_monitor_next_step",
            "b"."appears_on_release_watch",
            "b"."live_monitor_effective_at",
            "b"."completion_state",
            "b"."completion_rank",
            "b"."completion_terminal_state",
            "b"."completion_summary",
            "b"."completion_next_step",
            "b"."completion_percent",
            "b"."completion_effective_at",
            "b"."dashboard_band",
            "b"."dashboard_status_label",
            "b"."dashboard_summary_text",
            "b"."dashboard_next_step",
                CASE
                    WHEN ("lower"(COALESCE("b"."completion_state", ''::"text")) = 'completed'::"text") THEN 'done'::"text"
                    WHEN ("lower"(COALESCE("b"."completion_state", ''::"text")) = ANY (ARRAY['withdrawn'::"text", 'rejected'::"text"])) THEN 'closeout_review'::"text"
                    WHEN ("lower"(COALESCE("b"."completion_state", ''::"text")) = 'scheduled_pending_completion'::"text") THEN 'scheduled_followup'::"text"
                    WHEN ("lower"(COALESCE("b"."completion_state", ''::"text")) = ANY (ARRAY['handoff_pending_completion'::"text", 'ready_pending_completion'::"text"])) THEN 'handoff_followup'::"text"
                    WHEN ("lower"(COALESCE("b"."completion_state", ''::"text")) = 'blocked'::"text") THEN 'resolve_blockers'::"text"
                    WHEN ("lower"(COALESCE("b"."completion_state", ''::"text")) = 'incomplete'::"text") THEN 'fix_requirements'::"text"
                    ELSE 'active_followup'::"text"
                END AS "closeout_lane",
                CASE
                    WHEN ("lower"(COALESCE("b"."completion_state", ''::"text")) = 'completed'::"text") THEN 900
                    WHEN ("lower"(COALESCE("b"."completion_state", ''::"text")) = ANY (ARRAY['withdrawn'::"text", 'rejected'::"text"])) THEN 800
                    WHEN ("lower"(COALESCE("b"."completion_state", ''::"text")) = 'scheduled_pending_completion'::"text") THEN 700
                    WHEN ("lower"(COALESCE("b"."completion_state", ''::"text")) = ANY (ARRAY['handoff_pending_completion'::"text", 'ready_pending_completion'::"text"])) THEN 600
                    WHEN ("lower"(COALESCE("b"."completion_state", ''::"text")) = 'blocked'::"text") THEN 200
                    WHEN ("lower"(COALESCE("b"."completion_state", ''::"text")) = 'incomplete'::"text") THEN 100
                    ELSE 500
                END AS "closeout_lane_order",
                CASE
                    WHEN ("lower"(COALESCE("b"."completion_state", ''::"text")) = 'completed'::"text") THEN 'Completed'::"text"
                    WHEN ("lower"(COALESCE("b"."completion_state", ''::"text")) = 'scheduled_pending_completion'::"text") THEN 'Scheduled Follow-Up'::"text"
                    WHEN ("lower"(COALESCE("b"."completion_state", ''::"text")) = 'handoff_pending_completion'::"text") THEN 'Handoff Follow-Up'::"text"
                    WHEN ("lower"(COALESCE("b"."completion_state", ''::"text")) = 'ready_pending_completion'::"text") THEN 'Ready for Completion Follow-Up'::"text"
                    WHEN ("lower"(COALESCE("b"."completion_state", ''::"text")) = 'blocked'::"text") THEN 'Resolve Blockers'::"text"
                    WHEN ("lower"(COALESCE("b"."completion_state", ''::"text")) = 'incomplete'::"text") THEN 'Fix Requirements'::"text"
                    WHEN ("lower"(COALESCE("b"."completion_state", ''::"text")) = 'withdrawn'::"text") THEN 'Withdrawn Review'::"text"
                    WHEN ("lower"(COALESCE("b"."completion_state", ''::"text")) = 'rejected'::"text") THEN 'Rejected Review'::"text"
                    ELSE 'Active Follow-Up'::"text"
                END AS "closeout_card_label",
                CASE
                    WHEN ("lower"(COALESCE("b"."completion_state", ''::"text")) = 'completed'::"text") THEN 'Destination release path is completed and ready for closeout confirmation.'::"text"
                    WHEN ("lower"(COALESCE("b"."completion_state", ''::"text")) = 'scheduled_pending_completion'::"text") THEN 'Destination is scheduled and needs closeout watch until completion.'::"text"
                    WHEN ("lower"(COALESCE("b"."completion_state", ''::"text")) = 'handoff_pending_completion'::"text") THEN 'Destination has reached handoff and needs completion follow-up.'::"text"
                    WHEN ("lower"(COALESCE("b"."completion_state", ''::"text")) = 'ready_pending_completion'::"text") THEN 'Destination is ready and needs final closeout movement.'::"text"
                    WHEN ("lower"(COALESCE("b"."completion_state", ''::"text")) = 'blocked'::"text") THEN COALESCE("b"."action_status_note", "b"."completion_summary", 'Destination is blocked and needs operator correction.'::"text")
                    WHEN ("lower"(COALESCE("b"."completion_state", ''::"text")) = 'incomplete'::"text") THEN COALESCE("b"."final_blocker_summary", "b"."dashboard_summary_text", 'Destination requirements remain incomplete.'::"text")
                    WHEN ("lower"(COALESCE("b"."completion_state", ''::"text")) = 'withdrawn'::"text") THEN COALESCE("b"."completion_summary", 'Destination path was withdrawn and needs closeout review.'::"text")
                    WHEN ("lower"(COALESCE("b"."completion_state", ''::"text")) = 'rejected'::"text") THEN COALESCE("b"."latest_decision_summary", "b"."completion_summary", 'Destination path was rejected and needs closeout review.'::"text")
                    ELSE COALESCE("b"."dashboard_summary_text", "b"."completion_summary", 'Continue closeout workboard follow-up.'::"text")
                END AS "closeout_card_note",
                CASE
                    WHEN ("lower"(COALESCE("b"."completion_state", ''::"text")) = 'completed'::"text") THEN COALESCE("b"."release_url", 'Confirm completion and archive'::"text")
                    WHEN ("lower"(COALESCE("b"."completion_state", ''::"text")) = 'scheduled_pending_completion'::"text") THEN 'Monitor schedule and confirm actual completion'::"text"
                    WHEN ("lower"(COALESCE("b"."completion_state", ''::"text")) = ANY (ARRAY['handoff_pending_completion'::"text", 'ready_pending_completion'::"text"])) THEN COALESCE("b"."next_handoff_action", "b"."dashboard_next_step", "b"."completion_next_step", 'Complete handoff and closeout'::"text")
                    WHEN ("lower"(COALESCE("b"."completion_state", ''::"text")) = 'blocked'::"text") THEN COALESCE("b"."recommended_next_step", "b"."action_status_note", 'Resolve blocking issue'::"text")
                    WHEN ("lower"(COALESCE("b"."completion_state", ''::"text")) = 'incomplete'::"text") THEN COALESCE("b"."final_blocker_summary", "b"."dashboard_next_step", 'Complete missing requirements'::"text")
                    WHEN ("lower"(COALESCE("b"."completion_state", ''::"text")) = 'withdrawn'::"text") THEN 'Confirm archive or reopen decision'::"text"
                    WHEN ("lower"(COALESCE("b"."completion_state", ''::"text")) = 'rejected'::"text") THEN 'Review rejection and determine resubmission or archive path'::"text"
                    ELSE COALESCE("b"."dashboard_next_step", "b"."completion_next_step", 'Continue closeout workflow'::"text")
                END AS "closeout_work_instruction",
                CASE
                    WHEN ("lower"(COALESCE("b"."completion_state", ''::"text")) = ANY (ARRAY['blocked'::"text", 'incomplete'::"text"])) THEN 'critical'::"text"
                    WHEN ("lower"(COALESCE("b"."completion_state", ''::"text")) = ANY (ARRAY['scheduled_pending_completion'::"text", 'handoff_pending_completion'::"text", 'ready_pending_completion'::"text"])) THEN 'active'::"text"
                    WHEN ("lower"(COALESCE("b"."completion_state", ''::"text")) = ANY (ARRAY['withdrawn'::"text", 'rejected'::"text"])) THEN 'review'::"text"
                    WHEN ("lower"(COALESCE("b"."completion_state", ''::"text")) = 'completed'::"text") THEN 'complete'::"text"
                    ELSE 'normal'::"text"
                END AS "closeout_priority_band",
                CASE
                    WHEN ("lower"(COALESCE("b"."completion_state", ''::"text")) = 'completed'::"text") THEN 'closeout_complete'::"text"
                    WHEN ("lower"(COALESCE("b"."completion_state", ''::"text")) = ANY (ARRAY['withdrawn'::"text", 'rejected'::"text"])) THEN 'closeout_review'::"text"
                    WHEN ("lower"(COALESCE("b"."completion_state", ''::"text")) = 'scheduled_pending_completion'::"text") THEN 'schedule_watch'::"text"
                    WHEN ("lower"(COALESCE("b"."completion_state", ''::"text")) = ANY (ARRAY['handoff_pending_completion'::"text", 'ready_pending_completion'::"text"])) THEN 'handoff_followup'::"text"
                    WHEN ("lower"(COALESCE("b"."completion_state", ''::"text")) = 'blocked'::"text") THEN 'blocker_resolution'::"text"
                    WHEN ("lower"(COALESCE("b"."completion_state", ''::"text")) = 'incomplete'::"text") THEN 'requirements_resolution'::"text"
                    ELSE 'workflow_followup'::"text"
                END AS "closeout_work_type",
                CASE
                    WHEN ("lower"(COALESCE("b"."completion_state", ''::"text")) = 'completed'::"text") THEN 'archive_or_summarize'::"text"
                    WHEN ("lower"(COALESCE("b"."completion_state", ''::"text")) = 'scheduled_pending_completion'::"text") THEN 'confirm_live_completion'::"text"
                    WHEN ("lower"(COALESCE("b"."completion_state", ''::"text")) = ANY (ARRAY['handoff_pending_completion'::"text", 'ready_pending_completion'::"text"])) THEN 'advance_to_completion'::"text"
                    WHEN ("lower"(COALESCE("b"."completion_state", ''::"text")) = 'blocked'::"text") THEN 'resolve_blockers_first'::"text"
                    WHEN ("lower"(COALESCE("b"."completion_state", ''::"text")) = 'incomplete'::"text") THEN 'complete_requirements_first'::"text"
                    WHEN ("lower"(COALESCE("b"."completion_state", ''::"text")) = 'withdrawn'::"text") THEN 'decide_archive_or_reopen'::"text"
                    WHEN ("lower"(COALESCE("b"."completion_state", ''::"text")) = 'rejected'::"text") THEN 'review_rejection_path'::"text"
                    ELSE 'continue_followup'::"text"
                END AS "closeout_next_step",
                CASE
                    WHEN ("lower"(COALESCE("b"."completion_state", ''::"text")) = ANY (ARRAY['blocked'::"text", 'incomplete'::"text"])) THEN 'work_needed'::"text"
                    WHEN ("lower"(COALESCE("b"."completion_state", ''::"text")) = ANY (ARRAY['scheduled_pending_completion'::"text", 'handoff_pending_completion'::"text", 'ready_pending_completion'::"text"])) THEN 'watch_and_move'::"text"
                    WHEN ("lower"(COALESCE("b"."completion_state", ''::"text")) = ANY (ARRAY['withdrawn'::"text", 'rejected'::"text"])) THEN 'review_needed'::"text"
                    WHEN ("lower"(COALESCE("b"."completion_state", ''::"text")) = 'completed'::"text") THEN 'done'::"text"
                    ELSE 'active'::"text"
                END AS "closeout_board_state",
            COALESCE("b"."completion_effective_at", "b"."live_monitor_effective_at", "b"."lifecycle_effective_at") AS "closeout_effective_at"
           FROM "base" "b"
        )
 SELECT "project_destination_selection_id",
    "project_id",
    "title",
    "destination_id",
    "destination_name",
    "destination_slug",
    "destination_category",
    "is_alleystreet",
    "is_primary_destination",
    "priority_order",
    "selection_status",
    "creator_goal",
    "release_strategy",
    "ready_to_submit",
    "required_fields_complete",
    "required_assets_complete",
    "submission_packet_id",
    "approval_decision_id",
    "release_status",
    "release_type",
    "platform_label",
    "territory_scope",
    "scheduled_release_at",
    "actual_release_at",
    "release_url",
    "submission_package_status",
    "upload_state",
    "submission_state",
    "final_submission_ready",
    "final_readiness_status",
    "final_readiness_note",
    "final_blocker_summary",
    "release_handoff_state",
    "next_handoff_action",
    "action_status",
    "action_status_note",
    "primary_operator_action",
    "operator_action_state",
    "recommended_next_step",
    "delivery_queue_status",
    "delivery_queue_order",
    "delivery_queue_label",
    "delivery_queue_note",
    "delivery_operator_instruction",
    "delivery_next_step",
    "delivery_board_state",
    "operator_lane",
    "operator_lane_order",
    "operator_card_label",
    "operator_card_note",
    "operator_work_instruction",
    "operator_priority_band",
    "operator_work_type",
    "operator_next_step",
    "operator_board_state",
    "rights_required_count",
    "rights_completed_count",
    "rights_approved_count",
    "deliverables_required_count",
    "deliverables_completed_count",
    "deliverables_approved_count",
    "monetization_status",
    "gross_revenue",
    "net_revenue",
    "first_revenue_at",
    "last_revenue_at",
    "payout_due_at",
    "payout_sent_at",
    "latest_review_stage",
    "latest_review_action",
    "latest_review_status",
    "latest_decision_summary",
    "latest_reviewed_at",
    "outcome_label",
    "outcome_reason",
    "outcome_effective_at",
    "lifecycle_stage",
    "lifecycle_stage_rank",
    "lifecycle_summary",
    "lifecycle_terminal_state",
    "lifecycle_effective_at",
    "live_monitor_state",
    "live_monitor_rank",
    "live_monitor_summary",
    "live_monitor_next_step",
    "appears_on_release_watch",
    "live_monitor_effective_at",
    "completion_state",
    "completion_rank",
    "completion_terminal_state",
    "completion_summary",
    "completion_next_step",
    "completion_percent",
    "completion_effective_at",
    "dashboard_band",
    "dashboard_status_label",
    "dashboard_summary_text",
    "dashboard_next_step",
    "closeout_lane",
    "closeout_lane_order",
    "closeout_card_label",
    "closeout_card_note",
    "closeout_work_instruction",
    "closeout_priority_band",
    "closeout_work_type",
    "closeout_next_step",
    "closeout_board_state",
    "closeout_effective_at"
   FROM "final"

-- statement 165 of 775
ALTER VIEW "public"."project_destination_closeout_workboard_view" OWNER TO "postgres"

-- statement 166 of 775
CREATE OR REPLACE VIEW "public"."project_destination_final_closeout_summary_view" AS
 WITH "base" AS (
         SELECT "v"."project_destination_selection_id",
            "v"."project_id",
            "v"."title",
            "v"."destination_id",
            "v"."destination_name",
            "v"."destination_slug",
            "v"."destination_category",
            "v"."is_alleystreet",
            "v"."is_primary_destination",
            "v"."priority_order",
            "v"."selection_status",
            "v"."creator_goal",
            "v"."release_strategy",
            "v"."ready_to_submit",
            "v"."required_fields_complete",
            "v"."required_assets_complete",
            "v"."submission_packet_id",
            "v"."approval_decision_id",
            "v"."release_status",
            "v"."release_type",
            "v"."platform_label",
            "v"."territory_scope",
            "v"."scheduled_release_at",
            "v"."actual_release_at",
            "v"."release_url",
            "v"."submission_package_status",
            "v"."upload_state",
            "v"."submission_state",
            "v"."final_submission_ready",
            "v"."final_readiness_status",
            "v"."final_readiness_note",
            "v"."final_blocker_summary",
            "v"."release_handoff_state",
            "v"."next_handoff_action",
            "v"."action_status",
            "v"."action_status_note",
            "v"."primary_operator_action",
            "v"."operator_action_state",
            "v"."recommended_next_step",
            "v"."delivery_queue_status",
            "v"."delivery_queue_order",
            "v"."delivery_queue_label",
            "v"."delivery_queue_note",
            "v"."delivery_operator_instruction",
            "v"."delivery_next_step",
            "v"."delivery_board_state",
            "v"."operator_lane",
            "v"."operator_lane_order",
            "v"."operator_card_label",
            "v"."operator_card_note",
            "v"."operator_work_instruction",
            "v"."operator_priority_band",
            "v"."operator_work_type",
            "v"."operator_next_step",
            "v"."operator_board_state",
            "v"."rights_required_count",
            "v"."rights_completed_count",
            "v"."rights_approved_count",
            "v"."deliverables_required_count",
            "v"."deliverables_completed_count",
            "v"."deliverables_approved_count",
            "v"."monetization_status",
            "v"."gross_revenue",
            "v"."net_revenue",
            "v"."first_revenue_at",
            "v"."last_revenue_at",
            "v"."payout_due_at",
            "v"."payout_sent_at",
            "v"."latest_review_stage",
            "v"."latest_review_action",
            "v"."latest_review_status",
            "v"."latest_decision_summary",
            "v"."latest_reviewed_at",
            "v"."outcome_label",
            "v"."outcome_reason",
            "v"."outcome_effective_at",
            "v"."lifecycle_stage",
            "v"."lifecycle_stage_rank",
            "v"."lifecycle_summary",
            "v"."lifecycle_terminal_state",
            "v"."lifecycle_effective_at",
            "v"."live_monitor_state",
            "v"."live_monitor_rank",
            "v"."live_monitor_summary",
            "v"."live_monitor_next_step",
            "v"."appears_on_release_watch",
            "v"."live_monitor_effective_at",
            "v"."completion_state",
            "v"."completion_rank",
            "v"."completion_terminal_state",
            "v"."completion_summary",
            "v"."completion_next_step",
            "v"."completion_percent",
            "v"."completion_effective_at",
            "v"."dashboard_band",
            "v"."dashboard_status_label",
            "v"."dashboard_summary_text",
            "v"."dashboard_next_step",
            "v"."closeout_lane",
            "v"."closeout_lane_order",
            "v"."closeout_card_label",
            "v"."closeout_card_note",
            "v"."closeout_work_instruction",
            "v"."closeout_priority_band",
            "v"."closeout_work_type",
            "v"."closeout_next_step",
            "v"."closeout_board_state",
            "v"."closeout_effective_at"
           FROM "public"."project_destination_closeout_workboard_view" "v"
        ), "final" AS (
         SELECT "b"."project_destination_selection_id",
            "b"."project_id",
            "b"."title",
            "b"."destination_id",
            "b"."destination_name",
            "b"."destination_slug",
            "b"."destination_category",
            "b"."is_alleystreet",
            "b"."is_primary_destination",
            "b"."priority_order",
            "b"."selection_status",
            "b"."creator_goal",
            "b"."release_strategy",
            "b"."ready_to_submit",
            "b"."required_fields_complete",
            "b"."required_assets_complete",
            "b"."submission_packet_id",
            "b"."approval_decision_id",
            "b"."release_status",
            "b"."release_type",
            "b"."platform_label",
            "b"."territory_scope",
            "b"."scheduled_release_at",
            "b"."actual_release_at",
            "b"."release_url",
            "b"."submission_package_status",
            "b"."upload_state",
            "b"."submission_state",
            "b"."final_submission_ready",
            "b"."final_readiness_status",
            "b"."final_readiness_note",
            "b"."final_blocker_summary",
            "b"."release_handoff_state",
            "b"."next_handoff_action",
            "b"."action_status",
            "b"."action_status_note",
            "b"."primary_operator_action",
            "b"."operator_action_state",
            "b"."recommended_next_step",
            "b"."delivery_queue_status",
            "b"."delivery_queue_order",
            "b"."delivery_queue_label",
            "b"."delivery_queue_note",
            "b"."delivery_operator_instruction",
            "b"."delivery_next_step",
            "b"."delivery_board_state",
            "b"."operator_lane",
            "b"."operator_lane_order",
            "b"."operator_card_label",
            "b"."operator_card_note",
            "b"."operator_work_instruction",
            "b"."operator_priority_band",
            "b"."operator_work_type",
            "b"."operator_next_step",
            "b"."operator_board_state",
            "b"."rights_required_count",
            "b"."rights_completed_count",
            "b"."rights_approved_count",
            "b"."deliverables_required_count",
            "b"."deliverables_completed_count",
            "b"."deliverables_approved_count",
            "b"."monetization_status",
            "b"."gross_revenue",
            "b"."net_revenue",
            "b"."first_revenue_at",
            "b"."last_revenue_at",
            "b"."payout_due_at",
            "b"."payout_sent_at",
            "b"."latest_review_stage",
            "b"."latest_review_action",
            "b"."latest_review_status",
            "b"."latest_decision_summary",
            "b"."latest_reviewed_at",
            "b"."outcome_label",
            "b"."outcome_reason",
            "b"."outcome_effective_at",
            "b"."lifecycle_stage",
            "b"."lifecycle_stage_rank",
            "b"."lifecycle_summary",
            "b"."lifecycle_terminal_state",
            "b"."lifecycle_effective_at",
            "b"."live_monitor_state",
            "b"."live_monitor_rank",
            "b"."live_monitor_summary",
            "b"."live_monitor_next_step",
            "b"."appears_on_release_watch",
            "b"."live_monitor_effective_at",
            "b"."completion_state",
            "b"."completion_rank",
            "b"."completion_terminal_state",
            "b"."completion_summary",
            "b"."completion_next_step",
            "b"."completion_percent",
            "b"."completion_effective_at",
            "b"."dashboard_band",
            "b"."dashboard_status_label",
            "b"."dashboard_summary_text",
            "b"."dashboard_next_step",
            "b"."closeout_lane",
            "b"."closeout_lane_order",
            "b"."closeout_card_label",
            "b"."closeout_card_note",
            "b"."closeout_work_instruction",
            "b"."closeout_priority_band",
            "b"."closeout_work_type",
            "b"."closeout_next_step",
            "b"."closeout_board_state",
            "b"."closeout_effective_at",
                CASE
                    WHEN ("lower"(COALESCE("b"."closeout_lane", ''::"text")) = 'done'::"text") THEN 'closeout_complete'::"text"
                    WHEN ("lower"(COALESCE("b"."closeout_lane", ''::"text")) = 'scheduled_followup'::"text") THEN 'closeout_pending_schedule_confirmation'::"text"
                    WHEN ("lower"(COALESCE("b"."closeout_lane", ''::"text")) = ANY (ARRAY['handoff_followup'::"text", 'active_followup'::"text"])) THEN 'closeout_in_progress'::"text"
                    WHEN ("lower"(COALESCE("b"."closeout_lane", ''::"text")) = 'resolve_blockers'::"text") THEN 'closeout_blocked'::"text"
                    WHEN ("lower"(COALESCE("b"."closeout_lane", ''::"text")) = 'fix_requirements'::"text") THEN 'closeout_incomplete'::"text"
                    WHEN ("lower"(COALESCE("b"."closeout_lane", ''::"text")) = 'closeout_review'::"text") THEN 'closeout_review_required'::"text"
                    ELSE 'closeout_open'::"text"
                END AS "final_closeout_state",
                CASE
                    WHEN ("lower"(COALESCE("b"."closeout_lane", ''::"text")) = 'done'::"text") THEN 100
                    WHEN ("lower"(COALESCE("b"."closeout_lane", ''::"text")) = 'scheduled_followup'::"text") THEN 85
                    WHEN ("lower"(COALESCE("b"."closeout_lane", ''::"text")) = ANY (ARRAY['handoff_followup'::"text", 'active_followup'::"text"])) THEN 65
                    WHEN ("lower"(COALESCE("b"."closeout_lane", ''::"text")) = 'closeout_review'::"text") THEN 55
                    WHEN ("lower"(COALESCE("b"."closeout_lane", ''::"text")) = 'resolve_blockers'::"text") THEN 20
                    WHEN ("lower"(COALESCE("b"."closeout_lane", ''::"text")) = 'fix_requirements'::"text") THEN 10
                    ELSE 40
                END AS "final_closeout_rank",
                CASE
                    WHEN ("lower"(COALESCE("b"."closeout_lane", ''::"text")) = 'done'::"text") THEN true
                    WHEN ("lower"(COALESCE("b"."completion_state", ''::"text")) = ANY (ARRAY['withdrawn'::"text", 'rejected'::"text"])) THEN true
                    ELSE false
                END AS "final_closeout_terminal_state",
                CASE
                    WHEN ("lower"(COALESCE("b"."closeout_lane", ''::"text")) = 'done'::"text") THEN 'Destination closeout is complete.'::"text"
                    WHEN ("lower"(COALESCE("b"."closeout_lane", ''::"text")) = 'scheduled_followup'::"text") THEN 'Destination needs final schedule confirmation before closeout can complete.'::"text"
                    WHEN ("lower"(COALESCE("b"."closeout_lane", ''::"text")) = 'handoff_followup'::"text") THEN 'Destination is in handoff follow-up and awaiting final closeout movement.'::"text"
                    WHEN ("lower"(COALESCE("b"."closeout_lane", ''::"text")) = 'active_followup'::"text") THEN 'Destination remains active in closeout follow-up.'::"text"
                    WHEN ("lower"(COALESCE("b"."closeout_lane", ''::"text")) = 'resolve_blockers'::"text") THEN COALESCE("b"."action_status_note", "b"."closeout_card_note", 'Destination is blocked in closeout.'::"text")
                    WHEN ("lower"(COALESCE("b"."closeout_lane", ''::"text")) = 'fix_requirements'::"text") THEN COALESCE("b"."final_blocker_summary", "b"."closeout_card_note", 'Destination still has incomplete requirements.'::"text")
                    WHEN ("lower"(COALESCE("b"."closeout_lane", ''::"text")) = 'closeout_review'::"text") THEN COALESCE("b"."closeout_card_note", "b"."completion_summary", 'Destination requires closeout review.'::"text")
                    ELSE COALESCE("b"."closeout_card_note", "b"."dashboard_summary_text", 'Destination remains open in closeout.'::"text")
                END AS "final_closeout_summary",
                CASE
                    WHEN ("lower"(COALESCE("b"."closeout_lane", ''::"text")) = 'done'::"text") THEN COALESCE("b"."release_url", 'Archive and preserve summary record'::"text")
                    WHEN ("lower"(COALESCE("b"."closeout_lane", ''::"text")) = 'scheduled_followup'::"text") THEN 'Confirm schedule and mark closeout complete when release is verified'::"text"
                    WHEN ("lower"(COALESCE("b"."closeout_lane", ''::"text")) = 'handoff_followup'::"text") THEN COALESCE("b"."closeout_next_step", "b"."closeout_work_instruction", 'Complete handoff follow-up'::"text")
                    WHEN ("lower"(COALESCE("b"."closeout_lane", ''::"text")) = 'active_followup'::"text") THEN COALESCE("b"."closeout_next_step", "b"."dashboard_next_step", 'Continue active closeout follow-up'::"text")
                    WHEN ("lower"(COALESCE("b"."closeout_lane", ''::"text")) = 'resolve_blockers'::"text") THEN COALESCE("b"."recommended_next_step", "b"."closeout_work_instruction", 'Resolve blockers before closeout'::"text")
                    WHEN ("lower"(COALESCE("b"."closeout_lane", ''::"text")) = 'fix_requirements'::"text") THEN COALESCE("b"."final_blocker_summary", "b"."closeout_work_instruction", 'Complete missing requirements'::"text")
                    WHEN ("lower"(COALESCE("b"."closeout_lane", ''::"text")) = 'closeout_review'::"text") THEN 'Review whether to archive, reopen, or reroute this destination path'::"text"
                    ELSE COALESCE("b"."closeout_next_step", "b"."closeout_work_instruction", 'Continue final closeout workflow'::"text")
                END AS "final_closeout_next_step",
            COALESCE("b"."closeout_effective_at", "b"."completion_effective_at", "b"."lifecycle_effective_at") AS "final_closeout_effective_at"
           FROM "base" "b"
        )
 SELECT "project_destination_selection_id",
    "project_id",
    "title",
    "destination_id",
    "destination_name",
    "destination_slug",
    "destination_category",
    "is_alleystreet",
    "is_primary_destination",
    "priority_order",
    "selection_status",
    "creator_goal",
    "release_strategy",
    "ready_to_submit",
    "required_fields_complete",
    "required_assets_complete",
    "submission_packet_id",
    "approval_decision_id",
    "release_status",
    "release_type",
    "platform_label",
    "territory_scope",
    "scheduled_release_at",
    "actual_release_at",
    "release_url",
    "submission_package_status",
    "upload_state",
    "submission_state",
    "final_submission_ready",
    "final_readiness_status",
    "final_readiness_note",
    "final_blocker_summary",
    "release_handoff_state",
    "next_handoff_action",
    "action_status",
    "action_status_note",
    "primary_operator_action",
    "operator_action_state",
    "recommended_next_step",
    "delivery_queue_status",
    "delivery_queue_order",
    "delivery_queue_label",
    "delivery_queue_note",
    "delivery_operator_instruction",
    "delivery_next_step",
    "delivery_board_state",
    "operator_lane",
    "operator_lane_order",
    "operator_card_label",
    "operator_card_note",
    "operator_work_instruction",
    "operator_priority_band",
    "operator_work_type",
    "operator_next_step",
    "operator_board_state",
    "rights_required_count",
    "rights_completed_count",
    "rights_approved_count",
    "deliverables_required_count",
    "deliverables_completed_count",
    "deliverables_approved_count",
    "monetization_status",
    "gross_revenue",
    "net_revenue",
    "first_revenue_at",
    "last_revenue_at",
    "payout_due_at",
    "payout_sent_at",
    "latest_review_stage",
    "latest_review_action",
    "latest_review_status",
    "latest_decision_summary",
    "latest_reviewed_at",
    "outcome_label",
    "outcome_reason",
    "outcome_effective_at",
    "lifecycle_stage",
    "lifecycle_stage_rank",
    "lifecycle_summary",
    "lifecycle_terminal_state",
    "lifecycle_effective_at",
    "live_monitor_state",
    "live_monitor_rank",
    "live_monitor_summary",
    "live_monitor_next_step",
    "appears_on_release_watch",
    "live_monitor_effective_at",
    "completion_state",
    "completion_rank",
    "completion_terminal_state",
    "completion_summary",
    "completion_next_step",
    "completion_percent",
    "completion_effective_at",
    "dashboard_band",
    "dashboard_status_label",
    "dashboard_summary_text",
    "dashboard_next_step",
    "closeout_lane",
    "closeout_lane_order",
    "closeout_card_label",
    "closeout_card_note",
    "closeout_work_instruction",
    "closeout_priority_band",
    "closeout_work_type",
    "closeout_next_step",
    "closeout_board_state",
    "closeout_effective_at",
    "final_closeout_state",
    "final_closeout_rank",
    "final_closeout_terminal_state",
    "final_closeout_summary",
    "final_closeout_next_step",
    "final_closeout_effective_at"
   FROM "final"

-- statement 167 of 775
ALTER VIEW "public"."project_destination_final_closeout_summary_view" OWNER TO "postgres"

-- statement 168 of 775
CREATE OR REPLACE VIEW "public"."project_destination_archive_historical_record_view" AS
 WITH "base" AS (
         SELECT "w"."project_destination_selection_id",
            "w"."project_id",
            "w"."title",
            "w"."destination_id",
            "w"."destination_name",
            "w"."destination_slug",
            "w"."destination_category",
            "w"."is_alleystreet",
            "w"."is_primary_destination",
            "w"."priority_order",
            "w"."selection_status",
            "w"."creator_goal",
            "w"."release_strategy",
            "w"."ready_to_submit",
            "w"."required_fields_complete",
            "w"."required_assets_complete",
            "w"."submission_packet_id",
            "w"."approval_decision_id",
            "w"."release_status",
            "w"."release_type",
            "w"."platform_label",
            "w"."territory_scope",
            "w"."scheduled_release_at",
            "w"."actual_release_at",
            "w"."release_url",
            "w"."submission_package_status",
            "w"."upload_state",
            "w"."submission_state",
            "w"."final_submission_ready",
            "w"."final_readiness_status",
            "w"."final_readiness_note",
            "w"."final_blocker_summary",
            "w"."release_handoff_state",
            "w"."next_handoff_action",
            "w"."action_status",
            "w"."action_status_note",
            "w"."primary_operator_action",
            "w"."operator_action_state",
            "w"."recommended_next_step",
            "w"."delivery_queue_status",
            "w"."delivery_queue_order",
            "w"."delivery_queue_label",
            "w"."delivery_queue_note",
            "w"."delivery_operator_instruction",
            "w"."delivery_next_step",
            "w"."delivery_board_state",
            "w"."operator_lane",
            "w"."operator_lane_order",
            "w"."operator_card_label",
            "w"."operator_card_note",
            "w"."operator_work_instruction",
            "w"."operator_priority_band",
            "w"."operator_work_type",
            "w"."operator_next_step",
            "w"."operator_board_state",
            "w"."rights_required_count",
            "w"."rights_completed_count",
            "w"."rights_approved_count",
            "w"."deliverables_required_count",
            "w"."deliverables_completed_count",
            "w"."deliverables_approved_count",
            "w"."monetization_status",
            "w"."gross_revenue",
            "w"."net_revenue",
            "w"."first_revenue_at",
            "w"."last_revenue_at",
            "w"."payout_due_at",
            "w"."payout_sent_at",
            "w"."latest_review_stage",
            "w"."latest_review_action",
            "w"."latest_review_status",
            "w"."latest_decision_summary",
            "w"."latest_reviewed_at",
            "w"."outcome_label",
            "w"."outcome_reason",
            "w"."outcome_effective_at",
            "w"."lifecycle_stage",
            "w"."lifecycle_stage_rank",
            "w"."lifecycle_summary",
            "w"."lifecycle_terminal_state",
            "w"."lifecycle_effective_at",
            "w"."live_monitor_state",
            "w"."live_monitor_rank",
            "w"."live_monitor_summary",
            "w"."live_monitor_next_step",
            "w"."appears_on_release_watch",
            "w"."live_monitor_effective_at",
            "w"."completion_state",
            "w"."completion_rank",
            "w"."completion_terminal_state",
            "w"."completion_summary",
            "w"."completion_next_step",
            "w"."completion_percent",
            "w"."completion_effective_at",
            "w"."dashboard_band",
            "w"."dashboard_status_label",
            "w"."dashboard_summary_text",
            "w"."dashboard_next_step",
            "w"."closeout_lane",
            "w"."closeout_lane_order",
            "w"."closeout_card_label",
            "w"."closeout_card_note",
            "w"."closeout_work_instruction",
            "w"."closeout_priority_band",
            "w"."closeout_work_type",
            "w"."closeout_next_step",
            "w"."closeout_board_state",
            "w"."closeout_effective_at",
            "w"."final_closeout_state",
            "w"."final_closeout_rank",
            "w"."final_closeout_terminal_state",
            "w"."final_closeout_summary",
            "w"."final_closeout_next_step",
            "w"."final_closeout_effective_at"
           FROM "public"."project_destination_final_closeout_summary_view" "w"
        ), "final" AS (
         SELECT "b"."project_destination_selection_id",
            "b"."project_id",
            "b"."title",
            "b"."destination_id",
            "b"."destination_name",
            "b"."destination_slug",
            "b"."destination_category",
            "b"."is_alleystreet",
            "b"."is_primary_destination",
            "b"."priority_order",
            "b"."selection_status",
            "b"."creator_goal",
            "b"."release_strategy",
            "b"."ready_to_submit",
            "b"."required_fields_complete",
            "b"."required_assets_complete",
            "b"."submission_packet_id",
            "b"."approval_decision_id",
            "b"."release_status",
            "b"."release_type",
            "b"."platform_label",
            "b"."territory_scope",
            "b"."scheduled_release_at",
            "b"."actual_release_at",
            "b"."release_url",
            "b"."submission_package_status",
            "b"."upload_state",
            "b"."submission_state",
            "b"."final_submission_ready",
            "b"."final_readiness_status",
            "b"."final_readiness_note",
            "b"."final_blocker_summary",
            "b"."release_handoff_state",
            "b"."next_handoff_action",
            "b"."action_status",
            "b"."action_status_note",
            "b"."primary_operator_action",
            "b"."operator_action_state",
            "b"."recommended_next_step",
            "b"."delivery_queue_status",
            "b"."delivery_queue_order",
            "b"."delivery_queue_label",
            "b"."delivery_queue_note",
            "b"."delivery_operator_instruction",
            "b"."delivery_next_step",
            "b"."delivery_board_state",
            "b"."operator_lane",
            "b"."operator_lane_order",
            "b"."operator_card_label",
            "b"."operator_card_note",
            "b"."operator_work_instruction",
            "b"."operator_priority_band",
            "b"."operator_work_type",
            "b"."operator_next_step",
            "b"."operator_board_state",
            "b"."rights_required_count",
            "b"."rights_completed_count",
            "b"."rights_approved_count",
            "b"."deliverables_required_count",
            "b"."deliverables_completed_count",
            "b"."deliverables_approved_count",
            "b"."monetization_status",
            "b"."gross_revenue",
            "b"."net_revenue",
            "b"."first_revenue_at",
            "b"."last_revenue_at",
            "b"."payout_due_at",
            "b"."payout_sent_at",
            "b"."latest_review_stage",
            "b"."latest_review_action",
            "b"."latest_review_status",
            "b"."latest_decision_summary",
            "b"."latest_reviewed_at",
            "b"."outcome_label",
            "b"."outcome_reason",
            "b"."outcome_effective_at",
            "b"."lifecycle_stage",
            "b"."lifecycle_stage_rank",
            "b"."lifecycle_summary",
            "b"."lifecycle_terminal_state",
            "b"."lifecycle_effective_at",
            "b"."live_monitor_state",
            "b"."live_monitor_rank",
            "b"."live_monitor_summary",
            "b"."live_monitor_next_step",
            "b"."appears_on_release_watch",
            "b"."live_monitor_effective_at",
            "b"."completion_state",
            "b"."completion_rank",
            "b"."completion_terminal_state",
            "b"."completion_summary",
            "b"."completion_next_step",
            "b"."completion_percent",
            "b"."completion_effective_at",
            "b"."dashboard_band",
            "b"."dashboard_status_label",
            "b"."dashboard_summary_text",
            "b"."dashboard_next_step",
            "b"."closeout_lane",
            "b"."closeout_lane_order",
            "b"."closeout_card_label",
            "b"."closeout_card_note",
            "b"."closeout_work_instruction",
            "b"."closeout_priority_band",
            "b"."closeout_work_type",
            "b"."closeout_next_step",
            "b"."closeout_board_state",
            "b"."closeout_effective_at",
            "b"."final_closeout_state",
            "b"."final_closeout_rank",
            "b"."final_closeout_terminal_state",
            "b"."final_closeout_summary",
            "b"."final_closeout_next_step",
            "b"."final_closeout_effective_at",
                CASE
                    WHEN ("lower"(COALESCE("b"."final_closeout_state", ''::"text")) = 'closeout_complete'::"text") THEN 'archived_complete'::"text"
                    WHEN ("lower"(COALESCE("b"."final_closeout_state", ''::"text")) = 'closeout_review_required'::"text") THEN 'archived_review'::"text"
                    WHEN ("lower"(COALESCE("b"."final_closeout_state", ''::"text")) = 'closeout_pending_schedule_confirmation'::"text") THEN 'archived_pending_confirmation'::"text"
                    WHEN ("lower"(COALESCE("b"."final_closeout_state", ''::"text")) = 'closeout_blocked'::"text") THEN 'archived_blocked'::"text"
                    WHEN ("lower"(COALESCE("b"."final_closeout_state", ''::"text")) = 'closeout_incomplete'::"text") THEN 'archived_incomplete'::"text"
                    WHEN ("lower"(COALESCE("b"."final_closeout_state", ''::"text")) = 'closeout_in_progress'::"text") THEN 'archived_in_progress'::"text"
                    ELSE 'archived_open'::"text"
                END AS "archive_record_state",
                CASE
                    WHEN ("lower"(COALESCE("b"."final_closeout_state", ''::"text")) = 'closeout_complete'::"text") THEN 100
                    WHEN ("lower"(COALESCE("b"."final_closeout_state", ''::"text")) = 'closeout_pending_schedule_confirmation'::"text") THEN 85
                    WHEN ("lower"(COALESCE("b"."final_closeout_state", ''::"text")) = 'closeout_review_required'::"text") THEN 70
                    WHEN ("lower"(COALESCE("b"."final_closeout_state", ''::"text")) = 'closeout_in_progress'::"text") THEN 55
                    WHEN ("lower"(COALESCE("b"."final_closeout_state", ''::"text")) = 'closeout_blocked'::"text") THEN 20
                    WHEN ("lower"(COALESCE("b"."final_closeout_state", ''::"text")) = 'closeout_incomplete'::"text") THEN 10
                    ELSE 40
                END AS "archive_record_rank",
                CASE
                    WHEN (COALESCE("b"."final_closeout_terminal_state", false) = true) THEN true
                    WHEN ("lower"(COALESCE("b"."final_closeout_state", ''::"text")) = 'closeout_complete'::"text") THEN true
                    ELSE false
                END AS "archive_terminal_state",
                CASE
                    WHEN ("lower"(COALESCE("b"."final_closeout_state", ''::"text")) = 'closeout_complete'::"text") THEN 'Historical record preserved after successful closeout.'::"text"
                    WHEN ("lower"(COALESCE("b"."final_closeout_state", ''::"text")) = 'closeout_pending_schedule_confirmation'::"text") THEN 'Historical record preserved while awaiting final schedule confirmation.'::"text"
                    WHEN ("lower"(COALESCE("b"."final_closeout_state", ''::"text")) = 'closeout_review_required'::"text") THEN COALESCE("b"."final_closeout_summary", 'Historical record preserved for review state.'::"text")
                    WHEN ("lower"(COALESCE("b"."final_closeout_state", ''::"text")) = 'closeout_blocked'::"text") THEN COALESCE("b"."final_closeout_summary", "b"."action_status_note", 'Historical record preserved with blocker state.'::"text")
                    WHEN ("lower"(COALESCE("b"."final_closeout_state", ''::"text")) = 'closeout_incomplete'::"text") THEN COALESCE("b"."final_closeout_summary", "b"."final_blocker_summary", 'Historical record preserved with incomplete state.'::"text")
                    WHEN ("lower"(COALESCE("b"."final_closeout_state", ''::"text")) = 'closeout_in_progress'::"text") THEN COALESCE("b"."final_closeout_summary", 'Historical record preserved while closeout remains in progress.'::"text")
                    ELSE COALESCE("b"."final_closeout_summary", 'Historical record preserved in open state.'::"text")
                END AS "archive_record_summary",
                CASE
                    WHEN ("lower"(COALESCE("b"."final_closeout_state", ''::"text")) = 'closeout_complete'::"text") THEN COALESCE("b"."release_url", 'Archive complete record'::"text")
                    WHEN ("lower"(COALESCE("b"."final_closeout_state", ''::"text")) = 'closeout_pending_schedule_confirmation'::"text") THEN 'Confirm schedule outcome, then finalize archive state'::"text"
                    WHEN ("lower"(COALESCE("b"."final_closeout_state", ''::"text")) = 'closeout_review_required'::"text") THEN 'Review final disposition before archive lock'::"text"
                    WHEN ("lower"(COALESCE("b"."final_closeout_state", ''::"text")) = 'closeout_blocked'::"text") THEN COALESCE("b"."final_closeout_next_step", 'Resolve blocker before archive lock'::"text")
                    WHEN ("lower"(COALESCE("b"."final_closeout_state", ''::"text")) = 'closeout_incomplete'::"text") THEN COALESCE("b"."final_closeout_next_step", 'Complete requirements or archive as incomplete'::"text")
                    WHEN ("lower"(COALESCE("b"."final_closeout_state", ''::"text")) = 'closeout_in_progress'::"text") THEN COALESCE("b"."final_closeout_next_step", 'Continue closeout before archive lock'::"text")
                    ELSE COALESCE("b"."final_closeout_next_step", 'Continue archive review'::"text")
                END AS "archive_record_next_step",
            COALESCE("b"."final_closeout_effective_at", "b"."closeout_effective_at", "b"."completion_effective_at", "b"."lifecycle_effective_at") AS "archive_effective_at"
           FROM "base" "b"
        )
 SELECT "project_destination_selection_id",
    "project_id",
    "title",
    "destination_id",
    "destination_name",
    "destination_slug",
    "destination_category",
    "is_alleystreet",
    "is_primary_destination",
    "priority_order",
    "selection_status",
    "creator_goal",
    "release_strategy",
    "ready_to_submit",
    "required_fields_complete",
    "required_assets_complete",
    "submission_packet_id",
    "approval_decision_id",
    "release_status",
    "release_type",
    "platform_label",
    "territory_scope",
    "scheduled_release_at",
    "actual_release_at",
    "release_url",
    "submission_package_status",
    "upload_state",
    "submission_state",
    "final_submission_ready",
    "final_readiness_status",
    "final_readiness_note",
    "final_blocker_summary",
    "release_handoff_state",
    "next_handoff_action",
    "action_status",
    "action_status_note",
    "primary_operator_action",
    "operator_action_state",
    "recommended_next_step",
    "delivery_queue_status",
    "delivery_queue_order",
    "delivery_queue_label",
    "delivery_queue_note",
    "delivery_operator_instruction",
    "delivery_next_step",
    "delivery_board_state",
    "operator_lane",
    "operator_lane_order",
    "operator_card_label",
    "operator_card_note",
    "operator_work_instruction",
    "operator_priority_band",
    "operator_work_type",
    "operator_next_step",
    "operator_board_state",
    "rights_required_count",
    "rights_completed_count",
    "rights_approved_count",
    "deliverables_required_count",
    "deliverables_completed_count",
    "deliverables_approved_count",
    "monetization_status",
    "gross_revenue",
    "net_revenue",
    "first_revenue_at",
    "last_revenue_at",
    "payout_due_at",
    "payout_sent_at",
    "latest_review_stage",
    "latest_review_action",
    "latest_review_status",
    "latest_decision_summary",
    "latest_reviewed_at",
    "outcome_label",
    "outcome_reason",
    "outcome_effective_at",
    "lifecycle_stage",
    "lifecycle_stage_rank",
    "lifecycle_summary",
    "lifecycle_terminal_state",
    "lifecycle_effective_at",
    "live_monitor_state",
    "live_monitor_rank",
    "live_monitor_summary",
    "live_monitor_next_step",
    "appears_on_release_watch",
    "live_monitor_effective_at",
    "completion_state",
    "completion_rank",
    "completion_terminal_state",
    "completion_summary",
    "completion_next_step",
    "completion_percent",
    "completion_effective_at",
    "dashboard_band",
    "dashboard_status_label",
    "dashboard_summary_text",
    "dashboard_next_step",
    "closeout_lane",
    "closeout_lane_order",
    "closeout_card_label",
    "closeout_card_note",
    "closeout_work_instruction",
    "closeout_priority_band",
    "closeout_work_type",
    "closeout_next_step",
    "closeout_board_state",
    "closeout_effective_at",
    "final_closeout_state",
    "final_closeout_rank",
    "final_closeout_terminal_state",
    "final_closeout_summary",
    "final_closeout_next_step",
    "final_closeout_effective_at",
    "archive_record_state",
    "archive_record_rank",
    "archive_terminal_state",
    "archive_record_summary",
    "archive_record_next_step",
    "archive_effective_at"
   FROM "final"

-- statement 169 of 775
ALTER VIEW "public"."project_destination_archive_historical_record_view" OWNER TO "postgres"

-- statement 170 of 775
CREATE OR REPLACE VIEW "public"."project_destination_executive_summary_view" AS
 WITH "base" AS (
         SELECT "z"."project_destination_selection_id",
            "z"."project_id",
            "z"."title",
            "z"."destination_id",
            "z"."destination_name",
            "z"."destination_slug",
            "z"."destination_category",
            "z"."is_alleystreet",
            "z"."is_primary_destination",
            "z"."priority_order",
            "z"."selection_status",
            "z"."creator_goal",
            "z"."release_strategy",
            "z"."rights_confirmed",
            "z"."required_fields_complete",
            "z"."required_assets_complete",
            "z"."guidance_reviewed",
            "z"."planned_submission_at",
            "z"."submitted_at",
            "z"."decision_received_at",
            "z"."target_release_at",
            "z"."ready_to_submit",
            "z"."next_destination_action",
            "z"."readiness_gap_summary",
            "z"."submission_packet_id",
            "z"."approval_decision_id",
            "z"."release_status",
            "z"."release_type",
            "z"."platform_label",
            "z"."territory_scope",
            "z"."scheduled_release_at",
            "z"."actual_release_at",
            "z"."release_url",
            "z"."submission_package_status",
            "z"."upload_state",
            "z"."submission_state",
            "z"."final_submission_ready",
            "z"."final_readiness_status",
            "z"."final_readiness_note",
            "z"."final_blocker_summary",
            "z"."release_handoff_state",
            "z"."action_status",
            "z"."action_status_note",
            "z"."primary_operator_action",
            "z"."operator_action_state",
            "z"."recommended_next_step",
            "z"."delivery_queue_status",
            "z"."delivery_queue_label",
            "z"."delivery_next_step",
            "z"."operator_lane",
            "z"."operator_priority_band",
            "z"."rights_required_count",
            "z"."rights_completed_count",
            "z"."rights_approved_count",
            "z"."deliverables_required_count",
            "z"."deliverables_completed_count",
            "z"."deliverables_approved_count",
            "z"."monetization_status",
            "z"."gross_revenue",
            "z"."net_revenue",
            "z"."first_revenue_at",
            "z"."last_revenue_at",
            "z"."payout_due_at",
            "z"."payout_sent_at",
            "z"."latest_review_stage",
            "z"."latest_review_action",
            "z"."latest_review_status",
            "z"."latest_decision_summary",
            "z"."latest_reviewed_at",
            "z"."outcome_label",
            "z"."outcome_reason",
            "z"."outcome_effective_at",
            "z"."lifecycle_stage",
            "z"."lifecycle_stage_rank",
            "z"."lifecycle_summary",
            "z"."lifecycle_terminal_state",
            "z"."lifecycle_effective_at"
           FROM "public"."project_destination_master_lifecycle_view" "z"
        ), "final" AS (
         SELECT "b"."project_destination_selection_id",
            "b"."project_id",
            "b"."title",
            "b"."destination_id",
            "b"."destination_name",
            "b"."destination_slug",
            "b"."destination_category",
            "b"."is_alleystreet",
            "b"."is_primary_destination",
            "b"."priority_order",
            "b"."selection_status",
            "b"."creator_goal",
            "b"."release_strategy",
            "b"."rights_confirmed",
            "b"."required_fields_complete",
            "b"."required_assets_complete",
            "b"."guidance_reviewed",
            "b"."planned_submission_at",
            "b"."submitted_at",
            "b"."decision_received_at",
            "b"."target_release_at",
            "b"."ready_to_submit",
            "b"."next_destination_action",
            "b"."readiness_gap_summary",
            "b"."submission_packet_id",
            "b"."approval_decision_id",
            "b"."release_status",
            "b"."release_type",
            "b"."platform_label",
            "b"."territory_scope",
            "b"."scheduled_release_at",
            "b"."actual_release_at",
            "b"."release_url",
            "b"."submission_package_status",
            "b"."upload_state",
            "b"."submission_state",
            "b"."final_submission_ready",
            "b"."final_readiness_status",
            "b"."final_readiness_note",
            "b"."final_blocker_summary",
            "b"."release_handoff_state",
            "b"."action_status",
            "b"."action_status_note",
            "b"."primary_operator_action",
            "b"."operator_action_state",
            "b"."recommended_next_step",
            "b"."delivery_queue_status",
            "b"."delivery_queue_label",
            "b"."delivery_next_step",
            "b"."operator_lane",
            "b"."operator_priority_band",
            "b"."rights_required_count",
            "b"."rights_completed_count",
            "b"."rights_approved_count",
            "b"."deliverables_required_count",
            "b"."deliverables_completed_count",
            "b"."deliverables_approved_count",
            "b"."monetization_status",
            "b"."gross_revenue",
            "b"."net_revenue",
            "b"."first_revenue_at",
            "b"."last_revenue_at",
            "b"."payout_due_at",
            "b"."payout_sent_at",
            "b"."latest_review_stage",
            "b"."latest_review_action",
            "b"."latest_review_status",
            "b"."latest_decision_summary",
            "b"."latest_reviewed_at",
            "b"."outcome_label",
            "b"."outcome_reason",
            "b"."outcome_effective_at",
            "b"."lifecycle_stage",
            "b"."lifecycle_stage_rank",
            "b"."lifecycle_summary",
            "b"."lifecycle_terminal_state",
            "b"."lifecycle_effective_at",
                CASE
                    WHEN ("b"."lifecycle_terminal_state" = true) THEN 'closed'::"text"
                    WHEN ("lower"(COALESCE("b"."lifecycle_stage", ''::"text")) = ANY (ARRAY['handoff_ready'::"text", 'submission_ready'::"text"])) THEN 'ready'::"text"
                    WHEN ("lower"(COALESCE("b"."lifecycle_stage", ''::"text")) = ANY (ARRAY['blocked'::"text", 'structurally_incomplete'::"text", 'incomplete'::"text"])) THEN 'attention'::"text"
                    ELSE 'active'::"text"
                END AS "executive_health_band",
                CASE
                    WHEN ("lower"(COALESCE("b"."lifecycle_stage", ''::"text")) = 'released'::"text") THEN 'Released'::"text"
                    WHEN ("lower"(COALESCE("b"."lifecycle_stage", ''::"text")) = 'scheduled'::"text") THEN 'Scheduled'::"text"
                    WHEN ("lower"(COALESCE("b"."lifecycle_stage", ''::"text")) = 'handoff_ready'::"text") THEN 'Handoff Ready'::"text"
                    WHEN ("lower"(COALESCE("b"."lifecycle_stage", ''::"text")) = 'submission_ready'::"text") THEN 'Submission Ready'::"text"
                    WHEN ("lower"(COALESCE("b"."lifecycle_stage", ''::"text")) = 'structurally_incomplete'::"text") THEN 'Structurally Incomplete'::"text"
                    WHEN ("lower"(COALESCE("b"."lifecycle_stage", ''::"text")) = 'incomplete'::"text") THEN 'Incomplete'::"text"
                    WHEN ("lower"(COALESCE("b"."lifecycle_stage", ''::"text")) = 'blocked'::"text") THEN 'Blocked'::"text"
                    WHEN ("lower"(COALESCE("b"."lifecycle_stage", ''::"text")) = 'withdrawn'::"text") THEN 'Withdrawn'::"text"
                    WHEN ("lower"(COALESCE("b"."lifecycle_stage", ''::"text")) = 'rejected'::"text") THEN 'Rejected'::"text"
                    ELSE 'In Progress'::"text"
                END AS "executive_status_label",
                CASE
                    WHEN ("lower"(COALESCE("b"."lifecycle_stage", ''::"text")) = 'released'::"text") THEN 'Project has completed release for this destination.'::"text"
                    WHEN ("lower"(COALESCE("b"."lifecycle_stage", ''::"text")) = 'scheduled'::"text") THEN 'Project is scheduled for release for this destination.'::"text"
                    WHEN ("lower"(COALESCE("b"."lifecycle_stage", ''::"text")) = 'handoff_ready'::"text") THEN 'Project is operationally ready for release handoff.'::"text"
                    WHEN ("lower"(COALESCE("b"."lifecycle_stage", ''::"text")) = 'submission_ready'::"text") THEN 'Project is ready to submit but not yet fully handed off.'::"text"
                    WHEN ("lower"(COALESCE("b"."lifecycle_stage", ''::"text")) = 'structurally_incomplete'::"text") THEN COALESCE("b"."readiness_gap_summary", "b"."final_blocker_summary", 'Submission structure is incomplete.'::"text")
                    WHEN ("lower"(COALESCE("b"."lifecycle_stage", ''::"text")) = 'incomplete'::"text") THEN COALESCE("b"."final_blocker_summary", "b"."outcome_reason", 'Requirements remain incomplete.'::"text")
                    WHEN ("lower"(COALESCE("b"."lifecycle_stage", ''::"text")) = 'blocked'::"text") THEN COALESCE("b"."action_status_note", "b"."outcome_reason", 'Workflow is blocked.'::"text")
                    WHEN ("lower"(COALESCE("b"."lifecycle_stage", ''::"text")) = 'rejected'::"text") THEN COALESCE("b"."latest_decision_summary", "b"."outcome_reason", 'Submission was rejected.'::"text")
                    WHEN ("lower"(COALESCE("b"."lifecycle_stage", ''::"text")) = 'withdrawn'::"text") THEN COALESCE("b"."outcome_reason", 'Submission or release path was withdrawn.'::"text")
                    ELSE COALESCE("b"."lifecycle_summary", "b"."outcome_reason", 'Continue lifecycle progression.'::"text")
                END AS "executive_summary_text",
                CASE
                    WHEN ("lower"(COALESCE("b"."lifecycle_stage", ''::"text")) = 'released'::"text") THEN 'Monitor post-release performance and monetization'::"text"
                    WHEN ("lower"(COALESCE("b"."lifecycle_stage", ''::"text")) = 'scheduled'::"text") THEN 'Confirm release schedule and final launch readiness'::"text"
                    WHEN ("lower"(COALESCE("b"."lifecycle_stage", ''::"text")) = 'handoff_ready'::"text") THEN COALESCE("b"."recommended_next_step", "b"."delivery_next_step", 'Complete release handoff'::"text")
                    WHEN ("lower"(COALESCE("b"."lifecycle_stage", ''::"text")) = 'submission_ready'::"text") THEN COALESCE("b"."next_destination_action", "b"."recommended_next_step", 'Submit to destination'::"text")
                    WHEN ("lower"(COALESCE("b"."lifecycle_stage", ''::"text")) = ANY (ARRAY['structurally_incomplete'::"text", 'incomplete'::"text"])) THEN COALESCE("b"."final_blocker_summary", "b"."readiness_gap_summary", 'Complete missing requirements'::"text")
                    WHEN ("lower"(COALESCE("b"."lifecycle_stage", ''::"text")) = 'blocked'::"text") THEN COALESCE("b"."recommended_next_step", "b"."action_status_note", 'Resolve blocking issue'::"text")
                    WHEN ("lower"(COALESCE("b"."lifecycle_stage", ''::"text")) = 'rejected'::"text") THEN COALESCE("b"."latest_decision_summary", 'Review rejection and revise package'::"text")
                    WHEN ("lower"(COALESCE("b"."lifecycle_stage", ''::"text")) = 'withdrawn'::"text") THEN 'Confirm whether to reopen or archive this destination path'::"text"
                    ELSE COALESCE("b"."recommended_next_step", "b"."next_destination_action", 'Continue workflow'::"text")
                END AS "executive_next_step",
                CASE
                    WHEN (COALESCE("b"."rights_required_count", (0)::bigint) = 0) THEN NULL::numeric
                    ELSE "round"((((COALESCE("b"."rights_completed_count", (0)::bigint))::numeric / (NULLIF("b"."rights_required_count", 0))::numeric) * (100)::numeric), 2)
                END AS "rights_completion_pct",
                CASE
                    WHEN (COALESCE("b"."deliverables_required_count", (0)::bigint) = 0) THEN NULL::numeric
                    ELSE "round"((((COALESCE("b"."deliverables_completed_count", (0)::bigint))::numeric / (NULLIF("b"."deliverables_required_count", 0))::numeric) * (100)::numeric), 2)
                END AS "deliverables_completion_pct"
           FROM "base" "b"
        )
 SELECT "project_destination_selection_id",
    "project_id",
    "title",
    "destination_id",
    "destination_name",
    "destination_slug",
    "destination_category",
    "is_alleystreet",
    "is_primary_destination",
    "priority_order",
    "selection_status",
    "creator_goal",
    "release_strategy",
    "rights_confirmed",
    "guidance_reviewed",
    "required_fields_complete",
    "required_assets_complete",
    "ready_to_submit",
    "submission_packet_id",
    "approval_decision_id",
    "release_status",
    "release_type",
    "platform_label",
    "territory_scope",
    "scheduled_release_at",
    "actual_release_at",
    "release_url",
    "submission_package_status",
    "upload_state",
    "submission_state",
    "final_submission_ready",
    "final_readiness_status",
    "final_readiness_note",
    "final_blocker_summary",
    "release_handoff_state",
    "action_status",
    "action_status_note",
    "primary_operator_action",
    "operator_action_state",
    "recommended_next_step",
    "delivery_queue_status",
    "delivery_queue_label",
    "delivery_next_step",
    "operator_lane",
    "operator_priority_band",
    "rights_required_count",
    "rights_completed_count",
    "rights_approved_count",
    "rights_completion_pct",
    "deliverables_required_count",
    "deliverables_completed_count",
    "deliverables_approved_count",
    "deliverables_completion_pct",
    "monetization_status",
    "gross_revenue",
    "net_revenue",
    "first_revenue_at",
    "last_revenue_at",
    "payout_due_at",
    "payout_sent_at",
    "latest_review_stage",
    "latest_review_action",
    "latest_review_status",
    "latest_decision_summary",
    "latest_reviewed_at",
    "outcome_label",
    "outcome_reason",
    "outcome_effective_at",
    "lifecycle_stage",
    "lifecycle_stage_rank",
    "lifecycle_summary",
    "lifecycle_terminal_state",
    "lifecycle_effective_at",
    "executive_health_band",
    "executive_status_label",
    "executive_summary_text",
    "executive_next_step",
    "planned_submission_at",
    "submitted_at",
    "decision_received_at",
    "target_release_at",
    "next_destination_action",
    "readiness_gap_summary"
   FROM "final"

-- statement 171 of 775
ALTER VIEW "public"."project_destination_executive_summary_view" OWNER TO "postgres"

-- statement 172 of 775
CREATE OR REPLACE VIEW "public"."project_destination_release_tracking_view" AS
 SELECT "id",
    "project_id",
    "destination_id",
    "submission_packet_id",
    "approval_decision_id",
    "release_status",
    "release_type",
    "platform_label",
    "territory_scope",
    "scheduled_release_at",
    "actual_release_at",
    "release_url",
    "release_notes",
    "internal_notes",
    "public_visible",
    "active",
    "created_at",
    "updated_at"
   FROM "public"."project_distribution_release_tracking"

-- statement 173 of 775
ALTER VIEW "public"."project_destination_release_tracking_view" OWNER TO "postgres"

-- statement 174 of 775
CREATE SEQUENCE IF NOT EXISTS "public"."project_destination_selections_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1

-- statement 175 of 775
ALTER SEQUENCE "public"."project_destination_selections_id_seq" OWNER TO "postgres"

-- statement 176 of 775
ALTER SEQUENCE "public"."project_destination_selections_id_seq" OWNED BY "public"."project_destination_selections"."id"

-- statement 177 of 775
CREATE SEQUENCE IF NOT EXISTS "public"."project_distribution_release_tracking_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1

-- statement 178 of 775
ALTER SEQUENCE "public"."project_distribution_release_tracking_id_seq" OWNER TO "postgres"

-- statement 179 of 775
ALTER SEQUENCE "public"."project_distribution_release_tracking_id_seq" OWNED BY "public"."project_distribution_release_tracking"."id"

-- statement 180 of 775
CREATE SEQUENCE IF NOT EXISTS "public"."project_monetization_tracking_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1

-- statement 181 of 775
ALTER SEQUENCE "public"."project_monetization_tracking_id_seq" OWNER TO "postgres"

-- statement 182 of 775
ALTER SEQUENCE "public"."project_monetization_tracking_id_seq" OWNED BY "public"."project_monetization_tracking"."id"

-- statement 183 of 775
CREATE TABLE IF NOT EXISTS "public"."project_rights_checklist" (
    "id" bigint NOT NULL,
    "check_item_name" "text" NOT NULL,
    "description" "text",
    "required" boolean DEFAULT true NOT NULL,
    "active" boolean DEFAULT true NOT NULL,
    "sort_order" integer DEFAULT 100 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
)

-- statement 184 of 775
ALTER TABLE "public"."project_rights_checklist" OWNER TO "postgres"

-- statement 185 of 775
CREATE SEQUENCE IF NOT EXISTS "public"."project_rights_checklist_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1

-- statement 186 of 775
ALTER SEQUENCE "public"."project_rights_checklist_id_seq" OWNER TO "postgres"

-- statement 187 of 775
ALTER SEQUENCE "public"."project_rights_checklist_id_seq" OWNED BY "public"."project_rights_checklist"."id"

-- statement 188 of 775
CREATE SEQUENCE IF NOT EXISTS "public"."project_rights_tracking_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1

-- statement 189 of 775
ALTER SEQUENCE "public"."project_rights_tracking_id_seq" OWNER TO "postgres"

-- statement 190 of 775
ALTER SEQUENCE "public"."project_rights_tracking_id_seq" OWNED BY "public"."project_rights_tracking"."id"

-- statement 191 of 775
CREATE SEQUENCE IF NOT EXISTS "public"."project_statuses_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1

-- statement 192 of 775
ALTER SEQUENCE "public"."project_statuses_id_seq" OWNER TO "postgres"

-- statement 193 of 775
ALTER SEQUENCE "public"."project_statuses_id_seq" OWNED BY "public"."project_statuses"."id"

-- statement 194 of 775
CREATE TABLE IF NOT EXISTS "public"."project_submission_packets" (
    "id" bigint NOT NULL,
    "project_id" bigint NOT NULL,
    "destination_id" bigint NOT NULL,
    "submission_round" integer DEFAULT 1 NOT NULL,
    "packet_status" "text" DEFAULT 'Draft'::"text" NOT NULL,
    "included_final_master" boolean DEFAULT false NOT NULL,
    "included_metadata_sheet" boolean DEFAULT false NOT NULL,
    "included_captions" boolean DEFAULT false NOT NULL,
    "included_key_art" boolean DEFAULT false NOT NULL,
    "included_credits_list" boolean DEFAULT false NOT NULL,
    "rights_review_complete" boolean DEFAULT false NOT NULL,
    "readiness_snapshot" "jsonb",
    "submitted_at" timestamp with time zone,
    "reviewed_at" timestamp with time zone,
    "approved_at" timestamp with time zone,
    "rejected_at" timestamp with time zone,
    "submitted_by_label" "text",
    "reviewed_by_label" "text",
    "packet_notes" "text",
    "review_notes" "text",
    "active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
)

-- statement 195 of 775
ALTER TABLE "public"."project_submission_packets" OWNER TO "postgres"

-- statement 196 of 775
CREATE SEQUENCE IF NOT EXISTS "public"."project_submission_packets_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1

-- statement 197 of 775
ALTER SEQUENCE "public"."project_submission_packets_id_seq" OWNER TO "postgres"

-- statement 198 of 775
ALTER SEQUENCE "public"."project_submission_packets_id_seq" OWNED BY "public"."project_submission_packets"."id"

-- statement 199 of 775
CREATE SEQUENCE IF NOT EXISTS "public"."project_submission_review_log_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1

-- statement 200 of 775
ALTER SEQUENCE "public"."project_submission_review_log_id_seq" OWNER TO "postgres"

-- statement 201 of 775
ALTER SEQUENCE "public"."project_submission_review_log_id_seq" OWNED BY "public"."project_submission_review_log"."id"

-- statement 202 of 775
CREATE SEQUENCE IF NOT EXISTS "public"."projects_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1

-- statement 203 of 775
ALTER SEQUENCE "public"."projects_id_seq" OWNER TO "postgres"

-- statement 204 of 775
ALTER SEQUENCE "public"."projects_id_seq" OWNED BY "public"."projects"."id"

-- statement 205 of 775
CREATE TABLE IF NOT EXISTS "public"."provider_profiles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "owner_user_id" "uuid" NOT NULL,
    "provider_type" "text" NOT NULL,
    "business_name" "text" NOT NULL,
    "slug" "text",
    "description" "text",
    "phone" "text",
    "website" "text",
    "city" "text",
    "state" "text",
    "country" "text" DEFAULT 'USA'::"text",
    "zone_name" "text",
    "is_verified" boolean DEFAULT false NOT NULL,
    "insurance_status" "text",
    "active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
)

-- statement 206 of 775
ALTER TABLE "public"."provider_profiles" OWNER TO "postgres"

-- statement 207 of 775
CREATE TABLE IF NOT EXISTS "public"."resource_relationships" (
    "id" bigint NOT NULL,
    "primary_listing_type_id" bigint NOT NULL,
    "primary_department_id" bigint,
    "primary_category_id" bigint NOT NULL,
    "suggested_listing_type_id" bigint NOT NULL,
    "suggested_department_id" bigint,
    "suggested_category_id" bigint NOT NULL,
    "reason" "text",
    "active" boolean DEFAULT true NOT NULL,
    "weight" integer DEFAULT 100 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
)

-- statement 208 of 775
ALTER TABLE "public"."resource_relationships" OWNER TO "postgres"

-- statement 209 of 775
CREATE SEQUENCE IF NOT EXISTS "public"."resource_relationships_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1

-- statement 210 of 775
ALTER SEQUENCE "public"."resource_relationships_id_seq" OWNER TO "postgres"

-- statement 211 of 775
ALTER SEQUENCE "public"."resource_relationships_id_seq" OWNED BY "public"."resource_relationships"."id"

-- statement 212 of 775
CREATE TABLE IF NOT EXISTS "public"."shoot_requirements" (
    "id" bigint NOT NULL,
    "shoot_type_id" bigint NOT NULL,
    "required_listing_type_id" bigint NOT NULL,
    "required_department_id" bigint,
    "required_category_id" bigint NOT NULL,
    "required_subcategory_name" "text",
    "priority" "text" DEFAULT 'Recommended'::"text" NOT NULL,
    "default_qty" "text",
    "optional" boolean DEFAULT false NOT NULL,
    "reason" "text",
    "active" boolean DEFAULT true NOT NULL,
    "sort_order" integer DEFAULT 100 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
)

-- statement 213 of 775
ALTER TABLE "public"."shoot_requirements" OWNER TO "postgres"

-- statement 214 of 775
CREATE SEQUENCE IF NOT EXISTS "public"."shoot_requirements_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1

-- statement 215 of 775
ALTER SEQUENCE "public"."shoot_requirements_id_seq" OWNER TO "postgres"

-- statement 216 of 775
ALTER SEQUENCE "public"."shoot_requirements_id_seq" OWNED BY "public"."shoot_requirements"."id"

-- statement 217 of 775
CREATE TABLE IF NOT EXISTS "public"."shoot_types" (
    "id" bigint NOT NULL,
    "shoot_type_name" "text" NOT NULL,
    "description" "text",
    "default_listing_type" "text",
    "default_crew_size" "text",
    "indoor_outdoor" "text",
    "active" boolean DEFAULT true NOT NULL,
    "sort_order" integer DEFAULT 100 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
)

-- statement 218 of 775
ALTER TABLE "public"."shoot_types" OWNER TO "postgres"

-- statement 219 of 775
CREATE SEQUENCE IF NOT EXISTS "public"."shoot_types_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1

-- statement 220 of 775
ALTER SEQUENCE "public"."shoot_types_id_seq" OWNER TO "postgres"

-- statement 221 of 775
ALTER SEQUENCE "public"."shoot_types_id_seq" OWNED BY "public"."shoot_types"."id"

-- statement 222 of 775
ALTER TABLE ONLY "public"."categories" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."categories_id_seq"'::"regclass")

-- statement 223 of 775
ALTER TABLE ONLY "public"."departments" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."departments_id_seq"'::"regclass")

-- statement 224 of 775
ALTER TABLE ONLY "public"."destination_asset_requirements" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."destination_asset_requirements_id_seq"'::"regclass")

-- statement 225 of 775
ALTER TABLE ONLY "public"."destination_field_mappings" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."destination_field_mappings_id_seq"'::"regclass")

-- statement 226 of 775
ALTER TABLE ONLY "public"."distribution_destinations" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."distribution_destinations_id_seq"'::"regclass")

-- statement 227 of 775
ALTER TABLE ONLY "public"."listing_attributes" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."listing_attributes_id_seq"'::"regclass")

-- statement 228 of 775
ALTER TABLE ONLY "public"."listing_types" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."listing_types_id_seq"'::"regclass")

-- statement 229 of 775
ALTER TABLE ONLY "public"."project_activity_log" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."project_activity_log_id_seq"'::"regclass")

-- statement 230 of 775
ALTER TABLE ONLY "public"."project_approval_decisions" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."project_approval_decisions_id_seq"'::"regclass")

-- statement 231 of 775
ALTER TABLE ONLY "public"."project_deliverable_tracking" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."project_deliverable_tracking_id_seq"'::"regclass")

-- statement 232 of 775
ALTER TABLE ONLY "public"."project_deliverables" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."project_deliverables_id_seq"'::"regclass")

-- statement 233 of 775
ALTER TABLE ONLY "public"."project_destination_selections" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."project_destination_selections_id_seq"'::"regclass")

-- statement 234 of 775
ALTER TABLE ONLY "public"."project_distribution_release_tracking" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."project_distribution_release_tracking_id_seq"'::"regclass")

-- statement 235 of 775
ALTER TABLE ONLY "public"."project_monetization_tracking" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."project_monetization_tracking_id_seq"'::"regclass")

-- statement 236 of 775
ALTER TABLE ONLY "public"."project_rights_checklist" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."project_rights_checklist_id_seq"'::"regclass")

-- statement 237 of 775
ALTER TABLE ONLY "public"."project_rights_tracking" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."project_rights_tracking_id_seq"'::"regclass")

-- statement 238 of 775
ALTER TABLE ONLY "public"."project_statuses" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."project_statuses_id_seq"'::"regclass")

-- statement 239 of 775
ALTER TABLE ONLY "public"."project_submission_packets" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."project_submission_packets_id_seq"'::"regclass")

-- statement 240 of 775
ALTER TABLE ONLY "public"."project_submission_review_log" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."project_submission_review_log_id_seq"'::"regclass")

-- statement 241 of 775
ALTER TABLE ONLY "public"."projects" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."projects_id_seq"'::"regclass")

-- statement 242 of 775
ALTER TABLE ONLY "public"."resource_relationships" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."resource_relationships_id_seq"'::"regclass")

-- statement 243 of 775
ALTER TABLE ONLY "public"."shoot_requirements" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."shoot_requirements_id_seq"'::"regclass")

-- statement 244 of 775
ALTER TABLE ONLY "public"."shoot_types" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."shoot_types_id_seq"'::"regclass")

-- statement 245 of 775
ALTER TABLE ONLY "public"."booking_messages"
    ADD CONSTRAINT "booking_messages_pkey" PRIMARY KEY ("id")

-- statement 246 of 775
ALTER TABLE ONLY "public"."booking_offers"
    ADD CONSTRAINT "booking_offers_pkey" PRIMARY KEY ("id")

-- statement 247 of 775
ALTER TABLE ONLY "public"."booking_requests"
    ADD CONSTRAINT "booking_requests_pkey" PRIMARY KEY ("id")

-- statement 248 of 775
ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_listing_type_id_department_id_category_name_subc_key" UNIQUE ("listing_type_id", "department_id", "category_name", "subcategory_name")

-- statement 249 of 775
ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_pkey" PRIMARY KEY ("id")

-- statement 250 of 775
ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_slug_key" UNIQUE ("slug")

-- statement 251 of 775
ALTER TABLE ONLY "public"."departments"
    ADD CONSTRAINT "departments_department_sub_department_key" UNIQUE ("department", "sub_department")

-- statement 252 of 775
ALTER TABLE ONLY "public"."departments"
    ADD CONSTRAINT "departments_pkey" PRIMARY KEY ("id")

-- statement 253 of 775
ALTER TABLE ONLY "public"."destination_asset_requirements"
    ADD CONSTRAINT "destination_asset_requirements_pkey" PRIMARY KEY ("id")

-- statement 254 of 775
ALTER TABLE ONLY "public"."destination_asset_requirements"
    ADD CONSTRAINT "destination_asset_requirements_unique_asset" UNIQUE ("destination_id", "asset_key")

-- statement 255 of 775
ALTER TABLE ONLY "public"."destination_field_mappings"
    ADD CONSTRAINT "destination_field_mappings_pkey" PRIMARY KEY ("id")

-- statement 256 of 775
ALTER TABLE ONLY "public"."destination_field_mappings"
    ADD CONSTRAINT "destination_field_mappings_unique_term" UNIQUE ("destination_id", "source_field_key", "destination_term")

-- statement 257 of 775
ALTER TABLE ONLY "public"."distribution_destinations"
    ADD CONSTRAINT "distribution_destinations_destination_name_key" UNIQUE ("destination_name")

-- statement 258 of 775
ALTER TABLE ONLY "public"."distribution_destinations"
    ADD CONSTRAINT "distribution_destinations_destination_slug_key" UNIQUE ("destination_slug")

-- statement 259 of 775
ALTER TABLE ONLY "public"."distribution_destinations"
    ADD CONSTRAINT "distribution_destinations_pkey" PRIMARY KEY ("id")

-- statement 260 of 775
ALTER TABLE ONLY "public"."host_listing_submissions"
    ADD CONSTRAINT "host_listing_submissions_pkey" PRIMARY KEY ("id")

-- statement 261 of 775
ALTER TABLE ONLY "public"."listing_attributes"
    ADD CONSTRAINT "listing_attributes_category_id_attribute_name_key" UNIQUE ("category_id", "attribute_name")

-- statement 262 of 775
ALTER TABLE ONLY "public"."listing_attributes"
    ADD CONSTRAINT "listing_attributes_pkey" PRIMARY KEY ("id")

-- statement 263 of 775
ALTER TABLE ONLY "public"."listing_types"
    ADD CONSTRAINT "listing_types_name_key" UNIQUE ("name")

-- statement 264 of 775
ALTER TABLE ONLY "public"."listing_types"
    ADD CONSTRAINT "listing_types_pkey" PRIMARY KEY ("id")

-- statement 265 of 775
ALTER TABLE ONLY "public"."policy_acceptances"
    ADD CONSTRAINT "policy_acceptances_pkey" PRIMARY KEY ("id")

-- statement 266 of 775
ALTER TABLE ONLY "public"."policy_acceptances"
    ADD CONSTRAINT "policy_acceptances_user_id_policy_key_policy_version_key" UNIQUE ("user_id", "policy_key", "policy_version")

-- statement 267 of 775
ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_email_key" UNIQUE ("email")

-- statement 268 of 775
ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")

-- statement 269 of 775
ALTER TABLE ONLY "public"."project_activity_log"
    ADD CONSTRAINT "project_activity_log_pkey" PRIMARY KEY ("id")

-- statement 270 of 775
ALTER TABLE ONLY "public"."project_approval_decisions"
    ADD CONSTRAINT "project_approval_decisions_pkey" PRIMARY KEY ("id")

-- statement 271 of 775
ALTER TABLE ONLY "public"."project_deliverable_tracking"
    ADD CONSTRAINT "project_deliverable_tracking_pkey" PRIMARY KEY ("id")

-- statement 272 of 775
ALTER TABLE ONLY "public"."project_deliverables"
    ADD CONSTRAINT "project_deliverables_deliverable_name_key" UNIQUE ("deliverable_name")

-- statement 273 of 775
ALTER TABLE ONLY "public"."project_deliverables"
    ADD CONSTRAINT "project_deliverables_pkey" PRIMARY KEY ("id")

-- statement 274 of 775
ALTER TABLE ONLY "public"."project_destination_selections"
    ADD CONSTRAINT "project_destination_selections_pkey" PRIMARY KEY ("id")

-- statement 275 of 775
ALTER TABLE ONLY "public"."project_destination_selections"
    ADD CONSTRAINT "project_destination_selections_unique" UNIQUE ("project_id", "destination_id")

-- statement 276 of 775
ALTER TABLE ONLY "public"."project_distribution_release_tracking"
    ADD CONSTRAINT "project_distribution_release_tracking_pkey" PRIMARY KEY ("id")

-- statement 277 of 775
ALTER TABLE ONLY "public"."project_monetization_tracking"
    ADD CONSTRAINT "project_monetization_tracking_pkey" PRIMARY KEY ("id")

-- statement 278 of 775
ALTER TABLE ONLY "public"."project_rights_checklist"
    ADD CONSTRAINT "project_rights_checklist_check_item_name_key" UNIQUE ("check_item_name")

-- statement 279 of 775
ALTER TABLE ONLY "public"."project_rights_checklist"
    ADD CONSTRAINT "project_rights_checklist_pkey" PRIMARY KEY ("id")

-- statement 280 of 775
ALTER TABLE ONLY "public"."project_rights_tracking"
    ADD CONSTRAINT "project_rights_tracking_pkey" PRIMARY KEY ("id")

-- statement 281 of 775
ALTER TABLE ONLY "public"."project_statuses"
    ADD CONSTRAINT "project_statuses_pkey" PRIMARY KEY ("id")

-- statement 282 of 775
ALTER TABLE ONLY "public"."project_statuses"
    ADD CONSTRAINT "project_statuses_status_name_key" UNIQUE ("status_name")

-- statement 283 of 775
ALTER TABLE ONLY "public"."project_submission_packets"
    ADD CONSTRAINT "project_submission_packets_pkey" PRIMARY KEY ("id")

-- statement 284 of 775
ALTER TABLE ONLY "public"."project_submission_review_log"
    ADD CONSTRAINT "project_submission_review_log_pkey" PRIMARY KEY ("id")

-- statement 285 of 775
ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_pkey" PRIMARY KEY ("id")

-- statement 286 of 775
ALTER TABLE ONLY "public"."provider_profiles"
    ADD CONSTRAINT "provider_profiles_pkey" PRIMARY KEY ("id")

-- statement 287 of 775
ALTER TABLE ONLY "public"."provider_profiles"
    ADD CONSTRAINT "provider_profiles_slug_key" UNIQUE ("slug")

-- statement 288 of 775
ALTER TABLE ONLY "public"."resource_relationships"
    ADD CONSTRAINT "resource_relationships_pkey" PRIMARY KEY ("id")

-- statement 289 of 775
ALTER TABLE ONLY "public"."resource_relationships"
    ADD CONSTRAINT "resource_relationships_primary_category_id_suggested_catego_key" UNIQUE ("primary_category_id", "suggested_category_id")

-- statement 290 of 775
ALTER TABLE ONLY "public"."shoot_requirements"
    ADD CONSTRAINT "shoot_requirements_pkey" PRIMARY KEY ("id")

-- statement 291 of 775
ALTER TABLE ONLY "public"."shoot_types"
    ADD CONSTRAINT "shoot_types_pkey" PRIMARY KEY ("id")

-- statement 292 of 775
ALTER TABLE ONLY "public"."shoot_types"
    ADD CONSTRAINT "shoot_types_shoot_type_name_key" UNIQUE ("shoot_type_name")

-- statement 293 of 775
ALTER TABLE ONLY "public"."project_approval_decisions"
    ADD CONSTRAINT "uq_project_approval_decisions" UNIQUE ("submission_packet_id", "decision_status", "decision_at")

-- statement 294 of 775
ALTER TABLE ONLY "public"."project_deliverable_tracking"
    ADD CONSTRAINT "uq_project_deliverable_tracking" UNIQUE ("project_id", "deliverable_id")

-- statement 295 of 775
ALTER TABLE ONLY "public"."project_distribution_release_tracking"
    ADD CONSTRAINT "uq_project_distribution_release_tracking" UNIQUE ("project_id", "destination_id", "release_type", "scheduled_release_at")

-- statement 296 of 775
ALTER TABLE ONLY "public"."project_monetization_tracking"
    ADD CONSTRAINT "uq_project_monetization_tracking" UNIQUE ("project_id", "destination_id", "revenue_stream_type")

-- statement 297 of 775
ALTER TABLE ONLY "public"."project_rights_tracking"
    ADD CONSTRAINT "uq_project_rights_tracking" UNIQUE ("project_id", "rights_check_item_id")

-- statement 298 of 775
ALTER TABLE ONLY "public"."project_submission_packets"
    ADD CONSTRAINT "uq_project_submission_packets" UNIQUE ("project_id", "destination_id", "submission_round")

-- statement 299 of 775
CREATE INDEX "booking_requests_host_user_id_idx" ON "public"."booking_requests" USING "btree" ("host_user_id")

-- statement 300 of 775
CREATE INDEX "idx_categories_active" ON "public"."categories" USING "btree" ("active")

-- statement 301 of 775
CREATE INDEX "idx_categories_category_name" ON "public"."categories" USING "btree" ("category_name")

-- statement 302 of 775
CREATE INDEX "idx_categories_department" ON "public"."categories" USING "btree" ("department_id")

-- statement 303 of 775
CREATE INDEX "idx_categories_listing_type" ON "public"."categories" USING "btree" ("listing_type_id")

-- statement 304 of 775
CREATE INDEX "idx_categories_subcategory_name" ON "public"."categories" USING "btree" ("subcategory_name")

-- statement 305 of 775
CREATE INDEX "idx_departments_active" ON "public"."departments" USING "btree" ("active")

-- statement 306 of 775
CREATE INDEX "idx_departments_department" ON "public"."departments" USING "btree" ("department")

-- statement 307 of 775
CREATE INDEX "idx_destination_asset_requirements_asset_key" ON "public"."destination_asset_requirements" USING "btree" ("asset_key")

-- statement 308 of 775
CREATE INDEX "idx_destination_asset_requirements_destination" ON "public"."destination_asset_requirements" USING "btree" ("destination_id")

-- statement 309 of 775
CREATE INDEX "idx_destination_field_mappings_destination" ON "public"."destination_field_mappings" USING "btree" ("destination_id")

-- statement 310 of 775
CREATE INDEX "idx_destination_field_mappings_source_field" ON "public"."destination_field_mappings" USING "btree" ("source_field_key")

-- statement 311 of 775
CREATE INDEX "idx_distribution_destinations_category" ON "public"."distribution_destinations" USING "btree" ("destination_category")

-- statement 312 of 775
CREATE INDEX "idx_distribution_destinations_status" ON "public"."distribution_destinations" USING "btree" ("destination_status")

-- statement 313 of 775
CREATE INDEX "idx_listing_attributes_active" ON "public"."listing_attributes" USING "btree" ("active")

-- statement 314 of 775
CREATE INDEX "idx_listing_attributes_attribute_name" ON "public"."listing_attributes" USING "btree" ("attribute_name")

-- statement 315 of 775
CREATE INDEX "idx_listing_attributes_category" ON "public"."listing_attributes" USING "btree" ("category_id")

-- statement 316 of 775
CREATE INDEX "idx_listing_attributes_department" ON "public"."listing_attributes" USING "btree" ("department_id")

-- statement 317 of 775
CREATE INDEX "idx_listing_attributes_listing_type" ON "public"."listing_attributes" USING "btree" ("listing_type_id")

-- statement 318 of 775
CREATE INDEX "idx_listing_attributes_searchable" ON "public"."listing_attributes" USING "btree" ("is_searchable")

-- statement 319 of 775
CREATE INDEX "idx_listing_types_active" ON "public"."listing_types" USING "btree" ("active")

-- statement 320 of 775
CREATE INDEX "idx_profiles_knowledge_level" ON "public"."profiles" USING "btree" ("knowledge_level")

-- statement 321 of 775
CREATE INDEX "idx_profiles_role" ON "public"."profiles" USING "btree" ("user_role")

-- statement 322 of 775
CREATE INDEX "idx_project_activity_log_activity_at" ON "public"."project_activity_log" USING "btree" ("activity_at" DESC)

-- statement 323 of 775
CREATE INDEX "idx_project_activity_log_activity_type" ON "public"."project_activity_log" USING "btree" ("activity_type")

-- statement 324 of 775
CREATE INDEX "idx_project_activity_log_project_id" ON "public"."project_activity_log" USING "btree" ("project_id")

-- statement 325 of 775
CREATE INDEX "idx_project_activity_log_status_id" ON "public"."project_activity_log" USING "btree" ("status_id")

-- statement 326 of 775
CREATE INDEX "idx_project_approval_decisions_decision_at" ON "public"."project_approval_decisions" USING "btree" ("decision_at" DESC)

-- statement 327 of 775
CREATE INDEX "idx_project_approval_decisions_destination_id" ON "public"."project_approval_decisions" USING "btree" ("destination_id")

-- statement 328 of 775
CREATE INDEX "idx_project_approval_decisions_packet_id" ON "public"."project_approval_decisions" USING "btree" ("submission_packet_id")

-- statement 329 of 775
CREATE INDEX "idx_project_approval_decisions_project_id" ON "public"."project_approval_decisions" USING "btree" ("project_id")

-- statement 330 of 775
CREATE INDEX "idx_project_approval_decisions_status" ON "public"."project_approval_decisions" USING "btree" ("decision_status")

-- statement 331 of 775
CREATE INDEX "idx_project_deliverable_tracking_completed" ON "public"."project_deliverable_tracking" USING "btree" ("completed")

-- statement 332 of 775
CREATE INDEX "idx_project_deliverable_tracking_deliverable_id" ON "public"."project_deliverable_tracking" USING "btree" ("deliverable_id")

-- statement 333 of 775
CREATE INDEX "idx_project_deliverable_tracking_project_id" ON "public"."project_deliverable_tracking" USING "btree" ("project_id")

-- statement 334 of 775
CREATE INDEX "idx_project_deliverables_active" ON "public"."project_deliverables" USING "btree" ("active")

-- statement 335 of 775
CREATE UNIQUE INDEX "idx_project_destination_primary_unique" ON "public"."project_destination_selections" USING "btree" ("project_id") WHERE ("is_primary_destination" = true)

-- statement 336 of 775
CREATE INDEX "idx_project_destination_selections_destination" ON "public"."project_destination_selections" USING "btree" ("destination_id")

-- statement 337 of 775
CREATE INDEX "idx_project_destination_selections_package_status" ON "public"."project_destination_selections" USING "btree" ("submission_package_status")

-- statement 338 of 775
CREATE INDEX "idx_project_destination_selections_project" ON "public"."project_destination_selections" USING "btree" ("project_id")

-- statement 339 of 775
CREATE INDEX "idx_project_destination_selections_status" ON "public"."project_destination_selections" USING "btree" ("selection_status")

-- statement 340 of 775
CREATE INDEX "idx_project_distribution_release_tracking_actual_release_at" ON "public"."project_distribution_release_tracking" USING "btree" ("actual_release_at")

-- statement 341 of 775
CREATE INDEX "idx_project_distribution_release_tracking_approval_decision_id" ON "public"."project_distribution_release_tracking" USING "btree" ("approval_decision_id")

-- statement 342 of 775
CREATE INDEX "idx_project_distribution_release_tracking_destination_id" ON "public"."project_distribution_release_tracking" USING "btree" ("destination_id")

-- statement 343 of 775
CREATE INDEX "idx_project_distribution_release_tracking_project_id" ON "public"."project_distribution_release_tracking" USING "btree" ("project_id")

-- statement 344 of 775
CREATE INDEX "idx_project_distribution_release_tracking_release_status" ON "public"."project_distribution_release_tracking" USING "btree" ("release_status")

-- statement 345 of 775
CREATE INDEX "idx_project_distribution_release_tracking_scheduled_release_at" ON "public"."project_distribution_release_tracking" USING "btree" ("scheduled_release_at")

-- statement 346 of 775
CREATE INDEX "idx_project_distribution_release_tracking_submission_packet_id" ON "public"."project_distribution_release_tracking" USING "btree" ("submission_packet_id")

-- statement 347 of 775
CREATE INDEX "idx_project_monetization_tracking_destination_id" ON "public"."project_monetization_tracking" USING "btree" ("destination_id")

-- statement 348 of 775
CREATE INDEX "idx_project_monetization_tracking_first_revenue_at" ON "public"."project_monetization_tracking" USING "btree" ("first_revenue_at")

-- statement 349 of 775
CREATE INDEX "idx_project_monetization_tracking_payout_due_at" ON "public"."project_monetization_tracking" USING "btree" ("payout_due_at")

-- statement 350 of 775
CREATE INDEX "idx_project_monetization_tracking_project_id" ON "public"."project_monetization_tracking" USING "btree" ("project_id")

-- statement 351 of 775
CREATE INDEX "idx_project_monetization_tracking_release_tracking_id" ON "public"."project_monetization_tracking" USING "btree" ("release_tracking_id")

-- statement 352 of 775
CREATE INDEX "idx_project_monetization_tracking_status" ON "public"."project_monetization_tracking" USING "btree" ("monetization_status")

-- statement 353 of 775
CREATE INDEX "idx_project_rights_checklist_active" ON "public"."project_rights_checklist" USING "btree" ("active")

-- statement 354 of 775
CREATE INDEX "idx_project_rights_tracking_completed" ON "public"."project_rights_tracking" USING "btree" ("completed")

-- statement 355 of 775
CREATE INDEX "idx_project_rights_tracking_project_id" ON "public"."project_rights_tracking" USING "btree" ("project_id")

-- statement 356 of 775
CREATE INDEX "idx_project_rights_tracking_rights_check_item_id" ON "public"."project_rights_tracking" USING "btree" ("rights_check_item_id")

-- statement 357 of 775
CREATE INDEX "idx_project_statuses_active" ON "public"."project_statuses" USING "btree" ("active")

-- statement 358 of 775
CREATE INDEX "idx_project_statuses_distribution_offer" ON "public"."project_statuses" USING "btree" ("eligible_for_distribution_offer")

-- statement 359 of 775
CREATE INDEX "idx_project_submission_packets_destination_id" ON "public"."project_submission_packets" USING "btree" ("destination_id")

-- statement 360 of 775
CREATE INDEX "idx_project_submission_packets_packet_status" ON "public"."project_submission_packets" USING "btree" ("packet_status")

-- statement 361 of 775
CREATE INDEX "idx_project_submission_packets_project_id" ON "public"."project_submission_packets" USING "btree" ("project_id")

-- statement 362 of 775
CREATE INDEX "idx_project_submission_packets_submitted_at" ON "public"."project_submission_packets" USING "btree" ("submitted_at" DESC)

-- statement 363 of 775
CREATE INDEX "idx_project_submission_review_log_packet_id" ON "public"."project_submission_review_log" USING "btree" ("submission_packet_id")

-- statement 364 of 775
CREATE INDEX "idx_project_submission_review_log_project_id" ON "public"."project_submission_review_log" USING "btree" ("project_id")

-- statement 365 of 775
CREATE INDEX "idx_project_submission_review_log_review_status" ON "public"."project_submission_review_log" USING "btree" ("review_status")

-- statement 366 of 775
CREATE INDEX "idx_project_submission_review_log_reviewed_at" ON "public"."project_submission_review_log" USING "btree" ("reviewed_at" DESC)

-- statement 367 of 775
CREATE INDEX "idx_projects_active" ON "public"."projects" USING "btree" ("active")

-- statement 368 of 775
CREATE INDEX "idx_projects_alleystreet_offer" ON "public"."projects" USING "btree" ("alleystreet_offer_eligible")

-- statement 369 of 775
CREATE INDEX "idx_projects_alleystreet_submitted" ON "public"."projects" USING "btree" ("alleystreet_submitted")

-- statement 370 of 775
CREATE INDEX "idx_projects_destination" ON "public"."projects" USING "btree" ("primary_distribution_destination_id")

-- statement 371 of 775
CREATE INDEX "idx_projects_external_release_ready" ON "public"."projects" USING "btree" ("external_release_ready")

-- statement 372 of 775
CREATE INDEX "idx_projects_owner" ON "public"."projects" USING "btree" ("owner_user_id")

-- statement 373 of 775
CREATE INDEX "idx_projects_project_type" ON "public"."projects" USING "btree" ("project_type")

-- statement 374 of 775
CREATE INDEX "idx_projects_status" ON "public"."projects" USING "btree" ("status_id")

-- statement 375 of 775
CREATE INDEX "idx_provider_profiles_active" ON "public"."provider_profiles" USING "btree" ("active")

-- statement 376 of 775
CREATE INDEX "idx_provider_profiles_city_state" ON "public"."provider_profiles" USING "btree" ("city", "state")

-- statement 377 of 775
CREATE INDEX "idx_provider_profiles_owner" ON "public"."provider_profiles" USING "btree" ("owner_user_id")

-- statement 378 of 775
CREATE INDEX "idx_provider_profiles_type" ON "public"."provider_profiles" USING "btree" ("provider_type")

-- statement 379 of 775
CREATE INDEX "idx_resource_relationships_active" ON "public"."resource_relationships" USING "btree" ("active")

-- statement 380 of 775
CREATE INDEX "idx_resource_relationships_primary_category" ON "public"."resource_relationships" USING "btree" ("primary_category_id")

-- statement 381 of 775
CREATE INDEX "idx_resource_relationships_suggested_category" ON "public"."resource_relationships" USING "btree" ("suggested_category_id")

-- statement 382 of 775
CREATE INDEX "idx_resource_relationships_weight" ON "public"."resource_relationships" USING "btree" ("weight")

-- statement 383 of 775
CREATE INDEX "idx_shoot_requirements_active" ON "public"."shoot_requirements" USING "btree" ("active")

-- statement 384 of 775
CREATE INDEX "idx_shoot_requirements_category" ON "public"."shoot_requirements" USING "btree" ("required_category_id")

-- statement 385 of 775
CREATE INDEX "idx_shoot_requirements_department" ON "public"."shoot_requirements" USING "btree" ("required_department_id")

-- statement 386 of 775
CREATE INDEX "idx_shoot_requirements_listing_type" ON "public"."shoot_requirements" USING "btree" ("required_listing_type_id")

-- statement 387 of 775
CREATE INDEX "idx_shoot_requirements_priority" ON "public"."shoot_requirements" USING "btree" ("priority")

-- statement 388 of 775
CREATE INDEX "idx_shoot_requirements_shoot_type" ON "public"."shoot_requirements" USING "btree" ("shoot_type_id")

-- statement 389 of 775
CREATE INDEX "idx_shoot_types_active" ON "public"."shoot_types" USING "btree" ("active")

-- statement 390 of 775
CREATE UNIQUE INDEX "uq_shoot_requirements_combo" ON "public"."shoot_requirements" USING "btree" ("shoot_type_id", "required_category_id", COALESCE("required_subcategory_name", ''::"text"))

-- statement 391 of 775
CREATE OR REPLACE TRIGGER "trg_categories_updated_at" BEFORE UPDATE ON "public"."categories" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"()

-- statement 392 of 775
CREATE OR REPLACE TRIGGER "trg_departments_updated_at" BEFORE UPDATE ON "public"."departments" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"()

-- statement 393 of 775
CREATE OR REPLACE TRIGGER "trg_listing_attributes_updated_at" BEFORE UPDATE ON "public"."listing_attributes" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"()

-- statement 394 of 775
CREATE OR REPLACE TRIGGER "trg_listing_types_updated_at" BEFORE UPDATE ON "public"."listing_types" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"()

-- statement 395 of 775
CREATE OR REPLACE TRIGGER "trg_profiles_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"()

-- statement 396 of 775
CREATE OR REPLACE TRIGGER "trg_project_activity_log_updated_at" BEFORE UPDATE ON "public"."project_activity_log" FOR EACH ROW EXECUTE FUNCTION "public"."set_project_activity_log_updated_at"()

-- statement 397 of 775
CREATE OR REPLACE TRIGGER "trg_project_approval_decisions_updated_at" BEFORE UPDATE ON "public"."project_approval_decisions" FOR EACH ROW EXECUTE FUNCTION "public"."set_project_approval_decisions_updated_at"()

-- statement 398 of 775
CREATE OR REPLACE TRIGGER "trg_project_deliverable_tracking_updated_at" BEFORE UPDATE ON "public"."project_deliverable_tracking" FOR EACH ROW EXECUTE FUNCTION "public"."set_project_deliverable_tracking_updated_at"()

-- statement 399 of 775
CREATE OR REPLACE TRIGGER "trg_project_deliverables_updated_at" BEFORE UPDATE ON "public"."project_deliverables" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"()

-- statement 400 of 775
CREATE OR REPLACE TRIGGER "trg_project_distribution_release_tracking_updated_at" BEFORE UPDATE ON "public"."project_distribution_release_tracking" FOR EACH ROW EXECUTE FUNCTION "public"."set_project_distribution_release_tracking_updated_at"()

-- statement 401 of 775
CREATE OR REPLACE TRIGGER "trg_project_monetization_tracking_updated_at" BEFORE UPDATE ON "public"."project_monetization_tracking" FOR EACH ROW EXECUTE FUNCTION "public"."set_project_monetization_tracking_updated_at"()

-- statement 402 of 775
CREATE OR REPLACE TRIGGER "trg_project_rights_checklist_updated_at" BEFORE UPDATE ON "public"."project_rights_checklist" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"()

-- statement 403 of 775
CREATE OR REPLACE TRIGGER "trg_project_rights_tracking_updated_at" BEFORE UPDATE ON "public"."project_rights_tracking" FOR EACH ROW EXECUTE FUNCTION "public"."set_project_rights_tracking_updated_at"()

-- statement 404 of 775
CREATE OR REPLACE TRIGGER "trg_project_statuses_updated_at" BEFORE UPDATE ON "public"."project_statuses" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"()

-- statement 405 of 775
CREATE OR REPLACE TRIGGER "trg_project_submission_packets_updated_at" BEFORE UPDATE ON "public"."project_submission_packets" FOR EACH ROW EXECUTE FUNCTION "public"."set_project_submission_packets_updated_at"()

-- statement 406 of 775
CREATE OR REPLACE TRIGGER "trg_project_submission_review_log_updated_at" BEFORE UPDATE ON "public"."project_submission_review_log" FOR EACH ROW EXECUTE FUNCTION "public"."set_project_submission_review_log_updated_at"()

-- statement 407 of 775
CREATE OR REPLACE TRIGGER "trg_projects_updated_at" BEFORE UPDATE ON "public"."projects" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"()

-- statement 408 of 775
CREATE OR REPLACE TRIGGER "trg_provider_profiles_updated_at" BEFORE UPDATE ON "public"."provider_profiles" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"()

-- statement 409 of 775
CREATE OR REPLACE TRIGGER "trg_resource_relationships_updated_at" BEFORE UPDATE ON "public"."resource_relationships" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"()

-- statement 410 of 775
CREATE OR REPLACE TRIGGER "trg_shoot_requirements_updated_at" BEFORE UPDATE ON "public"."shoot_requirements" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"()

-- statement 411 of 775
CREATE OR REPLACE TRIGGER "trg_shoot_types_updated_at" BEFORE UPDATE ON "public"."shoot_types" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"()

-- statement 412 of 775
ALTER TABLE ONLY "public"."booking_messages"
    ADD CONSTRAINT "booking_messages_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "public"."booking_requests"("id") ON DELETE CASCADE

-- statement 413 of 775
ALTER TABLE ONLY "public"."booking_messages"
    ADD CONSTRAINT "booking_messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE

-- statement 414 of 775
ALTER TABLE ONLY "public"."booking_offers"
    ADD CONSTRAINT "booking_offers_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "public"."booking_requests"("id") ON DELETE CASCADE

-- statement 415 of 775
ALTER TABLE ONLY "public"."booking_offers"
    ADD CONSTRAINT "booking_offers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE

-- statement 416 of 775
ALTER TABLE ONLY "public"."booking_requests"
    ADD CONSTRAINT "booking_requests_host_user_id_fkey" FOREIGN KEY ("host_user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL

-- statement 417 of 775
ALTER TABLE ONLY "public"."booking_requests"
    ADD CONSTRAINT "booking_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id")

-- statement 418 of 775
ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE CASCADE

-- statement 419 of 775
ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_listing_type_id_fkey" FOREIGN KEY ("listing_type_id") REFERENCES "public"."listing_types"("id") ON DELETE CASCADE

-- statement 420 of 775
ALTER TABLE ONLY "public"."destination_asset_requirements"
    ADD CONSTRAINT "destination_asset_requirements_destination_id_fkey" FOREIGN KEY ("destination_id") REFERENCES "public"."distribution_destinations"("id") ON DELETE CASCADE

-- statement 421 of 775
ALTER TABLE ONLY "public"."destination_field_mappings"
    ADD CONSTRAINT "destination_field_mappings_destination_id_fkey" FOREIGN KEY ("destination_id") REFERENCES "public"."distribution_destinations"("id") ON DELETE CASCADE

-- statement 422 of 775
ALTER TABLE ONLY "public"."host_listing_submissions"
    ADD CONSTRAINT "host_listing_submissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE

-- statement 423 of 775
ALTER TABLE ONLY "public"."listing_attributes"
    ADD CONSTRAINT "listing_attributes_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE CASCADE

-- statement 424 of 775
ALTER TABLE ONLY "public"."listing_attributes"
    ADD CONSTRAINT "listing_attributes_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE CASCADE

-- statement 425 of 775
ALTER TABLE ONLY "public"."listing_attributes"
    ADD CONSTRAINT "listing_attributes_listing_type_id_fkey" FOREIGN KEY ("listing_type_id") REFERENCES "public"."listing_types"("id") ON DELETE CASCADE

-- statement 426 of 775
ALTER TABLE ONLY "public"."policy_acceptances"
    ADD CONSTRAINT "policy_acceptances_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE

-- statement 427 of 775
ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE

-- statement 428 of 775
ALTER TABLE ONLY "public"."project_activity_log"
    ADD CONSTRAINT "project_activity_log_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE

-- statement 429 of 775
ALTER TABLE ONLY "public"."project_activity_log"
    ADD CONSTRAINT "project_activity_log_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "public"."project_statuses"("id") ON DELETE SET NULL

-- statement 430 of 775
ALTER TABLE ONLY "public"."project_approval_decisions"
    ADD CONSTRAINT "project_approval_decisions_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE

-- statement 431 of 775
ALTER TABLE ONLY "public"."project_approval_decisions"
    ADD CONSTRAINT "project_approval_decisions_submission_packet_id_fkey" FOREIGN KEY ("submission_packet_id") REFERENCES "public"."project_submission_packets"("id") ON DELETE CASCADE

-- statement 432 of 775
ALTER TABLE ONLY "public"."project_deliverable_tracking"
    ADD CONSTRAINT "project_deliverable_tracking_deliverable_id_fkey" FOREIGN KEY ("deliverable_id") REFERENCES "public"."project_deliverables"("id") ON DELETE CASCADE

-- statement 433 of 775
ALTER TABLE ONLY "public"."project_deliverable_tracking"
    ADD CONSTRAINT "project_deliverable_tracking_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE

-- statement 434 of 775
ALTER TABLE ONLY "public"."project_destination_selections"
    ADD CONSTRAINT "project_destination_selections_destination_id_fkey" FOREIGN KEY ("destination_id") REFERENCES "public"."distribution_destinations"("id") ON DELETE CASCADE

-- statement 435 of 775
ALTER TABLE ONLY "public"."project_destination_selections"
    ADD CONSTRAINT "project_destination_selections_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE

-- statement 436 of 775
ALTER TABLE ONLY "public"."project_distribution_release_tracking"
    ADD CONSTRAINT "project_distribution_release_tracking_approval_decision_id_fkey" FOREIGN KEY ("approval_decision_id") REFERENCES "public"."project_approval_decisions"("id") ON DELETE SET NULL

-- statement 437 of 775
ALTER TABLE ONLY "public"."project_distribution_release_tracking"
    ADD CONSTRAINT "project_distribution_release_tracking_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE

-- statement 438 of 775
ALTER TABLE ONLY "public"."project_distribution_release_tracking"
    ADD CONSTRAINT "project_distribution_release_tracking_submission_packet_id_fkey" FOREIGN KEY ("submission_packet_id") REFERENCES "public"."project_submission_packets"("id") ON DELETE SET NULL

-- statement 439 of 775
ALTER TABLE ONLY "public"."project_monetization_tracking"
    ADD CONSTRAINT "project_monetization_tracking_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE

-- statement 440 of 775
ALTER TABLE ONLY "public"."project_monetization_tracking"
    ADD CONSTRAINT "project_monetization_tracking_release_tracking_id_fkey" FOREIGN KEY ("release_tracking_id") REFERENCES "public"."project_distribution_release_tracking"("id") ON DELETE SET NULL

-- statement 441 of 775
ALTER TABLE ONLY "public"."project_rights_tracking"
    ADD CONSTRAINT "project_rights_tracking_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE

-- statement 442 of 775
ALTER TABLE ONLY "public"."project_rights_tracking"
    ADD CONSTRAINT "project_rights_tracking_rights_check_item_id_fkey" FOREIGN KEY ("rights_check_item_id") REFERENCES "public"."project_rights_checklist"("id") ON DELETE CASCADE

-- statement 443 of 775
ALTER TABLE ONLY "public"."project_submission_packets"
    ADD CONSTRAINT "project_submission_packets_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE

-- statement 444 of 775
ALTER TABLE ONLY "public"."project_submission_review_log"
    ADD CONSTRAINT "project_submission_review_log_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE

-- statement 445 of 775
ALTER TABLE ONLY "public"."project_submission_review_log"
    ADD CONSTRAINT "project_submission_review_log_submission_packet_id_fkey" FOREIGN KEY ("submission_packet_id") REFERENCES "public"."project_submission_packets"("id") ON DELETE CASCADE

-- statement 446 of 775
ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL

-- statement 447 of 775
ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "public"."project_statuses"("id") ON DELETE SET NULL

-- statement 448 of 775
ALTER TABLE ONLY "public"."provider_profiles"
    ADD CONSTRAINT "provider_profiles_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE

-- statement 449 of 775
ALTER TABLE ONLY "public"."resource_relationships"
    ADD CONSTRAINT "resource_relationships_primary_category_id_fkey" FOREIGN KEY ("primary_category_id") REFERENCES "public"."categories"("id") ON DELETE CASCADE

-- statement 450 of 775
ALTER TABLE ONLY "public"."resource_relationships"
    ADD CONSTRAINT "resource_relationships_primary_department_id_fkey" FOREIGN KEY ("primary_department_id") REFERENCES "public"."departments"("id") ON DELETE CASCADE

-- statement 451 of 775
ALTER TABLE ONLY "public"."resource_relationships"
    ADD CONSTRAINT "resource_relationships_primary_listing_type_id_fkey" FOREIGN KEY ("primary_listing_type_id") REFERENCES "public"."listing_types"("id") ON DELETE CASCADE

-- statement 452 of 775
ALTER TABLE ONLY "public"."resource_relationships"
    ADD CONSTRAINT "resource_relationships_suggested_category_id_fkey" FOREIGN KEY ("suggested_category_id") REFERENCES "public"."categories"("id") ON DELETE CASCADE

-- statement 453 of 775
ALTER TABLE ONLY "public"."resource_relationships"
    ADD CONSTRAINT "resource_relationships_suggested_department_id_fkey" FOREIGN KEY ("suggested_department_id") REFERENCES "public"."departments"("id") ON DELETE CASCADE

-- statement 454 of 775
ALTER TABLE ONLY "public"."resource_relationships"
    ADD CONSTRAINT "resource_relationships_suggested_listing_type_id_fkey" FOREIGN KEY ("suggested_listing_type_id") REFERENCES "public"."listing_types"("id") ON DELETE CASCADE

-- statement 455 of 775
ALTER TABLE ONLY "public"."shoot_requirements"
    ADD CONSTRAINT "shoot_requirements_required_category_id_fkey" FOREIGN KEY ("required_category_id") REFERENCES "public"."categories"("id") ON DELETE CASCADE

-- statement 456 of 775
ALTER TABLE ONLY "public"."shoot_requirements"
    ADD CONSTRAINT "shoot_requirements_required_department_id_fkey" FOREIGN KEY ("required_department_id") REFERENCES "public"."departments"("id") ON DELETE CASCADE

-- statement 457 of 775
ALTER TABLE ONLY "public"."shoot_requirements"
    ADD CONSTRAINT "shoot_requirements_required_listing_type_id_fkey" FOREIGN KEY ("required_listing_type_id") REFERENCES "public"."listing_types"("id") ON DELETE CASCADE

-- statement 458 of 775
ALTER TABLE ONLY "public"."shoot_requirements"
    ADD CONSTRAINT "shoot_requirements_shoot_type_id_fkey" FOREIGN KEY ("shoot_type_id") REFERENCES "public"."shoot_types"("id") ON DELETE CASCADE

-- statement 459 of 775
CREATE POLICY "Admins can update profiles" ON "public"."profiles" FOR UPDATE TO "authenticated" USING ("public"."current_user_is_admin"()) WITH CHECK ("public"."current_user_is_admin"())

-- statement 460 of 775
CREATE POLICY "Admins can view all host listing submissions" ON "public"."host_listing_submissions" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."user_role")::"text" = 'admin'::"text")))))

-- statement 461 of 775
CREATE POLICY "Admins can view all policy acceptances" ON "public"."policy_acceptances" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."user_role" = 'admin'::"public"."user_role_enum")))))

-- statement 462 of 775
CREATE POLICY "Admins can view all profiles" ON "public"."profiles" FOR SELECT TO "authenticated" USING ("public"."current_user_is_admin"())

-- statement 463 of 775
CREATE POLICY "Filmmakers can create pending requests" ON "public"."booking_requests" FOR INSERT TO "authenticated" WITH CHECK ((("auth"."uid"() = "user_id") AND ("status" = 'PENDING'::"text") AND ("thread_status" = 'draft'::"text")))

-- statement 464 of 775
CREATE POLICY "Hosts can insert their own listing submissions" ON "public"."host_listing_submissions" FOR INSERT TO "authenticated" WITH CHECK ((("auth"."uid"() = "user_id") AND ("status" = 'PENDING_REVIEW'::"text")))

-- statement 465 of 775
CREATE POLICY "Hosts can read assigned request messages" ON "public"."booking_messages" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."booking_requests" "br"
  WHERE (("br"."id" = "booking_messages"."request_id") AND ("br"."host_user_id" = "auth"."uid"())))))

-- statement 466 of 775
CREATE POLICY "Hosts can read assigned request offers" ON "public"."booking_offers" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."booking_requests" "br"
  WHERE (("br"."id" = "booking_offers"."request_id") AND ("br"."host_user_id" = "auth"."uid"())))))

-- statement 467 of 775
CREATE POLICY "Hosts can view assigned requests" ON "public"."booking_requests" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "host_user_id"))

-- statement 468 of 775
CREATE POLICY "Hosts can view their own listing submissions" ON "public"."host_listing_submissions" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"))

-- statement 469 of 775
CREATE POLICY "No direct client inserts on booking_messages" ON "public"."booking_messages" FOR INSERT TO "authenticated" WITH CHECK (false)

-- statement 470 of 775
CREATE POLICY "No direct client inserts on booking_offers" ON "public"."booking_offers" FOR INSERT TO "authenticated" WITH CHECK (false)

-- statement 471 of 775
CREATE POLICY "No direct client updates on booking_offers" ON "public"."booking_offers" FOR UPDATE TO "authenticated" USING (false) WITH CHECK (false)

-- statement 472 of 775
CREATE POLICY "No direct client updates on booking_requests" ON "public"."booking_requests" FOR UPDATE TO "authenticated" USING (false) WITH CHECK (false)

-- statement 473 of 775
CREATE POLICY "No direct client updates on host_listing_submissions" ON "public"."host_listing_submissions" FOR UPDATE TO "authenticated" USING (false) WITH CHECK (false)

-- statement 474 of 775
CREATE POLICY "Users can insert own profile" ON "public"."profiles" FOR INSERT TO "authenticated" WITH CHECK ((("auth"."uid"() = "id") AND ("user_role" = 'filmmaker'::"public"."user_role_enum")))

-- statement 475 of 775
CREATE POLICY "Users can insert their own policy acceptances" ON "public"."policy_acceptances" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"))

-- statement 476 of 775
CREATE POLICY "Users can read messages for own requests" ON "public"."booking_messages" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."booking_requests" "br"
  WHERE (("br"."id" = "booking_messages"."request_id") AND ("br"."user_id" = "auth"."uid"())))))

-- statement 477 of 775
CREATE POLICY "Users can read offers for own requests" ON "public"."booking_offers" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."booking_requests" "br"
  WHERE (("br"."id" = "booking_offers"."request_id") AND ("br"."user_id" = "auth"."uid"())))))

-- statement 478 of 775
CREATE POLICY "Users can read own requests" ON "public"."booking_requests" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"))

-- statement 479 of 775
CREATE POLICY "Users can update own profile" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "id")) WITH CHECK (("auth"."uid"() = "id"))

-- statement 480 of 775
CREATE POLICY "Users can view own profile" ON "public"."profiles" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "id"))

-- statement 481 of 775
CREATE POLICY "Users can view their own policy acceptances" ON "public"."policy_acceptances" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"))

-- statement 482 of 775
ALTER TABLE "public"."booking_messages" ENABLE ROW LEVEL SECURITY

-- statement 483 of 775
ALTER TABLE "public"."booking_offers" ENABLE ROW LEVEL SECURITY

-- statement 484 of 775
ALTER TABLE "public"."booking_requests" ENABLE ROW LEVEL SECURITY

-- statement 485 of 775
ALTER TABLE "public"."host_listing_submissions" ENABLE ROW LEVEL SECURITY

-- statement 486 of 775
ALTER TABLE "public"."policy_acceptances" ENABLE ROW LEVEL SECURITY

-- statement 487 of 775
ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY

-- statement 488 of 775
ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres"

-- statement 489 of 775
GRANT USAGE ON SCHEMA "public" TO "postgres"

-- statement 490 of 775
GRANT USAGE ON SCHEMA "public" TO "anon"

-- statement 491 of 775
GRANT USAGE ON SCHEMA "public" TO "authenticated"

-- statement 492 of 775
GRANT USAGE ON SCHEMA "public" TO "service_role"

-- statement 493 of 775
REVOKE ALL ON FUNCTION "public"."current_user_is_admin"() FROM PUBLIC

-- statement 494 of 775
GRANT ALL ON FUNCTION "public"."current_user_is_admin"() TO "anon"

-- statement 495 of 775
GRANT ALL ON FUNCTION "public"."current_user_is_admin"() TO "authenticated"

-- statement 496 of 775
GRANT ALL ON FUNCTION "public"."current_user_is_admin"() TO "service_role"

-- statement 497 of 775
REVOKE ALL ON FUNCTION "public"."handle_new_auth_user_profile"() FROM PUBLIC

-- statement 498 of 775
GRANT ALL ON FUNCTION "public"."handle_new_auth_user_profile"() TO "anon"

-- statement 499 of 775
GRANT ALL ON FUNCTION "public"."handle_new_auth_user_profile"() TO "authenticated"

-- statement 500 of 775
GRANT ALL ON FUNCTION "public"."handle_new_auth_user_profile"() TO "service_role"

-- statement 501 of 775
GRANT ALL ON FUNCTION "public"."set_project_activity_log_updated_at"() TO "anon"

-- statement 502 of 775
GRANT ALL ON FUNCTION "public"."set_project_activity_log_updated_at"() TO "authenticated"

-- statement 503 of 775
GRANT ALL ON FUNCTION "public"."set_project_activity_log_updated_at"() TO "service_role"

-- statement 504 of 775
GRANT ALL ON FUNCTION "public"."set_project_approval_decisions_updated_at"() TO "anon"

-- statement 505 of 775
GRANT ALL ON FUNCTION "public"."set_project_approval_decisions_updated_at"() TO "authenticated"

-- statement 506 of 775
GRANT ALL ON FUNCTION "public"."set_project_approval_decisions_updated_at"() TO "service_role"

-- statement 507 of 775
GRANT ALL ON FUNCTION "public"."set_project_deliverable_tracking_updated_at"() TO "anon"

-- statement 508 of 775
GRANT ALL ON FUNCTION "public"."set_project_deliverable_tracking_updated_at"() TO "authenticated"

-- statement 509 of 775
GRANT ALL ON FUNCTION "public"."set_project_deliverable_tracking_updated_at"() TO "service_role"

-- statement 510 of 775
GRANT ALL ON FUNCTION "public"."set_project_distribution_release_tracking_updated_at"() TO "anon"

-- statement 511 of 775
GRANT ALL ON FUNCTION "public"."set_project_distribution_release_tracking_updated_at"() TO "authenticated"

-- statement 512 of 775
GRANT ALL ON FUNCTION "public"."set_project_distribution_release_tracking_updated_at"() TO "service_role"

-- statement 513 of 775
GRANT ALL ON FUNCTION "public"."set_project_monetization_tracking_updated_at"() TO "anon"

-- statement 514 of 775
GRANT ALL ON FUNCTION "public"."set_project_monetization_tracking_updated_at"() TO "authenticated"

-- statement 515 of 775
GRANT ALL ON FUNCTION "public"."set_project_monetization_tracking_updated_at"() TO "service_role"

-- statement 516 of 775
GRANT ALL ON FUNCTION "public"."set_project_rights_tracking_updated_at"() TO "anon"

-- statement 517 of 775
GRANT ALL ON FUNCTION "public"."set_project_rights_tracking_updated_at"() TO "authenticated"

-- statement 518 of 775
GRANT ALL ON FUNCTION "public"."set_project_rights_tracking_updated_at"() TO "service_role"

-- statement 519 of 775
GRANT ALL ON FUNCTION "public"."set_project_submission_packets_updated_at"() TO "anon"

-- statement 520 of 775
GRANT ALL ON FUNCTION "public"."set_project_submission_packets_updated_at"() TO "authenticated"

-- statement 521 of 775
GRANT ALL ON FUNCTION "public"."set_project_submission_packets_updated_at"() TO "service_role"

-- statement 522 of 775
GRANT ALL ON FUNCTION "public"."set_project_submission_review_log_updated_at"() TO "anon"

-- statement 523 of 775
GRANT ALL ON FUNCTION "public"."set_project_submission_review_log_updated_at"() TO "authenticated"

-- statement 524 of 775
GRANT ALL ON FUNCTION "public"."set_project_submission_review_log_updated_at"() TO "service_role"

-- statement 525 of 775
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "anon"

-- statement 526 of 775
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "authenticated"

-- statement 527 of 775
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "service_role"

-- statement 528 of 775
GRANT ALL ON TABLE "public"."host_listing_submissions" TO "anon"

-- statement 529 of 775
GRANT ALL ON TABLE "public"."host_listing_submissions" TO "authenticated"

-- statement 530 of 775
GRANT ALL ON TABLE "public"."host_listing_submissions" TO "service_role"

-- statement 531 of 775
GRANT ALL ON TABLE "public"."approved_host_listings_public" TO "anon"

-- statement 532 of 775
GRANT ALL ON TABLE "public"."approved_host_listings_public" TO "authenticated"

-- statement 533 of 775
GRANT ALL ON TABLE "public"."approved_host_listings_public" TO "service_role"

-- statement 534 of 775
GRANT ALL ON TABLE "public"."booking_messages" TO "anon"

-- statement 535 of 775
GRANT ALL ON TABLE "public"."booking_messages" TO "authenticated"

-- statement 536 of 775
GRANT ALL ON TABLE "public"."booking_messages" TO "service_role"

-- statement 537 of 775
GRANT ALL ON TABLE "public"."booking_offers" TO "anon"

-- statement 538 of 775
GRANT ALL ON TABLE "public"."booking_offers" TO "authenticated"

-- statement 539 of 775
GRANT ALL ON TABLE "public"."booking_offers" TO "service_role"

-- statement 540 of 775
GRANT ALL ON TABLE "public"."booking_requests" TO "service_role"

-- statement 541 of 775
GRANT SELECT,INSERT ON TABLE "public"."booking_requests" TO "authenticated"

-- statement 542 of 775
GRANT ALL ON TABLE "public"."categories" TO "anon"

-- statement 543 of 775
GRANT ALL ON TABLE "public"."categories" TO "authenticated"

-- statement 544 of 775
GRANT ALL ON TABLE "public"."categories" TO "service_role"

-- statement 545 of 775
GRANT ALL ON SEQUENCE "public"."categories_id_seq" TO "anon"

-- statement 546 of 775
GRANT ALL ON SEQUENCE "public"."categories_id_seq" TO "authenticated"

-- statement 547 of 775
GRANT ALL ON SEQUENCE "public"."categories_id_seq" TO "service_role"

-- statement 548 of 775
GRANT ALL ON TABLE "public"."departments" TO "anon"

-- statement 549 of 775
GRANT ALL ON TABLE "public"."departments" TO "authenticated"

-- statement 550 of 775
GRANT ALL ON TABLE "public"."departments" TO "service_role"

-- statement 551 of 775
GRANT ALL ON SEQUENCE "public"."departments_id_seq" TO "anon"

-- statement 552 of 775
GRANT ALL ON SEQUENCE "public"."departments_id_seq" TO "authenticated"

-- statement 553 of 775
GRANT ALL ON SEQUENCE "public"."departments_id_seq" TO "service_role"

-- statement 554 of 775
GRANT ALL ON TABLE "public"."destination_asset_requirements" TO "anon"

-- statement 555 of 775
GRANT ALL ON TABLE "public"."destination_asset_requirements" TO "authenticated"

-- statement 556 of 775
GRANT ALL ON TABLE "public"."destination_asset_requirements" TO "service_role"

-- statement 557 of 775
GRANT ALL ON SEQUENCE "public"."destination_asset_requirements_id_seq" TO "anon"

-- statement 558 of 775
GRANT ALL ON SEQUENCE "public"."destination_asset_requirements_id_seq" TO "authenticated"

-- statement 559 of 775
GRANT ALL ON SEQUENCE "public"."destination_asset_requirements_id_seq" TO "service_role"

-- statement 560 of 775
GRANT ALL ON TABLE "public"."destination_field_mappings" TO "anon"

-- statement 561 of 775
GRANT ALL ON TABLE "public"."destination_field_mappings" TO "authenticated"

-- statement 562 of 775
GRANT ALL ON TABLE "public"."destination_field_mappings" TO "service_role"

-- statement 563 of 775
GRANT ALL ON SEQUENCE "public"."destination_field_mappings_id_seq" TO "anon"

-- statement 564 of 775
GRANT ALL ON SEQUENCE "public"."destination_field_mappings_id_seq" TO "authenticated"

-- statement 565 of 775
GRANT ALL ON SEQUENCE "public"."destination_field_mappings_id_seq" TO "service_role"

-- statement 566 of 775
GRANT ALL ON TABLE "public"."distribution_destinations" TO "anon"

-- statement 567 of 775
GRANT ALL ON TABLE "public"."distribution_destinations" TO "authenticated"

-- statement 568 of 775
GRANT ALL ON TABLE "public"."distribution_destinations" TO "service_role"

-- statement 569 of 775
GRANT ALL ON TABLE "public"."distribution_destination_summary_view" TO "anon"

-- statement 570 of 775
GRANT ALL ON TABLE "public"."distribution_destination_summary_view" TO "authenticated"

-- statement 571 of 775
GRANT ALL ON TABLE "public"."distribution_destination_summary_view" TO "service_role"

-- statement 572 of 775
GRANT ALL ON SEQUENCE "public"."distribution_destinations_id_seq" TO "anon"

-- statement 573 of 775
GRANT ALL ON SEQUENCE "public"."distribution_destinations_id_seq" TO "authenticated"

-- statement 574 of 775
GRANT ALL ON SEQUENCE "public"."distribution_destinations_id_seq" TO "service_role"

-- statement 575 of 775
GRANT ALL ON TABLE "public"."listing_attributes" TO "anon"

-- statement 576 of 775
GRANT ALL ON TABLE "public"."listing_attributes" TO "authenticated"

-- statement 577 of 775
GRANT ALL ON TABLE "public"."listing_attributes" TO "service_role"

-- statement 578 of 775
GRANT ALL ON SEQUENCE "public"."listing_attributes_id_seq" TO "anon"

-- statement 579 of 775
GRANT ALL ON SEQUENCE "public"."listing_attributes_id_seq" TO "authenticated"

-- statement 580 of 775
GRANT ALL ON SEQUENCE "public"."listing_attributes_id_seq" TO "service_role"

-- statement 581 of 775
GRANT ALL ON TABLE "public"."listing_types" TO "anon"

-- statement 582 of 775
GRANT ALL ON TABLE "public"."listing_types" TO "authenticated"

-- statement 583 of 775
GRANT ALL ON TABLE "public"."listing_types" TO "service_role"

-- statement 584 of 775
GRANT ALL ON SEQUENCE "public"."listing_types_id_seq" TO "anon"

-- statement 585 of 775
GRANT ALL ON SEQUENCE "public"."listing_types_id_seq" TO "authenticated"

-- statement 586 of 775
GRANT ALL ON SEQUENCE "public"."listing_types_id_seq" TO "service_role"

-- statement 587 of 775
GRANT ALL ON TABLE "public"."policy_acceptances" TO "anon"

-- statement 588 of 775
GRANT ALL ON TABLE "public"."policy_acceptances" TO "authenticated"

-- statement 589 of 775
GRANT ALL ON TABLE "public"."policy_acceptances" TO "service_role"

-- statement 590 of 775
GRANT ALL ON TABLE "public"."profiles" TO "service_role"

-- statement 591 of 775
GRANT SELECT,INSERT ON TABLE "public"."profiles" TO "authenticated"

-- statement 592 of 775
GRANT UPDATE("email") ON TABLE "public"."profiles" TO "authenticated"

-- statement 593 of 775
GRANT UPDATE("display_name") ON TABLE "public"."profiles" TO "authenticated"

-- statement 594 of 775
GRANT UPDATE("knowledge_level") ON TABLE "public"."profiles" TO "authenticated"

-- statement 595 of 775
GRANT UPDATE("city") ON TABLE "public"."profiles" TO "authenticated"

-- statement 596 of 775
GRANT UPDATE("state") ON TABLE "public"."profiles" TO "authenticated"

-- statement 597 of 775
GRANT UPDATE("country") ON TABLE "public"."profiles" TO "authenticated"

-- statement 598 of 775
GRANT UPDATE("updated_at") ON TABLE "public"."profiles" TO "authenticated"

-- statement 599 of 775
GRANT ALL ON TABLE "public"."project_activity_log" TO "anon"

-- statement 600 of 775
GRANT ALL ON TABLE "public"."project_activity_log" TO "authenticated"

-- statement 601 of 775
GRANT ALL ON TABLE "public"."project_activity_log" TO "service_role"

-- statement 602 of 775
GRANT ALL ON SEQUENCE "public"."project_activity_log_id_seq" TO "anon"

-- statement 603 of 775
GRANT ALL ON SEQUENCE "public"."project_activity_log_id_seq" TO "authenticated"

-- statement 604 of 775
GRANT ALL ON SEQUENCE "public"."project_activity_log_id_seq" TO "service_role"

-- statement 605 of 775
GRANT ALL ON TABLE "public"."project_statuses" TO "anon"

-- statement 606 of 775
GRANT ALL ON TABLE "public"."project_statuses" TO "authenticated"

-- statement 607 of 775
GRANT ALL ON TABLE "public"."project_statuses" TO "service_role"

-- statement 608 of 775
GRANT ALL ON TABLE "public"."projects" TO "anon"

-- statement 609 of 775
GRANT ALL ON TABLE "public"."projects" TO "authenticated"

-- statement 610 of 775
GRANT ALL ON TABLE "public"."projects" TO "service_role"

-- statement 611 of 775
GRANT ALL ON TABLE "public"."project_activity_timeline_view" TO "anon"

-- statement 612 of 775
GRANT ALL ON TABLE "public"."project_activity_timeline_view" TO "authenticated"

-- statement 613 of 775
GRANT ALL ON TABLE "public"."project_activity_timeline_view" TO "service_role"

-- statement 614 of 775
GRANT ALL ON TABLE "public"."project_approval_decisions" TO "anon"

-- statement 615 of 775
GRANT ALL ON TABLE "public"."project_approval_decisions" TO "authenticated"

-- statement 616 of 775
GRANT ALL ON TABLE "public"."project_approval_decisions" TO "service_role"

-- statement 617 of 775
GRANT ALL ON SEQUENCE "public"."project_approval_decisions_id_seq" TO "anon"

-- statement 618 of 775
GRANT ALL ON SEQUENCE "public"."project_approval_decisions_id_seq" TO "authenticated"

-- statement 619 of 775
GRANT ALL ON SEQUENCE "public"."project_approval_decisions_id_seq" TO "service_role"

-- statement 620 of 775
GRANT ALL ON TABLE "public"."project_deliverable_tracking" TO "anon"

-- statement 621 of 775
GRANT ALL ON TABLE "public"."project_deliverable_tracking" TO "authenticated"

-- statement 622 of 775
GRANT ALL ON TABLE "public"."project_deliverable_tracking" TO "service_role"

-- statement 623 of 775
GRANT ALL ON SEQUENCE "public"."project_deliverable_tracking_id_seq" TO "anon"

-- statement 624 of 775
GRANT ALL ON SEQUENCE "public"."project_deliverable_tracking_id_seq" TO "authenticated"

-- statement 625 of 775
GRANT ALL ON SEQUENCE "public"."project_deliverable_tracking_id_seq" TO "service_role"

-- statement 626 of 775
GRANT ALL ON TABLE "public"."project_deliverables" TO "anon"

-- statement 627 of 775
GRANT ALL ON TABLE "public"."project_deliverables" TO "authenticated"

-- statement 628 of 775
GRANT ALL ON TABLE "public"."project_deliverables" TO "service_role"

-- statement 629 of 775
GRANT ALL ON SEQUENCE "public"."project_deliverables_id_seq" TO "anon"

-- statement 630 of 775
GRANT ALL ON SEQUENCE "public"."project_deliverables_id_seq" TO "authenticated"

-- statement 631 of 775
GRANT ALL ON SEQUENCE "public"."project_deliverables_id_seq" TO "service_role"

-- statement 632 of 775
GRANT ALL ON TABLE "public"."project_destination_selections" TO "anon"

-- statement 633 of 775
GRANT ALL ON TABLE "public"."project_destination_selections" TO "authenticated"

-- statement 634 of 775
GRANT ALL ON TABLE "public"."project_destination_selections" TO "service_role"

-- statement 635 of 775
GRANT ALL ON TABLE "public"."project_destination_summary_view" TO "anon"

-- statement 636 of 775
GRANT ALL ON TABLE "public"."project_destination_summary_view" TO "authenticated"

-- statement 637 of 775
GRANT ALL ON TABLE "public"."project_destination_summary_view" TO "service_role"

-- statement 638 of 775
GRANT ALL ON TABLE "public"."project_destination_action_queue_view" TO "anon"

-- statement 639 of 775
GRANT ALL ON TABLE "public"."project_destination_action_queue_view" TO "authenticated"

-- statement 640 of 775
GRANT ALL ON TABLE "public"."project_destination_action_queue_view" TO "service_role"

-- statement 641 of 775
GRANT ALL ON TABLE "public"."project_destination_action_queue_primary_view" TO "anon"

-- statement 642 of 775
GRANT ALL ON TABLE "public"."project_destination_action_queue_primary_view" TO "authenticated"

-- statement 643 of 775
GRANT ALL ON TABLE "public"."project_destination_action_queue_primary_view" TO "service_role"

-- statement 644 of 775
GRANT ALL ON TABLE "public"."project_destination_guidance_view" TO "anon"

-- statement 645 of 775
GRANT ALL ON TABLE "public"."project_destination_guidance_view" TO "authenticated"

-- statement 646 of 775
GRANT ALL ON TABLE "public"."project_destination_guidance_view" TO "service_role"

-- statement 647 of 775
GRANT ALL ON TABLE "public"."project_destination_submission_prep_view" TO "anon"

-- statement 648 of 775
GRANT ALL ON TABLE "public"."project_destination_submission_prep_view" TO "authenticated"

-- statement 649 of 775
GRANT ALL ON TABLE "public"."project_destination_submission_prep_view" TO "service_role"

-- statement 650 of 775
GRANT ALL ON TABLE "public"."project_destination_submission_package_view" TO "anon"

-- statement 651 of 775
GRANT ALL ON TABLE "public"."project_destination_submission_package_view" TO "authenticated"

-- statement 652 of 775
GRANT ALL ON TABLE "public"."project_destination_submission_package_view" TO "service_role"

-- statement 653 of 775
GRANT ALL ON TABLE "public"."project_destination_final_readiness_view" TO "anon"

-- statement 654 of 775
GRANT ALL ON TABLE "public"."project_destination_final_readiness_view" TO "authenticated"

-- statement 655 of 775
GRANT ALL ON TABLE "public"."project_destination_final_readiness_view" TO "service_role"

-- statement 656 of 775
GRANT ALL ON TABLE "public"."project_destination_submission_release_action_view" TO "anon"

-- statement 657 of 775
GRANT ALL ON TABLE "public"."project_destination_submission_release_action_view" TO "authenticated"

-- statement 658 of 775
GRANT ALL ON TABLE "public"."project_destination_submission_release_action_view" TO "service_role"

-- statement 659 of 775
GRANT ALL ON TABLE "public"."project_destination_submission_release_dashboard_view" TO "anon"

-- statement 660 of 775
GRANT ALL ON TABLE "public"."project_destination_submission_release_dashboard_view" TO "authenticated"

-- statement 661 of 775
GRANT ALL ON TABLE "public"."project_destination_submission_release_dashboard_view" TO "service_role"

-- statement 662 of 775
GRANT ALL ON TABLE "public"."project_destination_operator_workboard_view" TO "anon"

-- statement 663 of 775
GRANT ALL ON TABLE "public"."project_destination_operator_workboard_view" TO "authenticated"

-- statement 664 of 775
GRANT ALL ON TABLE "public"."project_destination_operator_workboard_view" TO "service_role"

-- statement 665 of 775
GRANT ALL ON TABLE "public"."project_destination_final_delivery_queue_view" TO "anon"

-- statement 666 of 775
GRANT ALL ON TABLE "public"."project_destination_final_delivery_queue_view" TO "authenticated"

-- statement 667 of 775
GRANT ALL ON TABLE "public"."project_destination_final_delivery_queue_view" TO "service_role"

-- statement 668 of 775
GRANT ALL ON TABLE "public"."project_distribution_release_tracking" TO "anon"

-- statement 669 of 775
GRANT ALL ON TABLE "public"."project_distribution_release_tracking" TO "authenticated"

-- statement 670 of 775
GRANT ALL ON TABLE "public"."project_distribution_release_tracking" TO "service_role"

-- statement 671 of 775
GRANT ALL ON TABLE "public"."project_monetization_tracking" TO "anon"

-- statement 672 of 775
GRANT ALL ON TABLE "public"."project_monetization_tracking" TO "authenticated"

-- statement 673 of 775
GRANT ALL ON TABLE "public"."project_monetization_tracking" TO "service_role"

-- statement 674 of 775
GRANT ALL ON TABLE "public"."project_rights_tracking" TO "anon"

-- statement 675 of 775
GRANT ALL ON TABLE "public"."project_rights_tracking" TO "authenticated"

-- statement 676 of 775
GRANT ALL ON TABLE "public"."project_rights_tracking" TO "service_role"

-- statement 677 of 775
GRANT ALL ON TABLE "public"."project_submission_review_log" TO "anon"

-- statement 678 of 775
GRANT ALL ON TABLE "public"."project_submission_review_log" TO "authenticated"

-- statement 679 of 775
GRANT ALL ON TABLE "public"."project_submission_review_log" TO "service_role"

-- statement 680 of 775
GRANT ALL ON TABLE "public"."project_destination_release_outcome_view" TO "anon"

-- statement 681 of 775
GRANT ALL ON TABLE "public"."project_destination_release_outcome_view" TO "authenticated"

-- statement 682 of 775
GRANT ALL ON TABLE "public"."project_destination_release_outcome_view" TO "service_role"

-- statement 683 of 775
GRANT ALL ON TABLE "public"."project_destination_master_lifecycle_view" TO "anon"

-- statement 684 of 775
GRANT ALL ON TABLE "public"."project_destination_master_lifecycle_view" TO "authenticated"

-- statement 685 of 775
GRANT ALL ON TABLE "public"."project_destination_master_lifecycle_view" TO "service_role"

-- statement 686 of 775
GRANT ALL ON TABLE "public"."project_destination_live_release_monitor_view" TO "anon"

-- statement 687 of 775
GRANT ALL ON TABLE "public"."project_destination_live_release_monitor_view" TO "authenticated"

-- statement 688 of 775
GRANT ALL ON TABLE "public"."project_destination_live_release_monitor_view" TO "service_role"

-- statement 689 of 775
GRANT ALL ON TABLE "public"."project_destination_release_completion_view" TO "anon"

-- statement 690 of 775
GRANT ALL ON TABLE "public"."project_destination_release_completion_view" TO "authenticated"

-- statement 691 of 775
GRANT ALL ON TABLE "public"."project_destination_release_completion_view" TO "service_role"

-- statement 692 of 775
GRANT ALL ON TABLE "public"."project_destination_completion_dashboard_view" TO "anon"

-- statement 693 of 775
GRANT ALL ON TABLE "public"."project_destination_completion_dashboard_view" TO "authenticated"

-- statement 694 of 775
GRANT ALL ON TABLE "public"."project_destination_completion_dashboard_view" TO "service_role"

-- statement 695 of 775
GRANT ALL ON TABLE "public"."project_destination_closeout_workboard_view" TO "anon"

-- statement 696 of 775
GRANT ALL ON TABLE "public"."project_destination_closeout_workboard_view" TO "authenticated"

-- statement 697 of 775
GRANT ALL ON TABLE "public"."project_destination_closeout_workboard_view" TO "service_role"

-- statement 698 of 775
GRANT ALL ON TABLE "public"."project_destination_final_closeout_summary_view" TO "anon"

-- statement 699 of 775
GRANT ALL ON TABLE "public"."project_destination_final_closeout_summary_view" TO "authenticated"

-- statement 700 of 775
GRANT ALL ON TABLE "public"."project_destination_final_closeout_summary_view" TO "service_role"

-- statement 701 of 775
GRANT ALL ON TABLE "public"."project_destination_archive_historical_record_view" TO "anon"

-- statement 702 of 775
GRANT ALL ON TABLE "public"."project_destination_archive_historical_record_view" TO "authenticated"

-- statement 703 of 775
GRANT ALL ON TABLE "public"."project_destination_archive_historical_record_view" TO "service_role"

-- statement 704 of 775
GRANT ALL ON TABLE "public"."project_destination_executive_summary_view" TO "anon"

-- statement 705 of 775
GRANT ALL ON TABLE "public"."project_destination_executive_summary_view" TO "authenticated"

-- statement 706 of 775
GRANT ALL ON TABLE "public"."project_destination_executive_summary_view" TO "service_role"

-- statement 707 of 775
GRANT ALL ON TABLE "public"."project_destination_release_tracking_view" TO "anon"

-- statement 708 of 775
GRANT ALL ON TABLE "public"."project_destination_release_tracking_view" TO "authenticated"

-- statement 709 of 775
GRANT ALL ON TABLE "public"."project_destination_release_tracking_view" TO "service_role"

-- statement 710 of 775
GRANT ALL ON SEQUENCE "public"."project_destination_selections_id_seq" TO "anon"

-- statement 711 of 775
GRANT ALL ON SEQUENCE "public"."project_destination_selections_id_seq" TO "authenticated"

-- statement 712 of 775
GRANT ALL ON SEQUENCE "public"."project_destination_selections_id_seq" TO "service_role"

-- statement 713 of 775
GRANT ALL ON SEQUENCE "public"."project_distribution_release_tracking_id_seq" TO "anon"

-- statement 714 of 775
GRANT ALL ON SEQUENCE "public"."project_distribution_release_tracking_id_seq" TO "authenticated"

-- statement 715 of 775
GRANT ALL ON SEQUENCE "public"."project_distribution_release_tracking_id_seq" TO "service_role"

-- statement 716 of 775
GRANT ALL ON SEQUENCE "public"."project_monetization_tracking_id_seq" TO "anon"

-- statement 717 of 775
GRANT ALL ON SEQUENCE "public"."project_monetization_tracking_id_seq" TO "authenticated"

-- statement 718 of 775
GRANT ALL ON SEQUENCE "public"."project_monetization_tracking_id_seq" TO "service_role"

-- statement 719 of 775
GRANT ALL ON TABLE "public"."project_rights_checklist" TO "anon"

-- statement 720 of 775
GRANT ALL ON TABLE "public"."project_rights_checklist" TO "authenticated"

-- statement 721 of 775
GRANT ALL ON TABLE "public"."project_rights_checklist" TO "service_role"

-- statement 722 of 775
GRANT ALL ON SEQUENCE "public"."project_rights_checklist_id_seq" TO "anon"

-- statement 723 of 775
GRANT ALL ON SEQUENCE "public"."project_rights_checklist_id_seq" TO "authenticated"

-- statement 724 of 775
GRANT ALL ON SEQUENCE "public"."project_rights_checklist_id_seq" TO "service_role"

-- statement 725 of 775
GRANT ALL ON SEQUENCE "public"."project_rights_tracking_id_seq" TO "anon"

-- statement 726 of 775
GRANT ALL ON SEQUENCE "public"."project_rights_tracking_id_seq" TO "authenticated"

-- statement 727 of 775
GRANT ALL ON SEQUENCE "public"."project_rights_tracking_id_seq" TO "service_role"

-- statement 728 of 775
GRANT ALL ON SEQUENCE "public"."project_statuses_id_seq" TO "anon"

-- statement 729 of 775
GRANT ALL ON SEQUENCE "public"."project_statuses_id_seq" TO "authenticated"

-- statement 730 of 775
GRANT ALL ON SEQUENCE "public"."project_statuses_id_seq" TO "service_role"

-- statement 731 of 775
GRANT ALL ON TABLE "public"."project_submission_packets" TO "anon"

-- statement 732 of 775
GRANT ALL ON TABLE "public"."project_submission_packets" TO "authenticated"

-- statement 733 of 775
GRANT ALL ON TABLE "public"."project_submission_packets" TO "service_role"

-- statement 734 of 775
GRANT ALL ON SEQUENCE "public"."project_submission_packets_id_seq" TO "anon"

-- statement 735 of 775
GRANT ALL ON SEQUENCE "public"."project_submission_packets_id_seq" TO "authenticated"

-- statement 736 of 775
GRANT ALL ON SEQUENCE "public"."project_submission_packets_id_seq" TO "service_role"

-- statement 737 of 775
GRANT ALL ON SEQUENCE "public"."project_submission_review_log_id_seq" TO "anon"

-- statement 738 of 775
GRANT ALL ON SEQUENCE "public"."project_submission_review_log_id_seq" TO "authenticated"

-- statement 739 of 775
GRANT ALL ON SEQUENCE "public"."project_submission_review_log_id_seq" TO "service_role"

-- statement 740 of 775
GRANT ALL ON SEQUENCE "public"."projects_id_seq" TO "anon"

-- statement 741 of 775
GRANT ALL ON SEQUENCE "public"."projects_id_seq" TO "authenticated"

-- statement 742 of 775
GRANT ALL ON SEQUENCE "public"."projects_id_seq" TO "service_role"

-- statement 743 of 775
GRANT ALL ON TABLE "public"."provider_profiles" TO "anon"

-- statement 744 of 775
GRANT ALL ON TABLE "public"."provider_profiles" TO "authenticated"

-- statement 745 of 775
GRANT ALL ON TABLE "public"."provider_profiles" TO "service_role"

-- statement 746 of 775
GRANT ALL ON TABLE "public"."resource_relationships" TO "anon"

-- statement 747 of 775
GRANT ALL ON TABLE "public"."resource_relationships" TO "authenticated"

-- statement 748 of 775
GRANT ALL ON TABLE "public"."resource_relationships" TO "service_role"

-- statement 749 of 775
GRANT ALL ON SEQUENCE "public"."resource_relationships_id_seq" TO "anon"

-- statement 750 of 775
GRANT ALL ON SEQUENCE "public"."resource_relationships_id_seq" TO "authenticated"

-- statement 751 of 775
GRANT ALL ON SEQUENCE "public"."resource_relationships_id_seq" TO "service_role"

-- statement 752 of 775
GRANT ALL ON TABLE "public"."shoot_requirements" TO "anon"

-- statement 753 of 775
GRANT ALL ON TABLE "public"."shoot_requirements" TO "authenticated"

-- statement 754 of 775
GRANT ALL ON TABLE "public"."shoot_requirements" TO "service_role"

-- statement 755 of 775
GRANT ALL ON SEQUENCE "public"."shoot_requirements_id_seq" TO "anon"

-- statement 756 of 775
GRANT ALL ON SEQUENCE "public"."shoot_requirements_id_seq" TO "authenticated"

-- statement 757 of 775
GRANT ALL ON SEQUENCE "public"."shoot_requirements_id_seq" TO "service_role"

-- statement 758 of 775
GRANT ALL ON TABLE "public"."shoot_types" TO "anon"

-- statement 759 of 775
GRANT ALL ON TABLE "public"."shoot_types" TO "authenticated"

-- statement 760 of 775
GRANT ALL ON TABLE "public"."shoot_types" TO "service_role"

-- statement 761 of 775
GRANT ALL ON SEQUENCE "public"."shoot_types_id_seq" TO "anon"

-- statement 762 of 775
GRANT ALL ON SEQUENCE "public"."shoot_types_id_seq" TO "authenticated"

-- statement 763 of 775
GRANT ALL ON SEQUENCE "public"."shoot_types_id_seq" TO "service_role"

-- statement 764 of 775
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres"

-- statement 765 of 775
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon"

-- statement 766 of 775
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated"

-- statement 767 of 775
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role"

-- statement 768 of 775
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres"

-- statement 769 of 775
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon"

-- statement 770 of 775
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated"

-- statement 771 of 775
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role"

-- statement 772 of 775
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres"

-- statement 773 of 775
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon"

-- statement 774 of 775
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated"

-- statement 775 of 775
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role"
