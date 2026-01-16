import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const webhookUrl = process.env.MAKE_WEBHOOK_URL;

    if (!webhookUrl) {
      return NextResponse.json(
        { error: "MAKE_WEBHOOK_URL no definida" },
        { status: 500 }
      );
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    return NextResponse.json({
      ok: true,
      sentToMake: true,
      statusFromMake: response.status,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Error enviando a Make", details: String(error) },
      { status: 500 }
    );
  }
}
