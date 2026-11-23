import { NextResponse } from "next/server";
export async function POST() {
  return NextResponse.json({ error: "Η METU είναι πλατφόρμα σύγκρισης τιμών. Οι αγορές και οι πληρωμές πραγματοποιούνται στο e-shop του καταστήματος." }, { status: 410 });
}