import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateTicketNumber } from '@/lib/utils';
import { sendWhatsAppTemplateMessage } from '@/lib/whatsapp';
import { sendTelegramAdminNotification } from '@/lib/telegram';

// GET /api/submit-grievance?userId=UUID
// Returns whether the user can submit based on last submission (24h cooldown)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const supabase = await createClient();

    // Get latest grievance for user
    const { data: latest, error } = await supabase
      .from('grievances')
      .select('*')
      .eq('user_id', userId)
      .order('submitted_at', { ascending: false })
      .limit(1)
      .single();

    if (!latest || error?.code === 'PGRST116') {
      return NextResponse.json({ canSubmit: true, cooldownMessage: null });
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const lastDate = new Date(latest.submitted_at as string);
    const now = new Date();
    const hoursSince = (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60);

    if (hoursSince >= 24) {
      return NextResponse.json({ canSubmit: true, cooldownMessage: null });
    }

    const remaining = Math.ceil(24 - hoursSince);
    return NextResponse.json({
      canSubmit: false,
      cooldownMessage: `You can submit another grievance in ${remaining} hour(s)`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/submit-grievance
// Body: { userId, issueType, subCategory, locationDetails, message, imageUrl, userDetails: { firstName, lastName, email, registrationNo, mobile } }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userId,
      issueType,
      subCategory,
      locationDetails,
      message,
      imageUrl,
      userDetails,
    } = body;

    if (!userId || !issueType || !subCategory || !message || !userDetails?.mobile) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const supabase = await createClient();

    // On first submission, update user profile fields
    const updatePayload: Record<string, any> = {};
    if (userDetails.firstName) updatePayload.first_name = userDetails.firstName;
    if (userDetails.lastName) updatePayload.last_name = userDetails.lastName;
    if (userDetails.registrationNo) updatePayload.reg_number = userDetails.registrationNo;
    if (userDetails.email) updatePayload.email = userDetails.email;

    if (Object.keys(updatePayload).length > 0) {
      const { error: updateErr } = await supabase
        .from('users')
        .update(updatePayload)
        .eq('id', userId);
      if (updateErr) {
        return NextResponse.json({ message: `Failed to update user: ${updateErr.message}` }, { status: 500 });
      }
    }

    // Insert grievance
    const ticketNumber = generateTicketNumber();
    const grievanceInsert = {
      ticket_number: ticketNumber,
      user_id: userId,
      issue_type: issueType,
      sub_category: subCategory,
      location_details: locationDetails ?? null,
      message,
      image_url: imageUrl ?? null,
    } as any;

    const { data: grievance, error: insertErr } = await supabase
      .from('grievances')
      .insert(grievanceInsert)
      .select()
      .single();

    if (insertErr) {
      return NextResponse.json({ message: `Failed to submit grievance: ${insertErr.message}` }, { status: 500 });
    }

    // Send WhatsApp confirmation to the student
    const studentRecipient = `91${String(userDetails.mobile).replace(/\D/g, '').slice(-10)}`;
    await sendWhatsAppTemplateMessage(
      studentRecipient,
      'form_submission_confirmation',
      [ticketNumber]
    );

    // WhatsApp admin notifications temporarily disabled pending template approval
    // const { data: adminRows, error: adminErr } = await supabase
    //   .from('admin_phones')
    //   .select('phone');
    // if (!adminErr && adminRows && adminRows.length > 0) {
    //   const adminNumbers = adminRows
    //     .map(r => String(r.phone || ''))
    //     .filter(Boolean)
    //     .map(p => String(p).replace(/\D/g, '').replace(/^\+/, ''))
    //     .map(p => (p.startsWith('91') ? p : `91${p}`));
    //   const adminParams = [
    //     ticketNumber,
    //     `${userDetails.firstName} ${userDetails.lastName}`.trim(),
    //     studentRecipient,
    //     userDetails.registrationNo || '',
    //     `${issueType} / ${subCategory}`,
    //     locationDetails || '-',
    //     message,
    //     grievance.image_url || 'N/A',
    //   ];
    //   await Promise.all(
    //     adminNumbers.map((adminTo) =>
    //       sendWhatsAppTemplateMessage(adminTo, 'admin_grievance_details', adminParams)
    //     )
    //   );
    // }

    // Telegram admin notification (temporary while template is pending approval)
    try {
      await sendTelegramAdminNotification({
        ticketNumber,
        name: `${userDetails.firstName} ${userDetails.lastName}`.trim(),
        contact: studentRecipient,
        regNo: userDetails.registrationNo || '',
        category: `${issueType} / ${subCategory}`,
        location: locationDetails || '-',
        description: message,
        imageUrl: grievance.image_url || undefined,
      });
    } catch (tgErr: any) {
      console.error('Telegram admin notification failed:', tgErr?.message || tgErr)
    }

    return NextResponse.json({ grievance });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
} 
