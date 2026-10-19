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
      accounts: {
        Row: {
          category: string
          code: string
          created_at: string | null
          id: string
          is_active: boolean
          is_system: boolean
          name: string
          normal_balance: string
          parent_id: string | null
        }
        Insert: {
          category: string
          code: string
          created_at?: string | null
          id?: string
          is_active?: boolean
          is_system?: boolean
          name: string
          normal_balance: string
          parent_id?: string | null
        }
        Update: {
          category?: string
          code?: string
          created_at?: string | null
          id?: string
          is_active?: boolean
          is_system?: boolean
          name?: string
          normal_balance?: string
          parent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accounts_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      applicants: {
        Row: {
          address: string | null
          birth_date: string | null
          birth_place: string | null
          converted_to_personnel_id: string | null
          created_at: string | null
          email: string | null
          full_name: string
          gada_level: string | null
          gender: string | null
          id: string
          nik: string
          notes: string | null
          phone: string
          score: number | null
          status: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          birth_date?: string | null
          birth_place?: string | null
          converted_to_personnel_id?: string | null
          created_at?: string | null
          email?: string | null
          full_name: string
          gada_level?: string | null
          gender?: string | null
          id?: string
          nik: string
          notes?: string | null
          phone: string
          score?: number | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          birth_date?: string | null
          birth_place?: string | null
          converted_to_personnel_id?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string
          gada_level?: string | null
          gender?: string | null
          id?: string
          nik?: string
          notes?: string | null
          phone?: string
          score?: number | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "applicants_converted_to_personnel_id_fkey"
            columns: ["converted_to_personnel_id"]
            isOneToOne: false
            referencedRelation: "personnel"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applicants_converted_to_personnel_id_fkey"
            columns: ["converted_to_personnel_id"]
            isOneToOne: false
            referencedRelation: "security_personnel"
            referencedColumns: ["id"]
          },
        ]
      }
      bko_requests: {
        Row: {
          approved_by: string | null
          created_at: string | null
          end_date: string
          id: string
          origin_site_id: string
          personnel_id: string
          reason: string
          start_date: string
          status: string
          target_site_id: string
          updated_at: string | null
        }
        Insert: {
          approved_by?: string | null
          created_at?: string | null
          end_date: string
          id?: string
          origin_site_id: string
          personnel_id: string
          reason: string
          start_date: string
          status?: string
          target_site_id: string
          updated_at?: string | null
        }
        Update: {
          approved_by?: string | null
          created_at?: string | null
          end_date?: string
          id?: string
          origin_site_id?: string
          personnel_id?: string
          reason?: string
          start_date?: string
          status?: string
          target_site_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bko_requests_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bko_requests_origin_site_id_fkey"
            columns: ["origin_site_id"]
            isOneToOne: false
            referencedRelation: "client_sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bko_requests_origin_site_id_fkey"
            columns: ["origin_site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bko_requests_personnel_id_fkey"
            columns: ["personnel_id"]
            isOneToOne: false
            referencedRelation: "personnel"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bko_requests_personnel_id_fkey"
            columns: ["personnel_id"]
            isOneToOne: false
            referencedRelation: "security_personnel"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bko_requests_target_site_id_fkey"
            columns: ["target_site_id"]
            isOneToOne: false
            referencedRelation: "client_sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bko_requests_target_site_id_fkey"
            columns: ["target_site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      checkpoints: {
        Row: {
          code: string
          created_at: string | null
          id: string
          name: string
          patrol_order: number
          qr_code_hash: string
          site_id: string
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          name: string
          patrol_order?: number
          qr_code_hash: string
          site_id: string
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          name?: string
          patrol_order?: number
          qr_code_hash?: string
          site_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "checkpoints_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "client_sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkpoints_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          billing_address: string
          code: string
          company_name: string
          contract_end_date: string
          created_at: string | null
          id: string
          npwp: string | null
          pic_email: string | null
          pic_name: string
          pic_phone: string
          status: string
          updated_at: string | null
        }
        Insert: {
          billing_address: string
          code: string
          company_name: string
          contract_end_date: string
          created_at?: string | null
          id?: string
          npwp?: string | null
          pic_email?: string | null
          pic_name: string
          pic_phone: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          billing_address?: string
          code?: string
          company_name?: string
          contract_end_date?: string
          created_at?: string | null
          id?: string
          npwp?: string | null
          pic_email?: string | null
          pic_name?: string
          pic_phone?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      distribution_lines: {
        Row: {
          distribution_id: string
          id: string
          item_id: string
          quantity: number
          unit_cost: number
        }
        Insert: {
          distribution_id: string
          id?: string
          item_id: string
          quantity: number
          unit_cost?: number
        }
        Update: {
          distribution_id?: string
          id?: string
          item_id?: string
          quantity?: number
          unit_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "distribution_lines_distribution_id_fkey"
            columns: ["distribution_id"]
            isOneToOne: false
            referencedRelation: "distributions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "distribution_lines_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      distributions: {
        Row: {
          created_at: string | null
          distribution_date: string
          distribution_number: string
          id: string
          notes: string | null
          personnel_id: string | null
          recipient_name: string
          site_id: string | null
          target_type: string
        }
        Insert: {
          created_at?: string | null
          distribution_date: string
          distribution_number: string
          id?: string
          notes?: string | null
          personnel_id?: string | null
          recipient_name: string
          site_id?: string | null
          target_type: string
        }
        Update: {
          created_at?: string | null
          distribution_date?: string
          distribution_number?: string
          id?: string
          notes?: string | null
          personnel_id?: string | null
          recipient_name?: string
          site_id?: string | null
          target_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "distributions_personnel_id_fkey"
            columns: ["personnel_id"]
            isOneToOne: false
            referencedRelation: "personnel"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "distributions_personnel_id_fkey"
            columns: ["personnel_id"]
            isOneToOne: false
            referencedRelation: "security_personnel"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "distributions_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "client_sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "distributions_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      institution_settings: {
        Row: {
          address: string
          bpjs_kesehatan_rate: number
          bpjs_ketenagakerjaan_rate: number
          company_name: string
          created_at: string | null
          email: string
          id: string
          license_number: string
          logo_url: string | null
          npwp: string
          phone: string
          pph23_rate: number
          ppn_rate: number
          updated_at: string | null
        }
        Insert: {
          address: string
          bpjs_kesehatan_rate?: number
          bpjs_ketenagakerjaan_rate?: number
          company_name: string
          created_at?: string | null
          email: string
          id?: string
          license_number: string
          logo_url?: string | null
          npwp: string
          phone: string
          pph23_rate?: number
          ppn_rate?: number
          updated_at?: string | null
        }
        Update: {
          address?: string
          bpjs_kesehatan_rate?: number
          bpjs_ketenagakerjaan_rate?: number
          company_name?: string
          created_at?: string | null
          email?: string
          id?: string
          license_number?: string
          logo_url?: string | null
          npwp?: string
          phone?: string
          pph23_rate?: number
          ppn_rate?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      invoice_lines: {
        Row: {
          id: string
          invoice_id: string
          line_total: number
          personnel_count: number
          rate_per_personnel: number
          site_id: string
        }
        Insert: {
          id?: string
          invoice_id: string
          line_total: number
          personnel_count: number
          rate_per_personnel: number
          site_id: string
        }
        Update: {
          id?: string
          invoice_id?: string
          line_total?: number
          personnel_count?: number
          rate_per_personnel?: number
          site_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoice_lines_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_lines_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "client_sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_lines_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          client_id: string
          created_at: string | null
          due_date: string
          id: string
          invoice_number: string
          journal_entry_id: string | null
          period_month: string
          pph23_amount: number
          ppn_amount: number
          ppn_rate: number
          status: string
          subtotal: number
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          due_date: string
          id?: string
          invoice_number: string
          journal_entry_id?: string | null
          period_month: string
          pph23_amount?: number
          ppn_amount?: number
          ppn_rate?: number
          status?: string
          subtotal?: number
          total_amount?: number
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          due_date?: string
          id?: string
          invoice_number?: string
          journal_entry_id?: string | null
          period_month?: string
          pph23_amount?: number
          ppn_amount?: number
          ppn_rate?: number
          status?: string
          subtotal?: number
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "finance_journals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      items: {
        Row: {
          category: string
          code: string
          created_at: string | null
          current_stock: number
          id: string
          initial_stock: number
          minimum_stock: number
          name: string
          notes: string | null
          size: string | null
          unit: string
          unit_price: number
          updated_at: string | null
        }
        Insert: {
          category: string
          code: string
          created_at?: string | null
          current_stock?: number
          id?: string
          initial_stock?: number
          minimum_stock?: number
          name: string
          notes?: string | null
          size?: string | null
          unit: string
          unit_price?: number
          updated_at?: string | null
        }
        Update: {
          category?: string
          code?: string
          created_at?: string | null
          current_stock?: number
          id?: string
          initial_stock?: number
          minimum_stock?: number
          name?: string
          notes?: string | null
          size?: string | null
          unit?: string
          unit_price?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      journal_entries: {
        Row: {
          created_at: string | null
          description: string
          entry_date: string
          entry_number: string
          id: string
          site_id: string | null
          source_id: string | null
          source_type: string
          status: string
        }
        Insert: {
          created_at?: string | null
          description: string
          entry_date: string
          entry_number: string
          id?: string
          site_id?: string | null
          source_id?: string | null
          source_type: string
          status?: string
        }
        Update: {
          created_at?: string | null
          description?: string
          entry_date?: string
          entry_number?: string
          id?: string
          site_id?: string | null
          source_id?: string | null
          source_type?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "journal_entries_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "client_sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_entries_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_lines: {
        Row: {
          account_id: string
          credit: number
          debit: number
          id: string
          journal_entry_id: string
          memo: string | null
        }
        Insert: {
          account_id: string
          credit?: number
          debit?: number
          id?: string
          journal_entry_id: string
          memo?: string | null
        }
        Update: {
          account_id?: string
          credit?: number
          debit?: number
          id?: string
          journal_entry_id?: string
          memo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "journal_lines_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_lines_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "finance_journals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_lines_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      org_units: {
        Row: {
          code: string
          created_at: string | null
          id: string
          leader_name: string | null
          level: number
          name: string
          parent_id: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          leader_name?: string | null
          level?: number
          name: string
          parent_id?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          leader_name?: string | null
          level?: number
          name?: string
          parent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "org_units_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "org_units"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll_runs: {
        Row: {
          created_at: string | null
          id: string
          journal_entry_id: string | null
          net_payroll_amount: number
          period_month: string
          run_date: string
          status: string
          total_allowances: number
          total_basic_salary: number
          total_deductions: number
          total_overtime: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          journal_entry_id?: string | null
          net_payroll_amount?: number
          period_month: string
          run_date: string
          status?: string
          total_allowances?: number
          total_basic_salary?: number
          total_deductions?: number
          total_overtime?: number
        }
        Update: {
          created_at?: string | null
          id?: string
          journal_entry_id?: string | null
          net_payroll_amount?: number
          period_month?: string
          run_date?: string
          status?: string
          total_allowances?: number
          total_basic_salary?: number
          total_deductions?: number
          total_overtime?: number
        }
        Relationships: [
          {
            foreignKeyName: "payroll_runs_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "finance_journals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_runs_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      payslips: {
        Row: {
          allowance_position: number | null
          basic_salary: number
          bpjs_kesehatan: number | null
          bpjs_ketenagakerjaan: number | null
          id: string
          net_salary: number
          overtime_amount: number | null
          payroll_run_id: string
          personnel_id: string
          pph21_amount: number | null
          site_id: string | null
          uniform_deduction: number | null
        }
        Insert: {
          allowance_position?: number | null
          basic_salary: number
          bpjs_kesehatan?: number | null
          bpjs_ketenagakerjaan?: number | null
          id?: string
          net_salary: number
          overtime_amount?: number | null
          payroll_run_id: string
          personnel_id: string
          pph21_amount?: number | null
          site_id?: string | null
          uniform_deduction?: number | null
        }
        Update: {
          allowance_position?: number | null
          basic_salary?: number
          bpjs_kesehatan?: number | null
          bpjs_ketenagakerjaan?: number | null
          id?: string
          net_salary?: number
          overtime_amount?: number | null
          payroll_run_id?: string
          personnel_id?: string
          pph21_amount?: number | null
          site_id?: string | null
          uniform_deduction?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "payslips_payroll_run_id_fkey"
            columns: ["payroll_run_id"]
            isOneToOne: false
            referencedRelation: "payroll_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payslips_personnel_id_fkey"
            columns: ["personnel_id"]
            isOneToOne: false
            referencedRelation: "personnel"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payslips_personnel_id_fkey"
            columns: ["personnel_id"]
            isOneToOne: false
            referencedRelation: "security_personnel"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payslips_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "client_sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payslips_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      personnel: {
        Row: {
          address: string | null
          bank_account_number: string | null
          bank_name: string | null
          birth_date: string | null
          birth_place: string | null
          created_at: string | null
          current_site_id: string | null
          email: string | null
          full_name: string
          gada_certificate_number: string | null
          gada_level: string | null
          gender: string | null
          id: string
          join_date: string
          kta_expiry_date: string | null
          kta_number: string | null
          nik: string
          phone: string
          photo_url: string | null
          position: string
          status: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
          birth_date?: string | null
          birth_place?: string | null
          created_at?: string | null
          current_site_id?: string | null
          email?: string | null
          full_name: string
          gada_certificate_number?: string | null
          gada_level?: string | null
          gender?: string | null
          id?: string
          join_date: string
          kta_expiry_date?: string | null
          kta_number?: string | null
          nik: string
          phone: string
          photo_url?: string | null
          position?: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
          birth_date?: string | null
          birth_place?: string | null
          created_at?: string | null
          current_site_id?: string | null
          email?: string | null
          full_name?: string
          gada_certificate_number?: string | null
          gada_level?: string | null
          gender?: string | null
          id?: string
          join_date?: string
          kta_expiry_date?: string | null
          kta_number?: string | null
          nik?: string
          phone?: string
          photo_url?: string | null
          position?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "personnel_current_site_id_fkey"
            columns: ["current_site_id"]
            isOneToOne: false
            referencedRelation: "client_sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personnel_current_site_id_fkey"
            columns: ["current_site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          full_name: string
          id: string
          is_active: boolean
          role_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name: string
          id: string
          is_active?: boolean
          role_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean
          role_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          can_manage: boolean
          can_view: boolean
          id: string
          module: string
          role_id: string
        }
        Insert: {
          can_manage?: boolean
          can_view?: boolean
          id?: string
          module: string
          role_id: string
        }
        Update: {
          can_manage?: boolean
          can_view?: boolean
          id?: string
          module?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_system: boolean | null
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_system?: boolean | null
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_system?: boolean | null
          name?: string
        }
        Relationships: []
      }
      roster_assignments: {
        Row: {
          created_at: string | null
          date: string
          id: string
          personnel_id: string
          shift_id: string | null
          site_id: string
          status: string
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          personnel_id: string
          shift_id?: string | null
          site_id: string
          status?: string
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          personnel_id?: string
          shift_id?: string | null
          site_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "roster_assignments_personnel_id_fkey"
            columns: ["personnel_id"]
            isOneToOne: false
            referencedRelation: "personnel"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roster_assignments_personnel_id_fkey"
            columns: ["personnel_id"]
            isOneToOne: false
            referencedRelation: "security_personnel"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roster_assignments_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "shifts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roster_assignments_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "client_sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roster_assignments_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      shifts: {
        Row: {
          end_time: string
          id: string
          name: string
          start_time: string
        }
        Insert: {
          end_time: string
          id?: string
          name: string
          start_time: string
        }
        Update: {
          end_time?: string
          id?: string
          name?: string
          start_time?: string
        }
        Relationships: []
      }
      sites: {
        Row: {
          address: string
          client_id: string
          code: string
          created_at: string | null
          id: string
          latitude: number | null
          longitude: number | null
          monthly_rate_per_personnel: number
          name: string
          required_personnel_per_shift: number
          status: string
          updated_at: string | null
        }
        Insert: {
          address: string
          client_id: string
          code: string
          created_at?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          monthly_rate_per_personnel: number
          name: string
          required_personnel_per_shift?: number
          status?: string
          updated_at?: string | null
        }
        Update: {
          address?: string
          client_id?: string
          code?: string
          created_at?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          monthly_rate_per_personnel?: number
          name?: string
          required_personnel_per_shift?: number
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sites_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_movements: {
        Row: {
          balance_after: number
          created_at: string | null
          id: string
          item_id: string
          movement_type: string
          notes: string | null
          quantity: number
          recipient_id: string | null
          recipient_type: string | null
          reference_number: string | null
        }
        Insert: {
          balance_after: number
          created_at?: string | null
          id?: string
          item_id: string
          movement_type: string
          notes?: string | null
          quantity: number
          recipient_id?: string | null
          recipient_type?: string | null
          reference_number?: string | null
        }
        Update: {
          balance_after?: number
          created_at?: string | null
          id?: string
          item_id?: string
          movement_type?: string
          notes?: string | null
          quantity?: number
          recipient_id?: string | null
          recipient_type?: string | null
          reference_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      client_sites: {
        Row: {
          address: string | null
          client_id: string | null
          code: string | null
          created_at: string | null
          id: string | null
          latitude: number | null
          longitude: number | null
          monthly_rate_per_personnel: number | null
          name: string | null
          required_personnel_per_shift: number | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          client_id?: string | null
          code?: string | null
          created_at?: string | null
          id?: string | null
          latitude?: number | null
          longitude?: number | null
          monthly_rate_per_personnel?: number | null
          name?: string | null
          required_personnel_per_shift?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          client_id?: string | null
          code?: string | null
          created_at?: string | null
          id?: string | null
          latitude?: number | null
          longitude?: number | null
          monthly_rate_per_personnel?: number | null
          name?: string | null
          required_personnel_per_shift?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sites_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      finance_journals: {
        Row: {
          created_at: string | null
          description: string | null
          entry_date: string | null
          entry_number: string | null
          id: string | null
          site_id: string | null
          source_id: string | null
          source_type: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          entry_date?: string | null
          entry_number?: string | null
          id?: string | null
          site_id?: string | null
          source_id?: string | null
          source_type?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          entry_date?: string | null
          entry_number?: string | null
          id?: string | null
          site_id?: string | null
          source_id?: string | null
          source_type?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "journal_entries_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "client_sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_entries_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      security_personnel: {
        Row: {
          address: string | null
          bank_account_number: string | null
          bank_name: string | null
          birth_date: string | null
          birth_place: string | null
          created_at: string | null
          current_site_id: string | null
          email: string | null
          full_name: string | null
          gada_certificate_number: string | null
          gada_level: string | null
          gender: string | null
          id: string | null
          join_date: string | null
          kta_expiry_date: string | null
          kta_number: string | null
          nik: string | null
          phone: string | null
          photo_url: string | null
          position: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
          birth_date?: string | null
          birth_place?: string | null
          created_at?: string | null
          current_site_id?: string | null
          email?: string | null
          full_name?: string | null
          gada_certificate_number?: string | null
          gada_level?: string | null
          gender?: string | null
          id?: string | null
          join_date?: string | null
          kta_expiry_date?: string | null
          kta_number?: string | null
          nik?: string | null
          phone?: string | null
          photo_url?: string | null
          position?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
          birth_date?: string | null
          birth_place?: string | null
          created_at?: string | null
          current_site_id?: string | null
          email?: string | null
          full_name?: string | null
          gada_certificate_number?: string | null
          gada_level?: string | null
          gender?: string | null
          id?: string | null
          join_date?: string | null
          kta_expiry_date?: string | null
          kta_number?: string | null
          nik?: string | null
          phone?: string | null
          photo_url?: string | null
          position?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "personnel_current_site_id_fkey"
            columns: ["current_site_id"]
            isOneToOne: false
            referencedRelation: "client_sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personnel_current_site_id_fkey"
            columns: ["current_site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      security_rosters: {
        Row: {
          created_at: string | null
          date: string | null
          id: string | null
          personnel_id: string | null
          shift_id: string | null
          site_id: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          date?: string | null
          id?: string | null
          personnel_id?: string | null
          shift_id?: string | null
          site_id?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string | null
          id?: string | null
          personnel_id?: string | null
          shift_id?: string | null
          site_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "roster_assignments_personnel_id_fkey"
            columns: ["personnel_id"]
            isOneToOne: false
            referencedRelation: "personnel"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roster_assignments_personnel_id_fkey"
            columns: ["personnel_id"]
            isOneToOne: false
            referencedRelation: "security_personnel"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roster_assignments_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "shifts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roster_assignments_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "client_sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roster_assignments_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      approve_bko_request: { Args: { p_request_id: string }; Returns: boolean }
      check_user_permission: {
        Args: { p_action: string; p_module: string }
        Returns: boolean
      }
      convert_applicant_to_personnel: {
        Args: { p_applicant_id: string; p_personnel_data: Json }
        Returns: string
      }
      post_invoice_to_journal: {
        Args: { p_invoice_id: string }
        Returns: string
      }
      post_payroll_to_journal: {
        Args: { p_payroll_run_id: string }
        Returns: string
      }
      process_distribution_with_journal: {
        Args: { p_distribution_id: string }
        Returns: string
      }
      validate_and_save_journal_entry: {
        Args: { p_header: Json; p_lines: Json }
        Returns: string
      }
    }
    Enums: {
      bko_status_enum: "pending" | "approved" | "rejected"
      gada_level_enum: "Pratama" | "Madya" | "Utama" | "Belum Ada"
      invoice_status_enum: "draft" | "issued" | "paid" | "cancelled"
      personnel_status_enum: "active" | "leave" | "inactive"
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
      bko_status_enum: ["pending", "approved", "rejected"],
      gada_level_enum: ["Pratama", "Madya", "Utama", "Belum Ada"],
      invoice_status_enum: ["draft", "issued", "paid", "cancelled"],
      personnel_status_enum: ["active", "leave", "inactive"],
    },
  },
} as const
