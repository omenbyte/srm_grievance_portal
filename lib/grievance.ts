import { SupabaseClient } from "@supabase/supabase-js"

export async function getGrievanceCounts(supabase: SupabaseClient) {
  const { data: inProgress, error: inProgressError } = await supabase
    .from("grievances")
    .select("id", { count: "exact" })
    .eq("status", "in_progress")

  const { data: resolved, error: resolvedError } = await supabase
    .from("grievances")
    .select("id", { count: "exact" })
    .eq("status", "resolved")

  const { data: total, error: totalError } = await supabase
    .from("grievances")
    .select("id", { count: "exact" })

  if (inProgressError || resolvedError || totalError) {
    console.error("Error fetching grievance counts:", {
      inProgressError,
      resolvedError,
      totalError,
    })
    return {
      inProgress: 0,
      resolved: 0,
      total: 0,
    }
  }

  return {
    inProgress: inProgress?.length || 0,
    resolved: resolved?.length || 0,
    total: total?.length || 0,
  }
}

export function generateTicketNumber() {
  const prefix = "SG"
  const random = Math.floor(1000 + Math.random() * 9000) // 4-digit number
  return `${prefix}${random}`
} 