import { NextResponse } from "next/server";

export async function POST() {
  const checks = [
    { label: "Leaf visible in frame", passed: true },
    { label: "Image sharpness", passed: true },
    { label: "Brightness", passed: true },
    { label: "Suitable crop image", passed: true },
  ];
  return NextResponse.json({ valid: true, checks, issue: null });
}
