export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type Timestamp = string;

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          company_name: string | null;
          phone: string | null;
          created_at: Timestamp;
          updated_at: Timestamp;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          company_name?: string | null;
          phone?: string | null;
          created_at?: Timestamp;
          updated_at?: Timestamp;
        };
        Update: {
          email?: string | null;
          full_name?: string | null;
          company_name?: string | null;
          phone?: string | null;
          updated_at?: Timestamp;
        };
      };
      user_roles: {
        Row: {
          id: string;
          user_id: string;
          role: "admin" | "client";
          created_at: Timestamp;
        };
        Insert: {
          id?: string;
          user_id: string;
          role: "admin" | "client";
          created_at?: Timestamp;
        };
        Update: {
          role?: "admin" | "client";
        };
      };
      plans: {
        Row: {
          id: string;
          slug: string;
          name: string;
          category: "project" | "retainer";
          billing_type: "one_time" | "subscription" | "quote_only";
          price_min: number;
          price_max: number;
          currency: string;
          description: string | null;
          features: Json;
          is_popular: boolean;
          active: boolean;
          stripe_price_id: string | null;
          stripe_product_id: string | null;
          created_at: Timestamp;
          updated_at: Timestamp;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          category: "project" | "retainer";
          billing_type: "one_time" | "subscription" | "quote_only";
          price_min: number;
          price_max?: number;
          currency?: string;
          description?: string | null;
          features?: Json;
          is_popular?: boolean;
          active?: boolean;
          stripe_price_id?: string | null;
          stripe_product_id?: string | null;
          created_at?: Timestamp;
          updated_at?: Timestamp;
        };
        Update: {
          slug?: string;
          name?: string;
          category?: "project" | "retainer";
          billing_type?: "one_time" | "subscription" | "quote_only";
          price_min?: number;
          price_max?: number;
          currency?: string;
          description?: string | null;
          features?: Json;
          is_popular?: boolean;
          active?: boolean;
          stripe_price_id?: string | null;
          stripe_product_id?: string | null;
          updated_at?: Timestamp;
        };
      };
      addons: {
        Row: {
          id: string;
          slug: string;
          name: string;
          billing_type: "one_time" | "subscription";
          price_min: number;
          price_max: number;
          currency: string;
          description: string | null;
          active: boolean;
          stripe_price_id: string | null;
          stripe_product_id: string | null;
          created_at: Timestamp;
          updated_at: Timestamp;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          billing_type: "one_time" | "subscription";
          price_min: number;
          price_max: number;
          currency?: string;
          description?: string | null;
          active?: boolean;
          stripe_price_id?: string | null;
          stripe_product_id?: string | null;
          created_at?: Timestamp;
          updated_at?: Timestamp;
        };
        Update: {
          slug?: string;
          name?: string;
          billing_type?: "one_time" | "subscription";
          price_min?: number;
          price_max?: number;
          currency?: string;
          description?: string | null;
          active?: boolean;
          stripe_price_id?: string | null;
          stripe_product_id?: string | null;
          updated_at?: Timestamp;
        };
      };
      projects: {
        Row: {
          id: string;
          client_id: string;
          plan_id: string | null;
          name: string;
          status: "draft" | "active" | "in_review" | "completed" | "paused";
          start_date: string | null;
          due_date: string | null;
          timeline: Json;
          total_price: number | null;
          expiration_date: string | null;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          created_at: Timestamp;
          updated_at: Timestamp;
        };
        Insert: {
          id?: string;
          client_id: string;
          plan_id?: string | null;
          name: string;
          status?: "draft" | "active" | "in_review" | "completed" | "paused";
          start_date?: string | null;
          due_date?: string | null;
          timeline?: Json;
          total_price?: number | null;
          expiration_date?: string | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          created_at?: Timestamp;
          updated_at?: Timestamp;
        };
        Update: {
          plan_id?: string | null;
          name?: string;
          status?: "draft" | "active" | "in_review" | "completed" | "paused";
          start_date?: string | null;
          due_date?: string | null;
          timeline?: Json;
          total_price?: number | null;
          expiration_date?: string | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          updated_at?: Timestamp;
        };
      };
      entitlements: {
        Row: {
          id: string;
          project_id: string;
          addon_id: string | null;
          type: "one_time" | "subscription";
          status: "active" | "expired" | "canceled";
          starts_at: string;
          expires_at: string | null;
          created_at: Timestamp;
        };
        Insert: {
          id?: string;
          project_id: string;
          addon_id?: string | null;
          type: "one_time" | "subscription";
          status?: "active" | "expired" | "canceled";
          starts_at?: string;
          expires_at?: string | null;
          created_at?: Timestamp;
        };
        Update: {
          status?: "active" | "expired" | "canceled";
          expires_at?: string | null;
        };
      };
      tickets: {
        Row: {
          id: string;
          project_id: string;
          client_id: string;
          type: "bug" | "change_request" | "question" | "addon_request";
          status: "open" | "in_progress" | "resolved" | "closed";
          priority: "low" | "medium" | "high";
          subject: string;
          description: string;
          created_at: Timestamp;
          updated_at: Timestamp;
        };
        Insert: {
          id?: string;
          project_id: string;
          client_id: string;
          type: "bug" | "change_request" | "question" | "addon_request";
          status?: "open" | "in_progress" | "resolved" | "closed";
          priority?: "low" | "medium" | "high";
          subject: string;
          description: string;
          created_at?: Timestamp;
          updated_at?: Timestamp;
        };
        Update: {
          status?: "open" | "in_progress" | "resolved" | "closed";
          priority?: "low" | "medium" | "high";
          subject?: string;
          description?: string;
          updated_at?: Timestamp;
        };
      };
      messages: {
        Row: {
          id: string;
          ticket_id: string | null;
          project_id: string | null;
          sender_id: string;
          recipient_id: string | null;
          body: string;
          is_admin_message: boolean;
          created_at: Timestamp;
        };
        Insert: {
          id?: string;
          ticket_id?: string | null;
          project_id?: string | null;
          sender_id: string;
          recipient_id?: string | null;
          body: string;
          is_admin_message?: boolean;
          created_at?: Timestamp;
        };
        Update: {
          body?: string;
        };
      };
      files: {
        Row: {
          id: string;
          project_id: string | null;
          ticket_id: string | null;
          owner_id: string;
          bucket: string;
          path: string;
          mime_type: string | null;
          file_size: number | null;
          created_at: Timestamp;
        };
        Insert: {
          id?: string;
          project_id?: string | null;
          ticket_id?: string | null;
          owner_id: string;
          bucket: string;
          path: string;
          mime_type?: string | null;
          file_size?: number | null;
          created_at?: Timestamp;
        };
        Update: {
          path?: string;
          mime_type?: string | null;
          file_size?: number | null;
        };
      };
      quote_requests: {
        Row: {
          id: string;
          budget: number;
          industry: string;
          needs: string[];
          business_name: string;
          email: string;
          phone: string;
          notes: string | null;
          status: "new" | "qualified" | "quoted" | "archived";
          created_at: Timestamp;
        };
        Insert: {
          id?: string;
          budget: number;
          industry: string;
          needs: string[];
          business_name: string;
          email: string;
          phone: string;
          notes?: string | null;
          status?: "new" | "qualified" | "quoted" | "archived";
          created_at?: Timestamp;
        };
        Update: {
          status?: "new" | "qualified" | "quoted" | "archived";
        };
      };
      quotes: {
        Row: {
          id: string;
          quote_request_id: string | null;
          client_id: string | null;
          plan_id: string | null;
          status: "draft" | "sent" | "accepted" | "rejected" | "expired";
          recommended_plan: string;
          timeline: string;
          addons: Json;
          subtotal: number;
          addons_total: number;
          total: number;
          deposit_required: number;
          currency: string;
          expires_at: string | null;
          payment_unlocked: boolean;
          created_at: Timestamp;
          updated_at: Timestamp;
        };
        Insert: {
          id?: string;
          quote_request_id?: string | null;
          client_id?: string | null;
          plan_id?: string | null;
          status?: "draft" | "sent" | "accepted" | "rejected" | "expired";
          recommended_plan: string;
          timeline: string;
          addons?: Json;
          subtotal: number;
          addons_total?: number;
          total: number;
          deposit_required: number;
          currency?: string;
          expires_at?: string | null;
          payment_unlocked?: boolean;
          created_at?: Timestamp;
          updated_at?: Timestamp;
        };
        Update: {
          status?: "draft" | "sent" | "accepted" | "rejected" | "expired";
          recommended_plan?: string;
          timeline?: string;
          addons?: Json;
          subtotal?: number;
          addons_total?: number;
          total?: number;
          deposit_required?: number;
          payment_unlocked?: boolean;
          expires_at?: string | null;
          updated_at?: Timestamp;
        };
      };
      quote_documents: {
        Row: {
          id: string;
          quote_id: string;
          storage_path: string;
          public_url: string | null;
          version: number;
          created_at: Timestamp;
        };
        Insert: {
          id?: string;
          quote_id: string;
          storage_path: string;
          public_url?: string | null;
          version?: number;
          created_at?: Timestamp;
        };
        Update: {
          public_url?: string | null;
          version?: number;
        };
      };
      quote_acceptances: {
        Row: {
          id: string;
          quote_id: string;
          typed_name: string;
          accepted_at: Timestamp;
          ip_address: string | null;
          user_agent: string | null;
          created_at: Timestamp;
        };
        Insert: {
          id?: string;
          quote_id: string;
          typed_name: string;
          accepted_at?: Timestamp;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: Timestamp;
        };
        Update: never;
      };
      addon_requests: {
        Row: {
          id: string;
          project_id: string;
          client_id: string;
          addon_id: string;
          notes: string | null;
          status: "pending" | "approved" | "rejected" | "in_progress";
          created_at: Timestamp;
          updated_at: Timestamp;
        };
        Insert: {
          id?: string;
          project_id: string;
          client_id: string;
          addon_id: string;
          notes?: string | null;
          status?: "pending" | "approved" | "rejected" | "in_progress";
          created_at?: Timestamp;
          updated_at?: Timestamp;
        };
        Update: {
          notes?: string | null;
          status?: "pending" | "approved" | "rejected" | "in_progress";
          updated_at?: Timestamp;
        };
      };
      admin_audit_log: {
        Row: {
          id: string;
          admin_id: string;
          action: string;
          entity_type: string;
          entity_id: string | null;
          metadata: Json;
          created_at: Timestamp;
        };
        Insert: {
          id?: string;
          admin_id: string;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          metadata?: Json;
          created_at?: Timestamp;
        };
        Update: never;
      };
      leads: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          phone: string | null;
          source: string;
          notes: string | null;
          status: "new" | "contacted" | "qualified" | "won" | "lost";
          created_at: Timestamp;
        };
        Insert: {
          id?: string;
          full_name: string;
          email: string;
          phone?: string | null;
          source?: string;
          notes?: string | null;
          status?: "new" | "contacted" | "qualified" | "won" | "lost";
          created_at?: Timestamp;
        };
        Update: {
          status?: "new" | "contacted" | "qualified" | "won" | "lost";
          notes?: string | null;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
