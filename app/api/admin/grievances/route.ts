import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { z } from "zod"

const updateStatusSchema = z.object({
  grievanceId: z.string().uuid(),
  status: z.enum(["pending", "in-progress", "completed"])
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

    if (statsError) {
      console.error("Error fetching stats:", statsError)
      throw new Error("Failed to fetch grievance statistics")
    }

    // Get paginated grievances
    const { data: grievances, error: grievancesError } = await supabase
      .rpc("get_paginated_grievances", {
        p_page_size: pageSize,
        p_page_number: page,
        p_search_query: searchQuery
      })

    if (grievancesError) {
      console.error("Error fetching grievances:", grievancesError)
      throw new Error("Failed to fetch grievances")
    }

    return NextResponse.json({
      stats,
      grievances: grievances || []
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

    if (error) {
      console.error("Error updating grievance status:", error)
      throw new Error("Failed to update grievance status")
    }

    if (!data) {
      return NextResponse.json(
        { error: "Grievance not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating grievance status:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 