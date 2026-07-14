import { NextResponse } from "next/server";
import { getResend } from "@/lib/resend";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const name = String(formData.get("name") ?? "").trim();
    const location = String(formData.get("location") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const title = String(formData.get("title") ?? "").trim();
    const letter = String(formData.get("letter") ?? "").trim();
    const consent = String(formData.get("consent") ?? "").trim();

    if (!name || !location || !email || !title || !letter || consent !== "true") {
      return NextResponse.json(
        { message: "Please complete every required field before sending." },
        { status: 400 },
      );
    }

    const toEmail = process.env.SUBMISSION_TO_EMAIL;
    const fromEmail = process.env.RESEND_FROM_EMAIL;

    if (!toEmail || !fromEmail) {
      return NextResponse.json(
        {
          message:
            "Email delivery is not configured yet. Add RESEND_FROM_EMAIL and SUBMISSION_TO_EMAIL to enable submissions.",
        },
        { status: 500 },
      );
    }

    const resend = getResend();

    await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      replyTo: email,
      subject: `Lebanese Academic submission / ${title}`,
      text: [
        `Name: ${name}`,
        `Location: ${location}`,
        `Email: ${email}`,
        "",
        `Title: ${title}`,
        "",
        letter,
      ].join("\n"),
    });

    return NextResponse.json({
      message: "Your submission has been sent. Thank you for writing carefully.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Something went wrong while sending the submission.",
      },
      { status: 500 },
    );
  }
}
