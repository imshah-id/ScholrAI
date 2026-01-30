import { getUniversities } from "@/lib/universities";
import DiscoveryClient from "./DiscoveryClient";

export const dynamic = "force-dynamic";

export default async function DiscoveryPage() {
  const universities = await getUniversities(1, 50);

  return <DiscoveryClient initialUniversities={universities} />;
}
