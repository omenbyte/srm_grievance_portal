import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { z } from "zod"

const updateStatusSchema = z.object({
  grievanceId: z.string().uuid(),
  status: z.enum(["In-Progress", "Completed", "Rejected"])
})

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          async get(name: string) {
            const cookie = await cookieStore.get(name)
            return cookie?.value
          },
          async set(name: string, value: string, options: CookieOptions) {
            await cookieStore.set({ name, value, ...options })
          },
          async remove(name: string, options: CookieOptions) {
            await cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )
    
    // Get URL parameters
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const pageSize = parseInt(searchParams.get("pageSize") || "10")
    const searchQuery = searchParams.get("search") || ""

    // Get grievance statistics
    const { data: stats, error: statsError } = await supabase
      .rpc("get_grievance_stats")

    if (statsError) throw statsError

    // Get paginated grievances
    const { data: grievances, error: grievancesError } = await supabase
      .rpc("get_paginated_grievances", {
        p_page_size: pageSize,
        p_page_number: page,
        p_search_query: searchQuery
      })

    if (grievancesError) throw grievancesError

    return NextResponse.json({
      stats,
      grievances
    })
  } catch (error) {
    console.error("Error in admin grievances route:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PATCH(req: Request) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          async get(name: string) {
            const cookie = await cookieStore.get(name)
            return cookie?.value
          },
          async set(name: string, value: string, options: CookieOptions) {
            await cookieStore.set({ name, value, ...options })
          },
          async remove(name: string, options: CookieOptions) {
            await cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )
    
    // Verify admin status
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Check if user's phone is in admin_phones table
    const { data: adminPhone } = await supabase
      .from("admin_phones")
      .select("phone")
      .eq("phone", session.user.phone)
      .single()

    if (!adminPhone) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      )
    }

    // Parse and validate request body
    const body = await req.json()
    const { grievanceId, status } = updateStatusSchema.parse(body)

    // Update grievance status
    const { data, error } = await supabase
      .rpc("update_grievance_status", {
        p_grievance_id: grievanceId,
        p_new_status: status
      })

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      )
    }

    console.error("Error updating grievance status:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 