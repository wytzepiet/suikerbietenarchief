export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      locations: {
        Row: {
          created_at: string
          description: string | null
          id: number
          lat: number
          lng: number
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          lat: number
          lng: number
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          lat?: number
          lng?: number
          name?: string
        }
        Relationships: []
      }
      uploads: {
        Row: {
          created_at: string
          description: string | null
          generate_description: boolean | null
          id: number
          prompt_hint: string | null
          title: string | null
          upload_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          generate_description?: boolean | null
          id?: number
          prompt_hint?: string | null
          title?: string | null
          upload_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          generate_description?: boolean | null
          id?: number
          prompt_hint?: string | null
          title?: string | null
          upload_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      videos: {
        Row: {
          aspect_ratio: string | null
          asset_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          duration: number | null
          edited_at: string | null
          edited_by: string | null
          generate_description: boolean | null
          id: number
          keywords: string[]
          locations: number[] | null
          playback_id: string | null
          prompt_hint: string | null
          status: string | null
          title: string | null
          transcript_id: string | null
          upload: number | null
        }
        Insert: {
          aspect_ratio?: string | null
          asset_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration?: number | null
          edited_at?: string | null
          edited_by?: string | null
          generate_description?: boolean | null
          id?: number
          keywords?: string[]
          locations?: number[] | null
          playback_id?: string | null
          prompt_hint?: string | null
          status?: string | null
          title?: string | null
          transcript_id?: string | null
          upload?: number | null
        }
        Update: {
          aspect_ratio?: string | null
          asset_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration?: number | null
          edited_at?: string | null
          edited_by?: string | null
          generate_description?: boolean | null
          id?: number
          keywords?: string[]
          locations?: number[] | null
          playback_id?: string | null
          prompt_hint?: string | null
          status?: string | null
          title?: string | null
          transcript_id?: string | null
          upload?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "videos_upload_fkey"
            columns: ["upload"]
            isOneToOne: false
            referencedRelation: "uploads"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
