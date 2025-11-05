import { Landmark } from "lucide-solid";
import { Card } from "@/components/Card";

export function Bank() {
  return (
    <div class="flex h-full w-full items-center justify-center gap-1 rounded-md border-2 border-black bg-linear-to-b from-zinc-200 to-zinc-300 shadow-md">
      <Landmark class="mr-1 size-6 md:mr-2 md:size-10" />
      <Card type="lumber" />
      <Card type="brick" />
      <Card type="wool" />
      <Card type="grain" />
      <Card type="ore" />
      <Card type="development" />
    </div>
  );
}
