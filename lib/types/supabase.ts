export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type IssueType = 'Classroom' | 'Hostel' | 'Academic' | 'Bus' | 'Facilities' | 'Others'
export type GrievanceStatus = 'Completed' | 'In-Progress' | 'Rejected'

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          phone: string
          first_name: string | null
          last_name: string | null
          reg_number: string
          email: string
          created_at: string
        }
        Insert: {
          id?: string
          phone: string
          first_name?: string | null
          last_name?: string | null
          reg_number: string
          email: string
          created_at?: string
        }
        Update: {
          id?: string
          phone?: string
          first_name?: string | null
          last_name?: string | null
          reg_number?: string
          email?: string
          created_at?: string
        }
      }
      grievances: {
        Row: {
          id: string
          user_id: string
          issue_type: IssueType
          sub_category: string
          message: string
          image_url: string | null
          submitted_at: string
          status: GrievanceStatus
        }
        Insert: {
          id?: string
          user_id: string
          issue_type: IssueType
          sub_category: string
          message: string
          image_url?: string | null
          submitted_at?: string
          status?: GrievanceStatus
        }
        Update: {
          id?: string
          user_id?: string
          issue_type?: IssueType
          sub_category?: string
          message?: string
          image_url?: string | null
          submitted_at?: string
          status?: GrievanceStatus
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      issue_type: IssueType
      grievance_status: GrievanceStatus
    }
  }
} 