import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function POST(request: Request) {
  try {
    const { emails } = await request.json()

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json(
        { error: "Emails array is required" },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin.auth.admin.listUsers()

    if (error) {
      console.error("Error listing auth users:", error)
      return NextResponse.json(
        { error: "Failed to list auth users" },
        { status: 500 }
      )
    }

    const results: { email: string; success: boolean; error?: string }[] = []

    for (const email of emails) {
      const authUser = data?.users.find(
        u => u.email?.toLowerCase() === email.toLowerCase()
      )

      if (!authUser) {
        results.push({ email, success: false, error: "Auth user not found" })
        continue
      }

      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(authUser.id)

      if (deleteError) {
        console.error(`Error deleting auth user ${email}:`, deleteError)
        results.push({ email, success: false, error: deleteError.message })
      } else {
        results.push({ email, success: true })
      }
    }

    return NextResponse.json({ results })
  } catch (error) {
    console.error("Error in delete-user API:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
