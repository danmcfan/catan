import { Landmark } from "lucide-solid";
import { Card } from "@/components/Card";
import { Panel } from "@/components/ui/Panel";

export function Bank() {
  return (
    <Panel class="gap-0.5">
      <Landmark class="mr-0.5 size-6 md:mr-1 md:size-10" stroke-width={1.75} />
      <Card type="lumber" />
      <Card type="brick" />
      <Card type="wool" />
      <Card type="grain" />
      <Card type="ore" />
      <Card type="development" />
    </Panel>
  );
}
