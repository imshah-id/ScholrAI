"use server";

import { getUniversities } from "@/lib/universities";

export async function fetchMoreUniversities(page: number, limit: number = 50) {
  return await getUniversities(page, limit);
}
