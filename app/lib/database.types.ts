export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      approved_host_listings_public: {
        Row: {
          amenities: string | null
          capacity: number | null
          city: string | null
          country: string | null
          description: string | null
          id: string
          listing_type: string
          min_hours: number | null
          rate_per_day: number | null
          rate_per_hour: number | null
          rules_notes: string | null
          state: string | null
          title: string
          user_id: string
        }
        Insert: {
          amenities?: string | null
          capacity?: number | null
          city?: string | null
          country?: string | null
          description?: string | null
          id: string
          listing_type: string
          min_hours?: number | null
          rate_per_day?: number | null
          rate_per_hour?: number | null
          rules_notes?: string | null
          state?: string | null
          title: string
          user_id: string
        }
        Update: {
          amenities?: string | null
          capacity?: number | null
          city?: string | null
          country?: string | null
          description?: string | null
          id?: string
          listing_type?: string
          min_hours?: number | null
          rate_per_day?: number | null
          rate_per_hour?: number | null
          rules_notes?: string | null
          state?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      booking_messages: {
        Row: {
          body: string
          created_at: string | null
          id: string
          request_id: string
          sender: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string | null
          id?: string
          request_id: string
          sender?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string | null
          id?: string
          request_id?: string
          sender?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_messages_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "booking_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_offers: {
        Row: {
          created_at: string | null
          id: string
          min_hours: number | null
          note: string | null
          offer_type: string
          rate_per_hour: number | null
          request_id: string
          status: string
          total: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          min_hours?: number | null
          note?: string | null
          offer_type?: string
          rate_per_hour?: number | null
          request_id: string
          status?: string
          total?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          min_hours?: number | null
          note?: string | null
          offer_type?: string
          rate_per_hour?: number | null
          request_id?: string
          status?: string
          total?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_offers_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "booking_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_requests: {
        Row: {
          created_at: string | null
          created_iso: string | null
          email: string
          end_iso: string | null
          host_user_id: string | null
          id: string
          impact: Json | null
          listing_id: string
          listing_slug: string | null
          listing_title: string | null
          message: string | null
          start_iso: string | null
          status: string | null
          thread_status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          created_iso?: string | null
          email: string
          end_iso?: string | null
          host_user_id?: string | null
          id?: string
          impact?: Json | null
          listing_id: string
          listing_slug?: string | null
          listing_title?: string | null
          message?: string | null
          start_iso?: string | null
          status?: string | null
          thread_status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          created_iso?: string | null
          email?: string
          end_iso?: string | null
          host_user_id?: string | null
          id?: string
          impact?: Json | null
          listing_id?: string
          listing_slug?: string | null
          listing_title?: string | null
          message?: string | null
          start_iso?: string | null
          status?: string | null
          thread_status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          active: boolean
          category_name: string
          created_at: string
          department_id: number
          example_name: string | null
          id: number
          listing_type_id: number
          slug: string | null
          sort_order: number
          subcategory_name: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          category_name: string
          created_at?: string
          department_id: number
          example_name?: string | null
          id?: number
          listing_type_id: number
          slug?: string | null
          sort_order?: number
          subcategory_name?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          category_name?: string
          created_at?: string
          department_id?: number
          example_name?: string | null
          id?: number
          listing_type_id?: number
          slug?: string | null
          sort_order?: number
          subcategory_name?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "categories_listing_type_id_fkey"
            columns: ["listing_type_id"]
            isOneToOne: false
            referencedRelation: "listing_types"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          active: boolean
          created_at: string
          department: string
          examples: string | null
          id: number
          sort_order: number
          sub_department: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          department: string
          examples?: string | null
          id?: number
          sort_order?: number
          sub_department?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          department?: string
          examples?: string | null
          id?: number
          sort_order?: number
          sub_department?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      destination_asset_requirements: {
        Row: {
          accepted_file_types: string[] | null
          asset_group: string
          asset_key: string
          asset_label: string
          created_at: string
          delivery_rule: string | null
          destination_id: number
          display_order: number
          id: number
          instruction_text: string | null
          is_active: boolean
          is_required: boolean
          max_file_size_mb: number | null
          max_files: number | null
          max_runtime_seconds: number | null
          min_files: number | null
          min_image_height: number | null
          min_image_width: number | null
          min_runtime_seconds: number | null
          updated_at: string
        }
        Insert: {
          accepted_file_types?: string[] | null
          asset_group?: string
          asset_key: string
          asset_label: string
          created_at?: string
          delivery_rule?: string | null
          destination_id: number
          display_order?: number
          id?: number
          instruction_text?: string | null
          is_active?: boolean
          is_required?: boolean
          max_file_size_mb?: number | null
          max_files?: number | null
          max_runtime_seconds?: number | null
          min_files?: number | null
          min_image_height?: number | null
          min_image_width?: number | null
          min_runtime_seconds?: number | null
          updated_at?: string
        }
        Update: {
          accepted_file_types?: string[] | null
          asset_group?: string
          asset_key?: string
          asset_label?: string
          created_at?: string
          delivery_rule?: string | null
          destination_id?: number
          display_order?: number
          id?: number
          instruction_text?: string | null
          is_active?: boolean
          is_required?: boolean
          max_file_size_mb?: number | null
          max_files?: number | null
          max_runtime_seconds?: number | null
          min_files?: number | null
          min_image_height?: number | null
          min_image_width?: number | null
          min_runtime_seconds?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "destination_asset_requirements_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "distribution_destination_summary_view"
            referencedColumns: ["destination_id"]
          },
          {
            foreignKeyName: "destination_asset_requirements_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "distribution_destinations"
            referencedColumns: ["id"]
          },
        ]
      }
      destination_field_mappings: {
        Row: {
          allowed_values: string[] | null
          created_at: string
          destination_field_group: string | null
          destination_id: number
          destination_term: string
          display_order: number
          example_value: string | null
          field_data_type: string
          formatting_rule: string | null
          id: number
          instruction_text: string | null
          is_active: boolean
          is_required: boolean
          max_length: number | null
          min_length: number | null
          source_field_key: string
          source_field_label: string
          updated_at: string
        }
        Insert: {
          allowed_values?: string[] | null
          created_at?: string
          destination_field_group?: string | null
          destination_id: number
          destination_term: string
          display_order?: number
          example_value?: string | null
          field_data_type?: string
          formatting_rule?: string | null
          id?: number
          instruction_text?: string | null
          is_active?: boolean
          is_required?: boolean
          max_length?: number | null
          min_length?: number | null
          source_field_key: string
          source_field_label: string
          updated_at?: string
        }
        Update: {
          allowed_values?: string[] | null
          created_at?: string
          destination_field_group?: string | null
          destination_id?: number
          destination_term?: string
          display_order?: number
          example_value?: string | null
          field_data_type?: string
          formatting_rule?: string | null
          id?: number
          instruction_text?: string | null
          is_active?: boolean
          is_required?: boolean
          max_length?: number | null
          min_length?: number | null
          source_field_key?: string
          source_field_label?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "destination_field_mappings_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "distribution_destination_summary_view"
            referencedColumns: ["destination_id"]
          },
          {
            foreignKeyName: "destination_field_mappings_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "distribution_destinations"
            referencedColumns: ["id"]
          },
        ]
      }
      distribution_destinations: {
        Row: {
          created_at: string
          delivery_notes: string | null
          destination_category: string
          destination_name: string
          destination_slug: string
          destination_status: string
          id: number
          is_alleystreet: boolean
          is_platform_neutral_default: boolean
          language_notes: string | null
          public_notes: string | null
          rights_notes: string | null
          short_description: string | null
          submission_url: string | null
          support_url: string | null
          truth_rule_notes: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          delivery_notes?: string | null
          destination_category: string
          destination_name: string
          destination_slug: string
          destination_status?: string
          id?: number
          is_alleystreet?: boolean
          is_platform_neutral_default?: boolean
          language_notes?: string | null
          public_notes?: string | null
          rights_notes?: string | null
          short_description?: string | null
          submission_url?: string | null
          support_url?: string | null
          truth_rule_notes?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          delivery_notes?: string | null
          destination_category?: string
          destination_name?: string
          destination_slug?: string
          destination_status?: string
          id?: number
          is_alleystreet?: boolean
          is_platform_neutral_default?: boolean
          language_notes?: string | null
          public_notes?: string | null
          rights_notes?: string | null
          short_description?: string | null
          submission_url?: string | null
          support_url?: string | null
          truth_rule_notes?: string
          updated_at?: string
        }
        Relationships: []
      }
      host_listing_submissions: {
        Row: {
          address: string | null
          amenities: string | null
          capacity: number | null
          city: string | null
          country: string | null
          description: string | null
          host_email: string | null
          id: string
          listing_type: string
          min_hours: number | null
          rate_per_day: number | null
          rate_per_hour: number | null
          rules_notes: string | null
          state: string | null
          status: string
          submitted_at: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          amenities?: string | null
          capacity?: number | null
          city?: string | null
          country?: string | null
          description?: string | null
          host_email?: string | null
          id?: string
          listing_type: string
          min_hours?: number | null
          rate_per_day?: number | null
          rate_per_hour?: number | null
          rules_notes?: string | null
          state?: string | null
          status?: string
          submitted_at?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          amenities?: string | null
          capacity?: number | null
          city?: string | null
          country?: string | null
          description?: string | null
          host_email?: string | null
          id?: string
          listing_type?: string
          min_hours?: number | null
          rate_per_day?: number | null
          rate_per_hour?: number | null
          rules_notes?: string | null
          state?: string | null
          status?: string
          submitted_at?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      listing_attributes: {
        Row: {
          active: boolean
          attribute_name: string
          category_id: number
          created_at: string
          department_id: number
          example_value: string | null
          field_type: string
          id: number
          is_required: boolean
          is_searchable: boolean
          listing_type_id: number
          sort_order: number
          updated_at: string
          value_options: string | null
        }
        Insert: {
          active?: boolean
          attribute_name: string
          category_id: number
          created_at?: string
          department_id: number
          example_value?: string | null
          field_type: string
          id?: number
          is_required?: boolean
          is_searchable?: boolean
          listing_type_id: number
          sort_order?: number
          updated_at?: string
          value_options?: string | null
        }
        Update: {
          active?: boolean
          attribute_name?: string
          category_id?: number
          created_at?: string
          department_id?: number
          example_value?: string | null
          field_type?: string
          id?: number
          is_required?: boolean
          is_searchable?: boolean
          listing_type_id?: number
          sort_order?: number
          updated_at?: string
          value_options?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "listing_attributes_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listing_attributes_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listing_attributes_listing_type_id_fkey"
            columns: ["listing_type_id"]
            isOneToOne: false
            referencedRelation: "listing_types"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_types: {
        Row: {
          active: boolean
          created_at: string
          id: number
          name: string
          notes: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: number
          name: string
          notes?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: number
          name?: string
          notes?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      policy_acceptances: {
        Row: {
          accepted_at: string
          created_at: string
          id: string
          policy_key: string
          policy_version: string
          user_id: string
        }
        Insert: {
          accepted_at?: string
          created_at?: string
          id?: string
          policy_key: string
          policy_version: string
          user_id: string
        }
        Update: {
          accepted_at?: string
          created_at?: string
          id?: string
          policy_key?: string
          policy_version?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          city: string | null
          country: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          knowledge_level: Database["public"]["Enums"]["knowledge_level_enum"]
          state: string | null
          updated_at: string
          user_role: Database["public"]["Enums"]["user_role_enum"]
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
          knowledge_level?: Database["public"]["Enums"]["knowledge_level_enum"]
          state?: string | null
          updated_at?: string
          user_role?: Database["public"]["Enums"]["user_role_enum"]
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          knowledge_level?: Database["public"]["Enums"]["knowledge_level_enum"]
          state?: string | null
          updated_at?: string
          user_role?: Database["public"]["Enums"]["user_role_enum"]
        }
        Relationships: []
      }
      project_activity_log: {
        Row: {
          active: boolean
          activity_at: string
          activity_description: string | null
          activity_title: string
          activity_type: string
          actor_label: string | null
          created_at: string
          id: number
          internal_only: boolean
          project_id: number
          related_record_id: number | null
          related_table_name: string | null
          status_id: number | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          activity_at?: string
          activity_description?: string | null
          activity_title: string
          activity_type: string
          actor_label?: string | null
          created_at?: string
          id?: number
          internal_only?: boolean
          project_id: number
          related_record_id?: number | null
          related_table_name?: string | null
          status_id?: number | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          activity_at?: string
          activity_description?: string | null
          activity_title?: string
          activity_type?: string
          actor_label?: string | null
          created_at?: string
          id?: number
          internal_only?: boolean
          project_id?: number
          related_record_id?: number | null
          related_table_name?: string | null
          status_id?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_activity_log_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_activity_log_status_id_fkey"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "project_statuses"
            referencedColumns: ["id"]
          },
        ]
      }
      project_approval_decisions: {
        Row: {
          active: boolean
          approval_scope: string | null
          conditions_to_clear: string | null
          created_at: string
          decided_by_label: string | null
          decision_at: string
          decision_notes: string | null
          decision_status: string
          decision_summary: string | null
          decision_type: string
          destination_id: number
          effective_at: string | null
          expires_at: string | null
          id: number
          internal_only: boolean
          offer_issued: boolean
          project_id: number
          revision_required: boolean
          submission_packet_id: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          approval_scope?: string | null
          conditions_to_clear?: string | null
          created_at?: string
          decided_by_label?: string | null
          decision_at?: string
          decision_notes?: string | null
          decision_status: string
          decision_summary?: string | null
          decision_type?: string
          destination_id: number
          effective_at?: string | null
          expires_at?: string | null
          id?: number
          internal_only?: boolean
          offer_issued?: boolean
          project_id: number
          revision_required?: boolean
          submission_packet_id: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          approval_scope?: string | null
          conditions_to_clear?: string | null
          created_at?: string
          decided_by_label?: string | null
          decision_at?: string
          decision_notes?: string | null
          decision_status?: string
          decision_summary?: string | null
          decision_type?: string
          destination_id?: number
          effective_at?: string | null
          expires_at?: string | null
          id?: number
          internal_only?: boolean
          offer_issued?: boolean
          project_id?: number
          revision_required?: boolean
          submission_packet_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_approval_decisions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_approval_decisions_submission_packet_id_fkey"
            columns: ["submission_packet_id"]
            isOneToOne: false
            referencedRelation: "project_submission_packets"
            referencedColumns: ["id"]
          },
        ]
      }
      project_deliverable_tracking: {
        Row: {
          active: boolean
          approved: boolean
          approved_at: string | null
          asset_file_name: string | null
          asset_url: string | null
          completed: boolean
          completed_at: string | null
          created_at: string
          deliverable_id: number
          id: number
          notes: string | null
          project_id: number
          required_for_this_project: boolean
          review_notes: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          approved?: boolean
          approved_at?: string | null
          asset_file_name?: string | null
          asset_url?: string | null
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          deliverable_id: number
          id?: number
          notes?: string | null
          project_id: number
          required_for_this_project?: boolean
          review_notes?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          approved?: boolean
          approved_at?: string | null
          asset_file_name?: string | null
          asset_url?: string | null
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          deliverable_id?: number
          id?: number
          notes?: string | null
          project_id?: number
          required_for_this_project?: boolean
          review_notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_deliverable_tracking_deliverable_id_fkey"
            columns: ["deliverable_id"]
            isOneToOne: false
            referencedRelation: "project_deliverables"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_deliverable_tracking_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_deliverables: {
        Row: {
          active: boolean
          created_at: string
          deliverable_name: string
          description: string | null
          id: number
          required_for_alleystreet: boolean
          required_for_external_release: boolean
          sort_order: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          deliverable_name: string
          description?: string | null
          id?: number
          required_for_alleystreet?: boolean
          required_for_external_release?: boolean
          sort_order?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          deliverable_name?: string
          description?: string | null
          id?: number
          required_for_alleystreet?: boolean
          required_for_external_release?: boolean
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      project_destination_selections: {
        Row: {
          created_at: string
          creator_goal: string | null
          creator_notes: string | null
          decision_received_at: string | null
          destination_id: number
          external_submission_reference: string | null
          guidance_reviewed: boolean
          id: number
          internal_notes: string | null
          is_primary_destination: boolean
          planned_submission_at: string | null
          priority_order: number
          project_id: number
          release_strategy: string | null
          required_assets_complete: boolean
          required_fields_complete: boolean
          rights_confirmed: boolean
          selection_status: string
          submission_package_status: string
          submitted_at: string | null
          target_release_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          creator_goal?: string | null
          creator_notes?: string | null
          decision_received_at?: string | null
          destination_id: number
          external_submission_reference?: string | null
          guidance_reviewed?: boolean
          id?: number
          internal_notes?: string | null
          is_primary_destination?: boolean
          planned_submission_at?: string | null
          priority_order?: number
          project_id: number
          release_strategy?: string | null
          required_assets_complete?: boolean
          required_fields_complete?: boolean
          rights_confirmed?: boolean
          selection_status?: string
          submission_package_status?: string
          submitted_at?: string | null
          target_release_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          creator_goal?: string | null
          creator_notes?: string | null
          decision_received_at?: string | null
          destination_id?: number
          external_submission_reference?: string | null
          guidance_reviewed?: boolean
          id?: number
          internal_notes?: string | null
          is_primary_destination?: boolean
          planned_submission_at?: string | null
          priority_order?: number
          project_id?: number
          release_strategy?: string | null
          required_assets_complete?: boolean
          required_fields_complete?: boolean
          rights_confirmed?: boolean
          selection_status?: string
          submission_package_status?: string
          submitted_at?: string | null
          target_release_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_destination_selections_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "distribution_destination_summary_view"
            referencedColumns: ["destination_id"]
          },
          {
            foreignKeyName: "project_destination_selections_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "distribution_destinations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_destination_selections_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_distribution_release_tracking: {
        Row: {
          active: boolean
          actual_release_at: string | null
          approval_decision_id: number | null
          created_at: string
          destination_id: number
          id: number
          internal_notes: string | null
          platform_label: string | null
          project_id: number
          public_visible: boolean
          release_notes: string | null
          release_status: string
          release_type: string | null
          release_url: string | null
          scheduled_release_at: string | null
          submission_packet_id: number | null
          territory_scope: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          actual_release_at?: string | null
          approval_decision_id?: number | null
          created_at?: string
          destination_id: number
          id?: number
          internal_notes?: string | null
          platform_label?: string | null
          project_id: number
          public_visible?: boolean
          release_notes?: string | null
          release_status?: string
          release_type?: string | null
          release_url?: string | null
          scheduled_release_at?: string | null
          submission_packet_id?: number | null
          territory_scope?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          actual_release_at?: string | null
          approval_decision_id?: number | null
          created_at?: string
          destination_id?: number
          id?: number
          internal_notes?: string | null
          platform_label?: string | null
          project_id?: number
          public_visible?: boolean
          release_notes?: string | null
          release_status?: string
          release_type?: string | null
          release_url?: string | null
          scheduled_release_at?: string | null
          submission_packet_id?: number | null
          territory_scope?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_distribution_release_tracking_approval_decision_id_fkey"
            columns: ["approval_decision_id"]
            isOneToOne: false
            referencedRelation: "project_approval_decisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_distribution_release_tracking_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_distribution_release_tracking_submission_packet_id_fkey"
            columns: ["submission_packet_id"]
            isOneToOne: false
            referencedRelation: "project_submission_packets"
            referencedColumns: ["id"]
          },
        ]
      }
      project_monetization_tracking: {
        Row: {
          active: boolean
          agreement_type: string | null
          alleystreet_share_amount: number
          alleystreet_share_pct: number | null
          created_at: string
          creator_share_amount: number
          creator_share_pct: number | null
          currency_code: string
          destination_id: number
          distribution_fees: number
          first_revenue_at: string | null
          gross_revenue: number
          id: number
          internal_notes: string | null
          last_revenue_at: string | null
          monetization_status: string
          net_revenue: number
          other_costs: number
          payout_due_at: string | null
          payout_sent_at: string | null
          platform_fees: number
          project_id: number
          release_tracking_id: number | null
          revenue_notes: string | null
          revenue_stream_type: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          agreement_type?: string | null
          alleystreet_share_amount?: number
          alleystreet_share_pct?: number | null
          created_at?: string
          creator_share_amount?: number
          creator_share_pct?: number | null
          currency_code?: string
          destination_id: number
          distribution_fees?: number
          first_revenue_at?: string | null
          gross_revenue?: number
          id?: number
          internal_notes?: string | null
          last_revenue_at?: string | null
          monetization_status?: string
          net_revenue?: number
          other_costs?: number
          payout_due_at?: string | null
          payout_sent_at?: string | null
          platform_fees?: number
          project_id: number
          release_tracking_id?: number | null
          revenue_notes?: string | null
          revenue_stream_type: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          agreement_type?: string | null
          alleystreet_share_amount?: number
          alleystreet_share_pct?: number | null
          created_at?: string
          creator_share_amount?: number
          creator_share_pct?: number | null
          currency_code?: string
          destination_id?: number
          distribution_fees?: number
          first_revenue_at?: string | null
          gross_revenue?: number
          id?: number
          internal_notes?: string | null
          last_revenue_at?: string | null
          monetization_status?: string
          net_revenue?: number
          other_costs?: number
          payout_due_at?: string | null
          payout_sent_at?: string | null
          platform_fees?: number
          project_id?: number
          release_tracking_id?: number | null
          revenue_notes?: string | null
          revenue_stream_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_monetization_tracking_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_monetization_tracking_release_tracking_id_fkey"
            columns: ["release_tracking_id"]
            isOneToOne: false
            referencedRelation: "project_destination_release_tracking_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_monetization_tracking_release_tracking_id_fkey"
            columns: ["release_tracking_id"]
            isOneToOne: false
            referencedRelation: "project_distribution_release_tracking"
            referencedColumns: ["id"]
          },
        ]
      }
      project_rights_checklist: {
        Row: {
          active: boolean
          check_item_name: string
          created_at: string
          description: string | null
          id: number
          required: boolean
          sort_order: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          check_item_name: string
          created_at?: string
          description?: string | null
          id?: number
          required?: boolean
          sort_order?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          check_item_name?: string
          created_at?: string
          description?: string | null
          id?: number
          required?: boolean
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      project_rights_tracking: {
        Row: {
          active: boolean
          approved: boolean
          approved_at: string | null
          completed: boolean
          completed_at: string | null
          created_at: string
          evidence_file_name: string | null
          evidence_url: string | null
          id: number
          notes: string | null
          project_id: number
          required_for_this_project: boolean
          review_notes: string | null
          rights_check_item_id: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          approved?: boolean
          approved_at?: string | null
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          evidence_file_name?: string | null
          evidence_url?: string | null
          id?: number
          notes?: string | null
          project_id: number
          required_for_this_project?: boolean
          review_notes?: string | null
          rights_check_item_id: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          approved?: boolean
          approved_at?: string | null
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          evidence_file_name?: string | null
          evidence_url?: string | null
          id?: number
          notes?: string | null
          project_id?: number
          required_for_this_project?: boolean
          review_notes?: string | null
          rights_check_item_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_rights_tracking_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_rights_tracking_rights_check_item_id_fkey"
            columns: ["rights_check_item_id"]
            isOneToOne: false
            referencedRelation: "project_rights_checklist"
            referencedColumns: ["id"]
          },
        ]
      }
      project_statuses: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          eligible_for_distribution_offer: boolean
          final_stage: boolean
          id: number
          sort_order: number
          status_name: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          eligible_for_distribution_offer?: boolean
          final_stage?: boolean
          id?: number
          sort_order?: number
          status_name: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          eligible_for_distribution_offer?: boolean
          final_stage?: boolean
          id?: number
          sort_order?: number
          status_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      project_submission_packets: {
        Row: {
          active: boolean
          approved_at: string | null
          created_at: string
          destination_id: number
          id: number
          included_captions: boolean
          included_credits_list: boolean
          included_final_master: boolean
          included_key_art: boolean
          included_metadata_sheet: boolean
          packet_notes: string | null
          packet_status: string
          project_id: number
          readiness_snapshot: Json | null
          rejected_at: string | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by_label: string | null
          rights_review_complete: boolean
          submission_round: number
          submitted_at: string | null
          submitted_by_label: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          approved_at?: string | null
          created_at?: string
          destination_id: number
          id?: number
          included_captions?: boolean
          included_credits_list?: boolean
          included_final_master?: boolean
          included_key_art?: boolean
          included_metadata_sheet?: boolean
          packet_notes?: string | null
          packet_status?: string
          project_id: number
          readiness_snapshot?: Json | null
          rejected_at?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by_label?: string | null
          rights_review_complete?: boolean
          submission_round?: number
          submitted_at?: string | null
          submitted_by_label?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          approved_at?: string | null
          created_at?: string
          destination_id?: number
          id?: number
          included_captions?: boolean
          included_credits_list?: boolean
          included_final_master?: boolean
          included_key_art?: boolean
          included_metadata_sheet?: boolean
          packet_notes?: string | null
          packet_status?: string
          project_id?: number
          readiness_snapshot?: Json | null
          rejected_at?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by_label?: string | null
          rights_review_complete?: boolean
          submission_round?: number
          submitted_at?: string | null
          submitted_by_label?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_submission_packets_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_submission_review_log: {
        Row: {
          active: boolean
          created_at: string
          decision_summary: string | null
          id: number
          internal_only: boolean
          project_id: number
          requested_changes: string | null
          review_action: string
          review_notes: string | null
          review_stage: string
          review_status: string
          reviewed_at: string
          reviewer_label: string | null
          submission_packet_id: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          decision_summary?: string | null
          id?: number
          internal_only?: boolean
          project_id: number
          requested_changes?: string | null
          review_action: string
          review_notes?: string | null
          review_stage: string
          review_status: string
          reviewed_at?: string
          reviewer_label?: string | null
          submission_packet_id: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          decision_summary?: string | null
          id?: number
          internal_only?: boolean
          project_id?: number
          requested_changes?: string | null
          review_action?: string
          review_notes?: string | null
          review_stage?: string
          review_status?: string
          reviewed_at?: string
          reviewer_label?: string | null
          submission_packet_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_submission_review_log_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_submission_review_log_submission_packet_id_fkey"
            columns: ["submission_packet_id"]
            isOneToOne: false
            referencedRelation: "project_submission_packets"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          active: boolean
          alleystreet_offer_eligible: boolean
          alleystreet_submitted: boolean
          city: string | null
          country: string | null
          created_at: string
          creator_notes: string | null
          estimated_runtime_minutes: number | null
          external_release_ready: boolean
          id: number
          owner_user_id: string | null
          primary_distribution_destination_id: number | null
          project_type: string
          provider_creator_type: string | null
          rights_confirmed: boolean
          state: string | null
          status_id: number | null
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          alleystreet_offer_eligible?: boolean
          alleystreet_submitted?: boolean
          city?: string | null
          country?: string | null
          created_at?: string
          creator_notes?: string | null
          estimated_runtime_minutes?: number | null
          external_release_ready?: boolean
          id?: number
          owner_user_id?: string | null
          primary_distribution_destination_id?: number | null
          project_type: string
          provider_creator_type?: string | null
          rights_confirmed?: boolean
          state?: string | null
          status_id?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          alleystreet_offer_eligible?: boolean
          alleystreet_submitted?: boolean
          city?: string | null
          country?: string | null
          created_at?: string
          creator_notes?: string | null
          estimated_runtime_minutes?: number | null
          external_release_ready?: boolean
          id?: number
          owner_user_id?: string | null
          primary_distribution_destination_id?: number | null
          project_type?: string
          provider_creator_type?: string | null
          rights_confirmed?: boolean
          state?: string | null
          status_id?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_status_id_fkey"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "project_statuses"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_profiles: {
        Row: {
          active: boolean
          business_name: string
          city: string | null
          country: string | null
          created_at: string
          description: string | null
          id: string
          insurance_status: string | null
          is_verified: boolean
          owner_user_id: string
          phone: string | null
          provider_type: string
          slug: string | null
          state: string | null
          updated_at: string
          website: string | null
          zone_name: string | null
        }
        Insert: {
          active?: boolean
          business_name: string
          city?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          id?: string
          insurance_status?: string | null
          is_verified?: boolean
          owner_user_id: string
          phone?: string | null
          provider_type: string
          slug?: string | null
          state?: string | null
          updated_at?: string
          website?: string | null
          zone_name?: string | null
        }
        Update: {
          active?: boolean
          business_name?: string
          city?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          id?: string
          insurance_status?: string | null
          is_verified?: boolean
          owner_user_id?: string
          phone?: string | null
          provider_type?: string
          slug?: string | null
          state?: string | null
          updated_at?: string
          website?: string | null
          zone_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "provider_profiles_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      resource_relationships: {
        Row: {
          active: boolean
          created_at: string
          id: number
          primary_category_id: number
          primary_department_id: number | null
          primary_listing_type_id: number
          reason: string | null
          suggested_category_id: number
          suggested_department_id: number | null
          suggested_listing_type_id: number
          updated_at: string
          weight: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: number
          primary_category_id: number
          primary_department_id?: number | null
          primary_listing_type_id: number
          reason?: string | null
          suggested_category_id: number
          suggested_department_id?: number | null
          suggested_listing_type_id: number
          updated_at?: string
          weight?: number
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: number
          primary_category_id?: number
          primary_department_id?: number | null
          primary_listing_type_id?: number
          reason?: string | null
          suggested_category_id?: number
          suggested_department_id?: number | null
          suggested_listing_type_id?: number
          updated_at?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "resource_relationships_primary_category_id_fkey"
            columns: ["primary_category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resource_relationships_primary_department_id_fkey"
            columns: ["primary_department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resource_relationships_primary_listing_type_id_fkey"
            columns: ["primary_listing_type_id"]
            isOneToOne: false
            referencedRelation: "listing_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resource_relationships_suggested_category_id_fkey"
            columns: ["suggested_category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resource_relationships_suggested_department_id_fkey"
            columns: ["suggested_department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resource_relationships_suggested_listing_type_id_fkey"
            columns: ["suggested_listing_type_id"]
            isOneToOne: false
            referencedRelation: "listing_types"
            referencedColumns: ["id"]
          },
        ]
      }
      shoot_requirements: {
        Row: {
          active: boolean
          created_at: string
          default_qty: string | null
          id: number
          optional: boolean
          priority: string
          reason: string | null
          required_category_id: number
          required_department_id: number | null
          required_listing_type_id: number
          required_subcategory_name: string | null
          shoot_type_id: number
          sort_order: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          default_qty?: string | null
          id?: number
          optional?: boolean
          priority?: string
          reason?: string | null
          required_category_id: number
          required_department_id?: number | null
          required_listing_type_id: number
          required_subcategory_name?: string | null
          shoot_type_id: number
          sort_order?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          default_qty?: string | null
          id?: number
          optional?: boolean
          priority?: string
          reason?: string | null
          required_category_id?: number
          required_department_id?: number | null
          required_listing_type_id?: number
          required_subcategory_name?: string | null
          shoot_type_id?: number
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shoot_requirements_required_category_id_fkey"
            columns: ["required_category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shoot_requirements_required_department_id_fkey"
            columns: ["required_department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shoot_requirements_required_listing_type_id_fkey"
            columns: ["required_listing_type_id"]
            isOneToOne: false
            referencedRelation: "listing_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shoot_requirements_shoot_type_id_fkey"
            columns: ["shoot_type_id"]
            isOneToOne: false
            referencedRelation: "shoot_types"
            referencedColumns: ["id"]
          },
        ]
      }
      shoot_types: {
        Row: {
          active: boolean
          created_at: string
          default_crew_size: string | null
          default_listing_type: string | null
          description: string | null
          id: number
          indoor_outdoor: string | null
          shoot_type_name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          default_crew_size?: string | null
          default_listing_type?: string | null
          description?: string | null
          id?: number
          indoor_outdoor?: string | null
          shoot_type_name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          default_crew_size?: string | null
          default_listing_type?: string | null
          description?: string | null
          id?: number
          indoor_outdoor?: string | null
          shoot_type_name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      distribution_destination_summary_view: {
        Row: {
          asset_requirement_list: string | null
          asset_requirement_rows: number | null
          destination_category: string | null
          destination_id: number | null
          destination_name: string | null
          destination_slug: string | null
          destination_status: string | null
          field_mapping_list: string | null
          field_mapping_rows: number | null
          has_minimum_submission_structure: boolean | null
          is_alleystreet: boolean | null
          is_platform_neutral_default: boolean | null
          optional_asset_rows: number | null
          optional_field_rows: number | null
          public_notes: string | null
          required_asset_keys: string | null
          required_asset_rows: number | null
          required_field_keys: string | null
          required_field_rows: number | null
          short_description: string | null
          truth_rule_notes: string | null
        }
        Relationships: []
      }
      project_activity_timeline_view: {
        Row: {
          active: boolean | null
          activity_at: string | null
          activity_description: string | null
          activity_id: number | null
          activity_rank_desc: number | null
          activity_status_name: string | null
          activity_title: string | null
          activity_type: string | null
          actor_label: string | null
          created_at: string | null
          current_project_status: string | null
          internal_only: boolean | null
          is_latest_activity: boolean | null
          project_id: number | null
          project_type: string | null
          related_record_id: number | null
          related_table_name: string | null
          title: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_activity_log_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_destination_action_queue_primary_view: {
        Row: {
          destination_name: string | null
          is_primary_destination: boolean | null
          priority_order: number | null
          priority_rank: number | null
          project_id: number | null
          queue_code: string | null
          queue_group: string | null
          queue_key: string | null
          queue_priority: string | null
          queue_title: string | null
          target_at: string | null
          title: string | null
        }
        Relationships: []
      }
      project_destination_action_queue_view: {
        Row: {
          destination_category: string | null
          destination_id: number | null
          destination_name: string | null
          destination_slug: string | null
          is_primary_destination: boolean | null
          next_destination_action: string | null
          priority_order: number | null
          priority_rank: number | null
          project_id: number | null
          queue_code: string | null
          queue_detail: string | null
          queue_group: string | null
          queue_key: string | null
          queue_priority: string | null
          queue_title: string | null
          ready_to_submit: boolean | null
          selection_status: string | null
          submission_package_status: string | null
          target_at: string | null
          title: string | null
        }
        Relationships: []
      }
      project_destination_archive_historical_record_view: {
        Row: {
          action_status: string | null
          action_status_note: string | null
          actual_release_at: string | null
          appears_on_release_watch: boolean | null
          approval_decision_id: number | null
          archive_effective_at: string | null
          archive_record_next_step: string | null
          archive_record_rank: number | null
          archive_record_state: string | null
          archive_record_summary: string | null
          archive_terminal_state: boolean | null
          closeout_board_state: string | null
          closeout_card_label: string | null
          closeout_card_note: string | null
          closeout_effective_at: string | null
          closeout_lane: string | null
          closeout_lane_order: number | null
          closeout_next_step: string | null
          closeout_priority_band: string | null
          closeout_work_instruction: string | null
          closeout_work_type: string | null
          completion_effective_at: string | null
          completion_next_step: string | null
          completion_percent: number | null
          completion_rank: number | null
          completion_state: string | null
          completion_summary: string | null
          completion_terminal_state: boolean | null
          creator_goal: string | null
          dashboard_band: string | null
          dashboard_next_step: string | null
          dashboard_status_label: string | null
          dashboard_summary_text: string | null
          deliverables_approved_count: number | null
          deliverables_completed_count: number | null
          deliverables_required_count: number | null
          delivery_board_state: string | null
          delivery_next_step: string | null
          delivery_operator_instruction: string | null
          delivery_queue_label: string | null
          delivery_queue_note: string | null
          delivery_queue_order: number | null
          delivery_queue_status: string | null
          destination_category: string | null
          destination_id: number | null
          destination_name: string | null
          destination_slug: string | null
          final_blocker_summary: string | null
          final_closeout_effective_at: string | null
          final_closeout_next_step: string | null
          final_closeout_rank: number | null
          final_closeout_state: string | null
          final_closeout_summary: string | null
          final_closeout_terminal_state: boolean | null
          final_readiness_note: string | null
          final_readiness_status: string | null
          final_submission_ready: boolean | null
          first_revenue_at: string | null
          gross_revenue: number | null
          is_alleystreet: boolean | null
          is_primary_destination: boolean | null
          last_revenue_at: string | null
          latest_decision_summary: string | null
          latest_review_action: string | null
          latest_review_stage: string | null
          latest_review_status: string | null
          latest_reviewed_at: string | null
          lifecycle_effective_at: string | null
          lifecycle_stage: string | null
          lifecycle_stage_rank: number | null
          lifecycle_summary: string | null
          lifecycle_terminal_state: boolean | null
          live_monitor_effective_at: string | null
          live_monitor_next_step: string | null
          live_monitor_rank: number | null
          live_monitor_state: string | null
          live_monitor_summary: string | null
          monetization_status: string | null
          net_revenue: number | null
          next_handoff_action: string | null
          operator_action_state: string | null
          operator_board_state: string | null
          operator_card_label: string | null
          operator_card_note: string | null
          operator_lane: string | null
          operator_lane_order: number | null
          operator_next_step: string | null
          operator_priority_band: string | null
          operator_work_instruction: string | null
          operator_work_type: string | null
          outcome_effective_at: string | null
          outcome_label: string | null
          outcome_reason: string | null
          payout_due_at: string | null
          payout_sent_at: string | null
          platform_label: string | null
          primary_operator_action: string | null
          priority_order: number | null
          project_destination_selection_id: number | null
          project_id: number | null
          ready_to_submit: boolean | null
          recommended_next_step: string | null
          release_handoff_state: string | null
          release_status: string | null
          release_strategy: string | null
          release_type: string | null
          release_url: string | null
          required_assets_complete: boolean | null
          required_fields_complete: boolean | null
          rights_approved_count: number | null
          rights_completed_count: number | null
          rights_required_count: number | null
          scheduled_release_at: string | null
          selection_status: string | null
          submission_package_status: string | null
          submission_packet_id: number | null
          submission_state: string | null
          territory_scope: string | null
          title: string | null
          upload_state: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_destination_selections_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "distribution_destination_summary_view"
            referencedColumns: ["destination_id"]
          },
          {
            foreignKeyName: "project_destination_selections_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "distribution_destinations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_destination_selections_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_distribution_release_tracking_approval_decision_id_fkey"
            columns: ["approval_decision_id"]
            isOneToOne: false
            referencedRelation: "project_approval_decisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_distribution_release_tracking_submission_packet_id_fkey"
            columns: ["submission_packet_id"]
            isOneToOne: false
            referencedRelation: "project_submission_packets"
            referencedColumns: ["id"]
          },
        ]
      }
      project_destination_closeout_workboard_view: {
        Row: {
          action_status: string | null
          action_status_note: string | null
          actual_release_at: string | null
          appears_on_release_watch: boolean | null
          approval_decision_id: number | null
          closeout_board_state: string | null
          closeout_card_label: string | null
          closeout_card_note: string | null
          closeout_effective_at: string | null
          closeout_lane: string | null
          closeout_lane_order: number | null
          closeout_next_step: string | null
          closeout_priority_band: string | null
          closeout_work_instruction: string | null
          closeout_work_type: string | null
          completion_effective_at: string | null
          completion_next_step: string | null
          completion_percent: number | null
          completion_rank: number | null
          completion_state: string | null
          completion_summary: string | null
          completion_terminal_state: boolean | null
          creator_goal: string | null
          dashboard_band: string | null
          dashboard_next_step: string | null
          dashboard_status_label: string | null
          dashboard_summary_text: string | null
          deliverables_approved_count: number | null
          deliverables_completed_count: number | null
          deliverables_required_count: number | null
          delivery_board_state: string | null
          delivery_next_step: string | null
          delivery_operator_instruction: string | null
          delivery_queue_label: string | null
          delivery_queue_note: string | null
          delivery_queue_order: number | null
          delivery_queue_status: string | null
          destination_category: string | null
          destination_id: number | null
          destination_name: string | null
          destination_slug: string | null
          final_blocker_summary: string | null
          final_readiness_note: string | null
          final_readiness_status: string | null
          final_submission_ready: boolean | null
          first_revenue_at: string | null
          gross_revenue: number | null
          is_alleystreet: boolean | null
          is_primary_destination: boolean | null
          last_revenue_at: string | null
          latest_decision_summary: string | null
          latest_review_action: string | null
          latest_review_stage: string | null
          latest_review_status: string | null
          latest_reviewed_at: string | null
          lifecycle_effective_at: string | null
          lifecycle_stage: string | null
          lifecycle_stage_rank: number | null
          lifecycle_summary: string | null
          lifecycle_terminal_state: boolean | null
          live_monitor_effective_at: string | null
          live_monitor_next_step: string | null
          live_monitor_rank: number | null
          live_monitor_state: string | null
          live_monitor_summary: string | null
          monetization_status: string | null
          net_revenue: number | null
          next_handoff_action: string | null
          operator_action_state: string | null
          operator_board_state: string | null
          operator_card_label: string | null
          operator_card_note: string | null
          operator_lane: string | null
          operator_lane_order: number | null
          operator_next_step: string | null
          operator_priority_band: string | null
          operator_work_instruction: string | null
          operator_work_type: string | null
          outcome_effective_at: string | null
          outcome_label: string | null
          outcome_reason: string | null
          payout_due_at: string | null
          payout_sent_at: string | null
          platform_label: string | null
          primary_operator_action: string | null
          priority_order: number | null
          project_destination_selection_id: number | null
          project_id: number | null
          ready_to_submit: boolean | null
          recommended_next_step: string | null
          release_handoff_state: string | null
          release_status: string | null
          release_strategy: string | null
          release_type: string | null
          release_url: string | null
          required_assets_complete: boolean | null
          required_fields_complete: boolean | null
          rights_approved_count: number | null
          rights_completed_count: number | null
          rights_required_count: number | null
          scheduled_release_at: string | null
          selection_status: string | null
          submission_package_status: string | null
          submission_packet_id: number | null
          submission_state: string | null
          territory_scope: string | null
          title: string | null
          upload_state: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_destination_selections_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "distribution_destination_summary_view"
            referencedColumns: ["destination_id"]
          },
          {
            foreignKeyName: "project_destination_selections_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "distribution_destinations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_destination_selections_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_distribution_release_tracking_approval_decision_id_fkey"
            columns: ["approval_decision_id"]
            isOneToOne: false
            referencedRelation: "project_approval_decisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_distribution_release_tracking_submission_packet_id_fkey"
            columns: ["submission_packet_id"]
            isOneToOne: false
            referencedRelation: "project_submission_packets"
            referencedColumns: ["id"]
          },
        ]
      }
      project_destination_completion_dashboard_view: {
        Row: {
          action_status: string | null
          action_status_note: string | null
          actual_release_at: string | null
          appears_on_release_watch: boolean | null
          approval_decision_id: number | null
          completion_effective_at: string | null
          completion_next_step: string | null
          completion_percent: number | null
          completion_rank: number | null
          completion_state: string | null
          completion_summary: string | null
          completion_terminal_state: boolean | null
          creator_goal: string | null
          dashboard_band: string | null
          dashboard_next_step: string | null
          dashboard_status_label: string | null
          dashboard_summary_text: string | null
          deliverables_approved_count: number | null
          deliverables_completed_count: number | null
          deliverables_required_count: number | null
          delivery_board_state: string | null
          delivery_next_step: string | null
          delivery_operator_instruction: string | null
          delivery_queue_label: string | null
          delivery_queue_note: string | null
          delivery_queue_order: number | null
          delivery_queue_status: string | null
          destination_category: string | null
          destination_id: number | null
          destination_name: string | null
          destination_slug: string | null
          final_blocker_summary: string | null
          final_readiness_note: string | null
          final_readiness_status: string | null
          final_submission_ready: boolean | null
          first_revenue_at: string | null
          gross_revenue: number | null
          is_alleystreet: boolean | null
          is_primary_destination: boolean | null
          last_revenue_at: string | null
          latest_decision_summary: string | null
          latest_review_action: string | null
          latest_review_stage: string | null
          latest_review_status: string | null
          latest_reviewed_at: string | null
          lifecycle_effective_at: string | null
          lifecycle_stage: string | null
          lifecycle_stage_rank: number | null
          lifecycle_summary: string | null
          lifecycle_terminal_state: boolean | null
          live_monitor_effective_at: string | null
          live_monitor_next_step: string | null
          live_monitor_rank: number | null
          live_monitor_state: string | null
          live_monitor_summary: string | null
          monetization_status: string | null
          net_revenue: number | null
          next_handoff_action: string | null
          operator_action_state: string | null
          operator_board_state: string | null
          operator_card_label: string | null
          operator_card_note: string | null
          operator_lane: string | null
          operator_lane_order: number | null
          operator_next_step: string | null
          operator_priority_band: string | null
          operator_work_instruction: string | null
          operator_work_type: string | null
          outcome_effective_at: string | null
          outcome_label: string | null
          outcome_reason: string | null
          payout_due_at: string | null
          payout_sent_at: string | null
          platform_label: string | null
          primary_operator_action: string | null
          priority_order: number | null
          project_destination_selection_id: number | null
          project_id: number | null
          ready_to_submit: boolean | null
          recommended_next_step: string | null
          release_handoff_state: string | null
          release_status: string | null
          release_strategy: string | null
          release_type: string | null
          release_url: string | null
          required_assets_complete: boolean | null
          required_fields_complete: boolean | null
          rights_approved_count: number | null
          rights_completed_count: number | null
          rights_required_count: number | null
          scheduled_release_at: string | null
          selection_status: string | null
          submission_package_status: string | null
          submission_packet_id: number | null
          submission_state: string | null
          territory_scope: string | null
          title: string | null
          upload_state: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_destination_selections_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "distribution_destination_summary_view"
            referencedColumns: ["destination_id"]
          },
          {
            foreignKeyName: "project_destination_selections_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "distribution_destinations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_destination_selections_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_distribution_release_tracking_approval_decision_id_fkey"
            columns: ["approval_decision_id"]
            isOneToOne: false
            referencedRelation: "project_approval_decisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_distribution_release_tracking_submission_packet_id_fkey"
            columns: ["submission_packet_id"]
            isOneToOne: false
            referencedRelation: "project_submission_packets"
            referencedColumns: ["id"]
          },
        ]
      }
      project_destination_executive_summary_view: {
        Row: {
          action_status: string | null
          action_status_note: string | null
          actual_release_at: string | null
          approval_decision_id: number | null
          creator_goal: string | null
          decision_received_at: string | null
          deliverables_approved_count: number | null
          deliverables_completed_count: number | null
          deliverables_completion_pct: number | null
          deliverables_required_count: number | null
          delivery_next_step: string | null
          delivery_queue_label: string | null
          delivery_queue_status: string | null
          destination_category: string | null
          destination_id: number | null
          destination_name: string | null
          destination_slug: string | null
          executive_health_band: string | null
          executive_next_step: string | null
          executive_status_label: string | null
          executive_summary_text: string | null
          final_blocker_summary: string | null
          final_readiness_note: string | null
          final_readiness_status: string | null
          final_submission_ready: boolean | null
          first_revenue_at: string | null
          gross_revenue: number | null
          guidance_reviewed: boolean | null
          is_alleystreet: boolean | null
          is_primary_destination: boolean | null
          last_revenue_at: string | null
          latest_decision_summary: string | null
          latest_review_action: string | null
          latest_review_stage: string | null
          latest_review_status: string | null
          latest_reviewed_at: string | null
          lifecycle_effective_at: string | null
          lifecycle_stage: string | null
          lifecycle_stage_rank: number | null
          lifecycle_summary: string | null
          lifecycle_terminal_state: boolean | null
          monetization_status: string | null
          net_revenue: number | null
          next_destination_action: string | null
          operator_action_state: string | null
          operator_lane: string | null
          operator_priority_band: string | null
          outcome_effective_at: string | null
          outcome_label: string | null
          outcome_reason: string | null
          payout_due_at: string | null
          payout_sent_at: string | null
          planned_submission_at: string | null
          platform_label: string | null
          primary_operator_action: string | null
          priority_order: number | null
          project_destination_selection_id: number | null
          project_id: number | null
          readiness_gap_summary: string | null
          ready_to_submit: boolean | null
          recommended_next_step: string | null
          release_handoff_state: string | null
          release_status: string | null
          release_strategy: string | null
          release_type: string | null
          release_url: string | null
          required_assets_complete: boolean | null
          required_fields_complete: boolean | null
          rights_approved_count: number | null
          rights_completed_count: number | null
          rights_completion_pct: number | null
          rights_confirmed: boolean | null
          rights_required_count: number | null
          scheduled_release_at: string | null
          selection_status: string | null
          submission_package_status: string | null
          submission_packet_id: number | null
          submission_state: string | null
          submitted_at: string | null
          target_release_at: string | null
          territory_scope: string | null
          title: string | null
          upload_state: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_destination_selections_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "distribution_destination_summary_view"
            referencedColumns: ["destination_id"]
          },
          {
            foreignKeyName: "project_destination_selections_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "distribution_destinations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_destination_selections_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_distribution_release_tracking_approval_decision_id_fkey"
            columns: ["approval_decision_id"]
            isOneToOne: false
            referencedRelation: "project_approval_decisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_distribution_release_tracking_submission_packet_id_fkey"
            columns: ["submission_packet_id"]
            isOneToOne: false
            referencedRelation: "project_submission_packets"
            referencedColumns: ["id"]
          },
        ]
      }
      project_destination_final_closeout_summary_view: {
        Row: {
          action_status: string | null
          action_status_note: string | null
          actual_release_at: string | null
          appears_on_release_watch: boolean | null
          approval_decision_id: number | null
          closeout_board_state: string | null
          closeout_card_label: string | null
          closeout_card_note: string | null
          closeout_effective_at: string | null
          closeout_lane: string | null
          closeout_lane_order: number | null
          closeout_next_step: string | null
          closeout_priority_band: string | null
          closeout_work_instruction: string | null
          closeout_work_type: string | null
          completion_effective_at: string | null
          completion_next_step: string | null
          completion_percent: number | null
          completion_rank: number | null
          completion_state: string | null
          completion_summary: string | null
          completion_terminal_state: boolean | null
          creator_goal: string | null
          dashboard_band: string | null
          dashboard_next_step: string | null
          dashboard_status_label: string | null
          dashboard_summary_text: string | null
          deliverables_approved_count: number | null
          deliverables_completed_count: number | null
          deliverables_required_count: number | null
          delivery_board_state: string | null
          delivery_next_step: string | null
          delivery_operator_instruction: string | null
          delivery_queue_label: string | null
          delivery_queue_note: string | null
          delivery_queue_order: number | null
          delivery_queue_status: string | null
          destination_category: string | null
          destination_id: number | null
          destination_name: string | null
          destination_slug: string | null
          final_blocker_summary: string | null
          final_closeout_effective_at: string | null
          final_closeout_next_step: string | null
          final_closeout_rank: number | null
          final_closeout_state: string | null
          final_closeout_summary: string | null
          final_closeout_terminal_state: boolean | null
          final_readiness_note: string | null
          final_readiness_status: string | null
          final_submission_ready: boolean | null
          first_revenue_at: string | null
          gross_revenue: number | null
          is_alleystreet: boolean | null
          is_primary_destination: boolean | null
          last_revenue_at: string | null
          latest_decision_summary: string | null
          latest_review_action: string | null
          latest_review_stage: string | null
          latest_review_status: string | null
          latest_reviewed_at: string | null
          lifecycle_effective_at: string | null
          lifecycle_stage: string | null
          lifecycle_stage_rank: number | null
          lifecycle_summary: string | null
          lifecycle_terminal_state: boolean | null
          live_monitor_effective_at: string | null
          live_monitor_next_step: string | null
          live_monitor_rank: number | null
          live_monitor_state: string | null
          live_monitor_summary: string | null
          monetization_status: string | null
          net_revenue: number | null
          next_handoff_action: string | null
          operator_action_state: string | null
          operator_board_state: string | null
          operator_card_label: string | null
          operator_card_note: string | null
          operator_lane: string | null
          operator_lane_order: number | null
          operator_next_step: string | null
          operator_priority_band: string | null
          operator_work_instruction: string | null
          operator_work_type: string | null
          outcome_effective_at: string | null
          outcome_label: string | null
          outcome_reason: string | null
          payout_due_at: string | null
          payout_sent_at: string | null
          platform_label: string | null
          primary_operator_action: string | null
          priority_order: number | null
          project_destination_selection_id: number | null
          project_id: number | null
          ready_to_submit: boolean | null
          recommended_next_step: string | null
          release_handoff_state: string | null
          release_status: string | null
          release_strategy: string | null
          release_type: string | null
          release_url: string | null
          required_assets_complete: boolean | null
          required_fields_complete: boolean | null
          rights_approved_count: number | null
          rights_completed_count: number | null
          rights_required_count: number | null
          scheduled_release_at: string | null
          selection_status: string | null
          submission_package_status: string | null
          submission_packet_id: number | null
          submission_state: string | null
          territory_scope: string | null
          title: string | null
          upload_state: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_destination_selections_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "distribution_destination_summary_view"
            referencedColumns: ["destination_id"]
          },
          {
            foreignKeyName: "project_destination_selections_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "distribution_destinations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_destination_selections_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_distribution_release_tracking_approval_decision_id_fkey"
            columns: ["approval_decision_id"]
            isOneToOne: false
            referencedRelation: "project_approval_decisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_distribution_release_tracking_submission_packet_id_fkey"
            columns: ["submission_packet_id"]
            isOneToOne: false
            referencedRelation: "project_submission_packets"
            referencedColumns: ["id"]
          },
        ]
      }
      project_destination_final_delivery_queue_view: {
        Row: {
          action_status: string | null
          action_status_note: string | null
          blocked_destination_count: number | null
          dashboard_status: string | null
          delivery_board_state: string | null
          delivery_next_step: string | null
          delivery_operator_instruction: string | null
          delivery_queue_label: string | null
          delivery_queue_note: string | null
          delivery_queue_order: number | null
          delivery_queue_status: string | null
          destination_count: number | null
          destination_dashboard_note: string | null
          destination_dashboard_state: string | null
          destination_guidance_text: string | null
          destination_name: string | null
          final_blocker_summary: string | null
          final_readiness_note: string | null
          final_readiness_status: string | null
          final_submission_ready: boolean | null
          guidance_stage: string | null
          handoff_ready_count: number | null
          included_assets_summary: string | null
          included_documents_summary: string | null
          missing_assets_summary: string | null
          missing_documents_summary: string | null
          next_destination_action: string | null
          next_handoff_action: string | null
          operator_action_state: string | null
          operator_board_state: string | null
          operator_card_label: string | null
          operator_card_note: string | null
          operator_handoff_instruction: string | null
          operator_lane: string | null
          operator_lane_order: number | null
          operator_next_step: string | null
          operator_priority_band: string | null
          operator_work_instruction: string | null
          operator_work_type: string | null
          package_status_note: string | null
          primary_operator_action: string | null
          priority_order: number | null
          project_dashboard_summary: string | null
          project_id: number | null
          ready_destination_count: number | null
          ready_to_submit: boolean | null
          recommended_next_step: string | null
          release_handoff_state: string | null
          review_destination_count: number | null
          submission_instruction_text: string | null
          submission_package_status: string | null
          submission_prep_notes: string | null
          submission_state: string | null
          title: string | null
          upload_instruction_text: string | null
          upload_state: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_destination_selections_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_destination_final_readiness_view: {
        Row: {
          destination_guidance_text: string | null
          destination_name: string | null
          final_blocker_summary: string | null
          final_readiness_note: string | null
          final_readiness_status: string | null
          final_submission_ready: boolean | null
          guidance_stage: string | null
          included_assets_summary: string | null
          included_documents_summary: string | null
          missing_assets_summary: string | null
          missing_documents_summary: string | null
          next_destination_action: string | null
          next_handoff_action: string | null
          operator_handoff_instruction: string | null
          package_status_note: string | null
          priority_order: number | null
          project_id: number | null
          ready_to_submit: boolean | null
          release_handoff_state: string | null
          submission_instruction_text: string | null
          submission_package_status: string | null
          submission_prep_notes: string | null
          submission_state: string | null
          title: string | null
          upload_instruction_text: string | null
          upload_state: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_destination_selections_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_destination_guidance_view: {
        Row: {
          destination_category: string | null
          destination_guidance_text: string | null
          destination_id: number | null
          destination_name: string | null
          destination_slug: string | null
          guidance_required_asset_rows: number | null
          guidance_required_field_rows: number | null
          guidance_reviewed: boolean | null
          guidance_stage: string | null
          is_alleystreet: boolean | null
          is_primary_destination: boolean | null
          next_destination_action: string | null
          planned_submission_at: string | null
          priority_order: number | null
          project_destination_selection_id: number | null
          project_id: number | null
          readiness_gap_summary: string | null
          readiness_message: string | null
          ready_to_submit: boolean | null
          release_strategy: string | null
          required_asset_guidance: string | null
          required_asset_keys: string | null
          required_assets_complete: boolean | null
          required_field_guidance: string | null
          required_field_keys: string | null
          required_fields_complete: boolean | null
          rights_confirmed: boolean | null
          selection_status: string | null
          submission_package_status: string | null
          target_release_at: string | null
          title: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_destination_selections_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "distribution_destination_summary_view"
            referencedColumns: ["destination_id"]
          },
          {
            foreignKeyName: "project_destination_selections_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "distribution_destinations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_destination_selections_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_destination_live_release_monitor_view: {
        Row: {
          action_status: string | null
          action_status_note: string | null
          actual_release_at: string | null
          appears_on_release_watch: boolean | null
          approval_decision_id: number | null
          creator_goal: string | null
          delivery_board_state: string | null
          delivery_next_step: string | null
          delivery_operator_instruction: string | null
          delivery_queue_label: string | null
          delivery_queue_note: string | null
          delivery_queue_order: number | null
          delivery_queue_status: string | null
          destination_category: string | null
          destination_id: number | null
          destination_name: string | null
          destination_slug: string | null
          final_blocker_summary: string | null
          final_readiness_note: string | null
          final_readiness_status: string | null
          final_submission_ready: boolean | null
          is_alleystreet: boolean | null
          is_primary_destination: boolean | null
          latest_decision_summary: string | null
          latest_review_action: string | null
          latest_review_stage: string | null
          latest_review_status: string | null
          latest_reviewed_at: string | null
          lifecycle_effective_at: string | null
          lifecycle_stage: string | null
          lifecycle_stage_rank: number | null
          lifecycle_summary: string | null
          lifecycle_terminal_state: boolean | null
          live_monitor_effective_at: string | null
          live_monitor_next_step: string | null
          live_monitor_rank: number | null
          live_monitor_state: string | null
          live_monitor_summary: string | null
          next_handoff_action: string | null
          operator_action_state: string | null
          operator_board_state: string | null
          operator_card_label: string | null
          operator_card_note: string | null
          operator_lane: string | null
          operator_lane_order: number | null
          operator_next_step: string | null
          operator_priority_band: string | null
          operator_work_instruction: string | null
          operator_work_type: string | null
          outcome_effective_at: string | null
          outcome_label: string | null
          outcome_reason: string | null
          platform_label: string | null
          primary_operator_action: string | null
          priority_order: number | null
          project_destination_selection_id: number | null
          project_id: number | null
          public_visible: boolean | null
          recommended_next_step: string | null
          release_handoff_state: string | null
          release_status: string | null
          release_strategy: string | null
          release_tracking_active: boolean | null
          release_type: string | null
          release_url: string | null
          scheduled_release_at: string | null
          selection_status: string | null
          submission_package_status: string | null
          submission_packet_id: number | null
          submission_state: string | null
          territory_scope: string | null
          title: string | null
          upload_state: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_destination_selections_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "distribution_destination_summary_view"
            referencedColumns: ["destination_id"]
          },
          {
            foreignKeyName: "project_destination_selections_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "distribution_destinations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_destination_selections_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_distribution_release_tracking_approval_decision_id_fkey"
            columns: ["approval_decision_id"]
            isOneToOne: false
            referencedRelation: "project_approval_decisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_distribution_release_tracking_submission_packet_id_fkey"
            columns: ["submission_packet_id"]
            isOneToOne: false
            referencedRelation: "project_submission_packets"
            referencedColumns: ["id"]
          },
        ]
      }
      project_destination_master_lifecycle_view: {
        Row: {
          action_status: string | null
          action_status_note: string | null
          actual_release_at: string | null
          approval_decision_id: number | null
          asset_requirement_rows: number | null
          blocked_destination_count: number | null
          created_at: string | null
          creator_goal: string | null
          creator_notes: string | null
          dashboard_status: string | null
          decision_received_at: string | null
          deliverables_approved_count: number | null
          deliverables_completed_count: number | null
          deliverables_required_count: number | null
          delivery_board_state: string | null
          delivery_next_step: string | null
          delivery_operator_instruction: string | null
          delivery_queue_label: string | null
          delivery_queue_note: string | null
          delivery_queue_order: number | null
          delivery_queue_status: string | null
          destination_category: string | null
          destination_count: number | null
          destination_dashboard_note: string | null
          destination_dashboard_state: string | null
          destination_guidance_text: string | null
          destination_id: number | null
          destination_name: string | null
          destination_slug: string | null
          field_mapping_rows: number | null
          final_blocker_summary: string | null
          final_readiness_note: string | null
          final_readiness_status: string | null
          final_submission_ready: boolean | null
          first_revenue_at: string | null
          gross_revenue: number | null
          guidance_reviewed: boolean | null
          guidance_stage: string | null
          handoff_ready_count: number | null
          has_minimum_submission_structure: boolean | null
          included_assets_summary: string | null
          included_documents_summary: string | null
          internal_notes: string | null
          is_alleystreet: boolean | null
          is_primary_destination: boolean | null
          last_revenue_at: string | null
          latest_decision_summary: string | null
          latest_review_action: string | null
          latest_review_stage: string | null
          latest_review_status: string | null
          latest_reviewed_at: string | null
          lifecycle_effective_at: string | null
          lifecycle_stage: string | null
          lifecycle_stage_rank: number | null
          lifecycle_summary: string | null
          lifecycle_terminal_state: boolean | null
          missing_assets_summary: string | null
          missing_documents_summary: string | null
          monetization_status: string | null
          net_revenue: number | null
          next_destination_action: string | null
          next_handoff_action: string | null
          operator_action_state: string | null
          operator_board_state: string | null
          operator_card_label: string | null
          operator_card_note: string | null
          operator_handoff_instruction: string | null
          operator_lane: string | null
          operator_lane_order: number | null
          operator_next_step: string | null
          operator_priority_band: string | null
          operator_work_instruction: string | null
          operator_work_type: string | null
          outcome_effective_at: string | null
          outcome_label: string | null
          outcome_reason: string | null
          package_status_note: string | null
          payout_due_at: string | null
          payout_sent_at: string | null
          planned_submission_at: string | null
          platform_label: string | null
          primary_operator_action: string | null
          priority_order: number | null
          project_dashboard_summary: string | null
          project_destination_selection_id: number | null
          project_id: number | null
          public_visible: boolean | null
          readiness_gap_summary: string | null
          readiness_next_destination_action: string | null
          ready_destination_count: number | null
          ready_to_submit: boolean | null
          recommended_next_step: string | null
          release_handoff_state: string | null
          release_ready_to_submit: boolean | null
          release_status: string | null
          release_strategy: string | null
          release_tracking_active: boolean | null
          release_type: string | null
          release_url: string | null
          required_asset_keys: string | null
          required_asset_rows: number | null
          required_assets_complete: boolean | null
          required_field_keys: string | null
          required_field_rows: number | null
          required_fields_complete: boolean | null
          review_destination_count: number | null
          rights_approved_count: number | null
          rights_completed_count: number | null
          rights_confirmed: boolean | null
          rights_required_count: number | null
          scheduled_release_at: string | null
          selection_status: string | null
          submission_instruction_text: string | null
          submission_package_status: string | null
          submission_packet_id: number | null
          submission_prep_notes: string | null
          submission_state: string | null
          submitted_at: string | null
          target_release_at: string | null
          territory_scope: string | null
          title: string | null
          updated_at: string | null
          upload_instruction_text: string | null
          upload_state: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_destination_selections_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "distribution_destination_summary_view"
            referencedColumns: ["destination_id"]
          },
          {
            foreignKeyName: "project_destination_selections_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "distribution_destinations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_destination_selections_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_distribution_release_tracking_approval_decision_id_fkey"
            columns: ["approval_decision_id"]
            isOneToOne: false
            referencedRelation: "project_approval_decisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_distribution_release_tracking_submission_packet_id_fkey"
            columns: ["submission_packet_id"]
            isOneToOne: false
            referencedRelation: "project_submission_packets"
            referencedColumns: ["id"]
          },
        ]
      }
      project_destination_operator_workboard_view: {
        Row: {
          action_status: string | null
          action_status_note: string | null
          blocked_destination_count: number | null
          dashboard_status: string | null
          destination_count: number | null
          destination_dashboard_note: string | null
          destination_dashboard_state: string | null
          destination_guidance_text: string | null
          destination_name: string | null
          final_blocker_summary: string | null
          final_readiness_note: string | null
          final_readiness_status: string | null
          final_submission_ready: boolean | null
          guidance_stage: string | null
          handoff_ready_count: number | null
          included_assets_summary: string | null
          included_documents_summary: string | null
          missing_assets_summary: string | null
          missing_documents_summary: string | null
          next_destination_action: string | null
          next_handoff_action: string | null
          operator_action_state: string | null
          operator_board_state: string | null
          operator_card_label: string | null
          operator_card_note: string | null
          operator_handoff_instruction: string | null
          operator_lane: string | null
          operator_lane_order: number | null
          operator_next_step: string | null
          operator_priority_band: string | null
          operator_work_instruction: string | null
          operator_work_type: string | null
          package_status_note: string | null
          primary_operator_action: string | null
          priority_order: number | null
          project_dashboard_summary: string | null
          project_id: number | null
          ready_destination_count: number | null
          ready_to_submit: boolean | null
          recommended_next_step: string | null
          release_handoff_state: string | null
          review_destination_count: number | null
          submission_instruction_text: string | null
          submission_package_status: string | null
          submission_prep_notes: string | null
          submission_state: string | null
          title: string | null
          upload_instruction_text: string | null
          upload_state: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_destination_selections_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_destination_release_completion_view: {
        Row: {
          action_status: string | null
          action_status_note: string | null
          actual_release_at: string | null
          appears_on_release_watch: boolean | null
          approval_decision_id: number | null
          completion_effective_at: string | null
          completion_next_step: string | null
          completion_percent: number | null
          completion_rank: number | null
          completion_state: string | null
          completion_summary: string | null
          completion_terminal_state: boolean | null
          creator_goal: string | null
          deliverables_approved_count: number | null
          deliverables_completed_count: number | null
          deliverables_required_count: number | null
          delivery_board_state: string | null
          delivery_next_step: string | null
          delivery_operator_instruction: string | null
          delivery_queue_label: string | null
          delivery_queue_note: string | null
          delivery_queue_order: number | null
          delivery_queue_status: string | null
          destination_category: string | null
          destination_id: number | null
          destination_name: string | null
          destination_slug: string | null
          final_blocker_summary: string | null
          final_readiness_note: string | null
          final_readiness_status: string | null
          final_submission_ready: boolean | null
          first_revenue_at: string | null
          gross_revenue: number | null
          is_alleystreet: boolean | null
          is_primary_destination: boolean | null
          last_revenue_at: string | null
          latest_decision_summary: string | null
          latest_review_action: string | null
          latest_review_stage: string | null
          latest_review_status: string | null
          latest_reviewed_at: string | null
          lifecycle_effective_at: string | null
          lifecycle_stage: string | null
          lifecycle_stage_rank: number | null
          lifecycle_summary: string | null
          lifecycle_terminal_state: boolean | null
          live_monitor_effective_at: string | null
          live_monitor_next_step: string | null
          live_monitor_rank: number | null
          live_monitor_state: string | null
          live_monitor_summary: string | null
          monetization_status: string | null
          net_revenue: number | null
          next_handoff_action: string | null
          operator_action_state: string | null
          operator_board_state: string | null
          operator_card_label: string | null
          operator_card_note: string | null
          operator_lane: string | null
          operator_lane_order: number | null
          operator_next_step: string | null
          operator_priority_band: string | null
          operator_work_instruction: string | null
          operator_work_type: string | null
          outcome_effective_at: string | null
          outcome_label: string | null
          outcome_reason: string | null
          payout_due_at: string | null
          payout_sent_at: string | null
          platform_label: string | null
          primary_operator_action: string | null
          priority_order: number | null
          project_destination_selection_id: number | null
          project_id: number | null
          public_visible: boolean | null
          ready_to_submit: boolean | null
          recommended_next_step: string | null
          release_handoff_state: string | null
          release_status: string | null
          release_strategy: string | null
          release_tracking_active: boolean | null
          release_type: string | null
          release_url: string | null
          required_assets_complete: boolean | null
          required_fields_complete: boolean | null
          rights_approved_count: number | null
          rights_completed_count: number | null
          rights_required_count: number | null
          scheduled_release_at: string | null
          selection_status: string | null
          submission_package_status: string | null
          submission_packet_id: number | null
          submission_state: string | null
          territory_scope: string | null
          title: string | null
          upload_state: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_destination_selections_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "distribution_destination_summary_view"
            referencedColumns: ["destination_id"]
          },
          {
            foreignKeyName: "project_destination_selections_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "distribution_destinations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_destination_selections_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_distribution_release_tracking_approval_decision_id_fkey"
            columns: ["approval_decision_id"]
            isOneToOne: false
            referencedRelation: "project_approval_decisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_distribution_release_tracking_submission_packet_id_fkey"
            columns: ["submission_packet_id"]
            isOneToOne: false
            referencedRelation: "project_submission_packets"
            referencedColumns: ["id"]
          },
        ]
      }
      project_destination_release_outcome_view: {
        Row: {
          action_status: string | null
          action_status_note: string | null
          actual_release_at: string | null
          approval_decision_id: number | null
          blocked_destination_count: number | null
          dashboard_status: string | null
          deliverables_approved_count: number | null
          deliverables_completed_count: number | null
          deliverables_required_count: number | null
          delivery_board_state: string | null
          delivery_next_step: string | null
          delivery_operator_instruction: string | null
          delivery_queue_label: string | null
          delivery_queue_note: string | null
          delivery_queue_order: number | null
          delivery_queue_status: string | null
          destination_category: string | null
          destination_count: number | null
          destination_dashboard_note: string | null
          destination_dashboard_state: string | null
          destination_guidance_text: string | null
          destination_id: number | null
          destination_name: string | null
          destination_slug: string | null
          final_blocker_summary: string | null
          final_readiness_note: string | null
          final_readiness_status: string | null
          final_submission_ready: boolean | null
          first_revenue_at: string | null
          gross_revenue: number | null
          guidance_stage: string | null
          handoff_ready_count: number | null
          included_assets_summary: string | null
          included_documents_summary: string | null
          is_alleystreet: boolean | null
          is_primary_destination: boolean | null
          last_revenue_at: string | null
          latest_decision_summary: string | null
          latest_review_action: string | null
          latest_review_stage: string | null
          latest_review_status: string | null
          latest_reviewed_at: string | null
          missing_assets_summary: string | null
          missing_documents_summary: string | null
          monetization_status: string | null
          net_revenue: number | null
          next_handoff_action: string | null
          operator_action_state: string | null
          operator_board_state: string | null
          operator_card_label: string | null
          operator_card_note: string | null
          operator_handoff_instruction: string | null
          operator_lane: string | null
          operator_lane_order: number | null
          operator_next_step: string | null
          operator_priority_band: string | null
          operator_work_instruction: string | null
          operator_work_type: string | null
          outcome_effective_at: string | null
          outcome_label: string | null
          outcome_reason: string | null
          package_status_note: string | null
          payout_due_at: string | null
          payout_sent_at: string | null
          platform_label: string | null
          primary_operator_action: string | null
          priority_order: number | null
          project_dashboard_summary: string | null
          project_destination_selection_id: number | null
          project_id: number | null
          public_visible: boolean | null
          readiness_next_destination_action: string | null
          ready_destination_count: number | null
          ready_to_submit: boolean | null
          recommended_next_step: string | null
          release_handoff_state: string | null
          release_status: string | null
          release_tracking_active: boolean | null
          release_type: string | null
          release_url: string | null
          review_destination_count: number | null
          rights_approved_count: number | null
          rights_completed_count: number | null
          rights_required_count: number | null
          scheduled_release_at: string | null
          selection_status: string | null
          submission_instruction_text: string | null
          submission_package_status: string | null
          submission_packet_id: number | null
          submission_prep_notes: string | null
          submission_state: string | null
          territory_scope: string | null
          title: string | null
          upload_instruction_text: string | null
          upload_state: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_destination_selections_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "distribution_destination_summary_view"
            referencedColumns: ["destination_id"]
          },
          {
            foreignKeyName: "project_destination_selections_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "distribution_destinations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_destination_selections_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_distribution_release_tracking_approval_decision_id_fkey"
            columns: ["approval_decision_id"]
            isOneToOne: false
            referencedRelation: "project_approval_decisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_distribution_release_tracking_submission_packet_id_fkey"
            columns: ["submission_packet_id"]
            isOneToOne: false
            referencedRelation: "project_submission_packets"
            referencedColumns: ["id"]
          },
        ]
      }
      project_destination_release_tracking_view: {
        Row: {
          active: boolean | null
          actual_release_at: string | null
          approval_decision_id: number | null
          created_at: string | null
          destination_id: number | null
          id: number | null
          internal_notes: string | null
          platform_label: string | null
          project_id: number | null
          public_visible: boolean | null
          release_notes: string | null
          release_status: string | null
          release_type: string | null
          release_url: string | null
          scheduled_release_at: string | null
          submission_packet_id: number | null
          territory_scope: string | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          actual_release_at?: string | null
          approval_decision_id?: number | null
          created_at?: string | null
          destination_id?: number | null
          id?: number | null
          internal_notes?: string | null
          platform_label?: string | null
          project_id?: number | null
          public_visible?: boolean | null
          release_notes?: string | null
          release_status?: string | null
          release_type?: string | null
          release_url?: string | null
          scheduled_release_at?: string | null
          submission_packet_id?: number | null
          territory_scope?: string | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          actual_release_at?: string | null
          approval_decision_id?: number | null
          created_at?: string | null
          destination_id?: number | null
          id?: number | null
          internal_notes?: string | null
          platform_label?: string | null
          project_id?: number | null
          public_visible?: boolean | null
          release_notes?: string | null
          release_status?: string | null
          release_type?: string | null
          release_url?: string | null
          scheduled_release_at?: string | null
          submission_packet_id?: number | null
          territory_scope?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_distribution_release_tracking_approval_decision_id_fkey"
            columns: ["approval_decision_id"]
            isOneToOne: false
            referencedRelation: "project_approval_decisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_distribution_release_tracking_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_distribution_release_tracking_submission_packet_id_fkey"
            columns: ["submission_packet_id"]
            isOneToOne: false
            referencedRelation: "project_submission_packets"
            referencedColumns: ["id"]
          },
        ]
      }
      project_destination_submission_package_view: {
        Row: {
          destination_guidance_text: string | null
          destination_name: string | null
          guidance_stage: string | null
          included_assets_summary: string | null
          included_documents_summary: string | null
          missing_assets_summary: string | null
          missing_documents_summary: string | null
          next_destination_action: string | null
          package_status_note: string | null
          priority_order: number | null
          project_id: number | null
          queue_title: string | null
          ready_to_submit: boolean | null
          submission_instruction_text: string | null
          submission_package_status: string | null
          submission_prep_notes: string | null
          submission_state: string | null
          title: string | null
          upload_instruction_text: string | null
          upload_state: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_destination_selections_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_destination_submission_prep_view: {
        Row: {
          destination_guidance_text: string | null
          destination_name: string | null
          guidance_stage: string | null
          next_destination_action: string | null
          priority_order: number | null
          project_id: number | null
          readiness_gap_summary: string | null
          ready_to_submit: boolean | null
          submission_instruction_text: string | null
          submission_prep_notes: string | null
          title: string | null
          upload_instruction_text: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_destination_selections_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_destination_submission_release_action_view: {
        Row: {
          action_status: string | null
          action_status_note: string | null
          destination_guidance_text: string | null
          destination_name: string | null
          final_blocker_summary: string | null
          final_readiness_note: string | null
          final_readiness_status: string | null
          final_submission_ready: boolean | null
          guidance_stage: string | null
          included_assets_summary: string | null
          included_documents_summary: string | null
          missing_assets_summary: string | null
          missing_documents_summary: string | null
          next_destination_action: string | null
          next_handoff_action: string | null
          operator_action_state: string | null
          operator_handoff_instruction: string | null
          package_status_note: string | null
          primary_operator_action: string | null
          priority_order: number | null
          project_id: number | null
          ready_to_submit: boolean | null
          recommended_next_step: string | null
          release_handoff_state: string | null
          submission_instruction_text: string | null
          submission_package_status: string | null
          submission_prep_notes: string | null
          submission_state: string | null
          title: string | null
          upload_instruction_text: string | null
          upload_state: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_destination_selections_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_destination_submission_release_dashboard_view: {
        Row: {
          action_status: string | null
          action_status_note: string | null
          blocked_destination_count: number | null
          dashboard_status: string | null
          destination_count: number | null
          destination_dashboard_note: string | null
          destination_dashboard_state: string | null
          destination_guidance_text: string | null
          destination_name: string | null
          final_blocker_summary: string | null
          final_readiness_note: string | null
          final_readiness_status: string | null
          final_submission_ready: boolean | null
          guidance_stage: string | null
          handoff_ready_count: number | null
          included_assets_summary: string | null
          included_documents_summary: string | null
          missing_assets_summary: string | null
          missing_documents_summary: string | null
          next_destination_action: string | null
          next_handoff_action: string | null
          operator_action_state: string | null
          operator_handoff_instruction: string | null
          package_status_note: string | null
          primary_operator_action: string | null
          priority_order: number | null
          project_dashboard_summary: string | null
          project_id: number | null
          ready_destination_count: number | null
          ready_to_submit: boolean | null
          recommended_next_step: string | null
          release_handoff_state: string | null
          review_destination_count: number | null
          submission_instruction_text: string | null
          submission_package_status: string | null
          submission_prep_notes: string | null
          submission_state: string | null
          title: string | null
          upload_instruction_text: string | null
          upload_state: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_destination_selections_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_destination_summary_view: {
        Row: {
          asset_requirement_rows: number | null
          created_at: string | null
          creator_goal: string | null
          creator_notes: string | null
          decision_received_at: string | null
          destination_category: string | null
          destination_id: number | null
          destination_name: string | null
          destination_slug: string | null
          field_mapping_rows: number | null
          guidance_reviewed: boolean | null
          has_minimum_submission_structure: boolean | null
          internal_notes: string | null
          is_alleystreet: boolean | null
          is_primary_destination: boolean | null
          next_destination_action: string | null
          planned_submission_at: string | null
          priority_order: number | null
          project_destination_selection_id: number | null
          project_id: number | null
          readiness_gap_summary: string | null
          ready_to_submit: boolean | null
          release_strategy: string | null
          required_asset_keys: string | null
          required_asset_rows: number | null
          required_assets_complete: boolean | null
          required_field_keys: string | null
          required_field_rows: number | null
          required_fields_complete: boolean | null
          rights_confirmed: boolean | null
          selection_status: string | null
          submission_package_status: string | null
          submitted_at: string | null
          target_release_at: string | null
          title: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_destination_selections_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "distribution_destination_summary_view"
            referencedColumns: ["destination_id"]
          },
          {
            foreignKeyName: "project_destination_selections_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "distribution_destinations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_destination_selections_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_directory_public: {
        Row: {
          business_name: string | null
          city: string | null
          country: string | null
          description: string | null
          id: string | null
          is_verified: boolean | null
          provider_type: string | null
          slug: string | null
          state: string | null
          website: string | null
          zone_name: string | null
        }
        Insert: {
          business_name?: string | null
          city?: string | null
          country?: string | null
          description?: string | null
          id?: string | null
          is_verified?: boolean | null
          provider_type?: string | null
          slug?: string | null
          state?: string | null
          website?: string | null
          zone_name?: string | null
        }
        Update: {
          business_name?: string | null
          city?: string | null
          country?: string | null
          description?: string | null
          id?: string | null
          is_verified?: boolean | null
          provider_type?: string | null
          slug?: string | null
          state?: string | null
          website?: string | null
          zone_name?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      knowledge_level_enum: "hobbyist" | "student" | "professional"
      user_role_enum:
        | "filmmaker"
        | "host"
        | "vendor"
        | "crew"
        | "talent"
        | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      knowledge_level_enum: ["hobbyist", "student", "professional"],
      user_role_enum: [
        "filmmaker",
        "host",
        "vendor",
        "crew",
        "talent",
        "admin",
      ],
    },
  },
} as const
