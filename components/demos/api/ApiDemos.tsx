"use client";

import { useMemo, useState } from "react";
import { SimulationPlayer } from "@/components/player/SimulationPlayer";
import { ApiViz } from "@/components/viz/ProcessViz";
import { Segmented } from "@/components/viz/primitives";
import type { CodeFile } from "@/lib/sim";
import { simulateExec } from "@/sims/api/exec";
import { simulateFork } from "@/sims/api/fork";
import { simulateRedirect } from "@/sims/api/redirect";

function WhoFirst({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <Segmented
      label="Runs first"
      value={value ? "child" : "parent"}
      onChange={(v) => onChange(v === "child")}
      options={[
        { value: "parent", label: "Parent" },
        { value: "child", label: "Child" },
      ]}
    />
  );
}

export function ForkDemo({ files }: { files: CodeFile[] }) {
  const [childFirst, setChildFirst] = useState(false);
  const steps = useMemo(() => simulateFork({ wait: false, childFirst }), [childFirst]);
  return (
    <SimulationPlayer title="fork(): one process becomes two" subtitle="P and C in the gutter show where each process is" files={files} steps={steps} controls={<WhoFirst value={childFirst} onChange={setChildFirst} />}>
      {(s) => <ApiViz s={s} />}
    </SimulationPlayer>
  );
}

export function WaitDemo({ files }: { files: CodeFile[] }) {
  const [childFirst, setChildFirst] = useState(false);
  const steps = useMemo(() => simulateFork({ wait: true, childFirst }), [childFirst]);
  return (
    <SimulationPlayer title="wait(): the parent waits its turn" subtitle="Same output whichever process runs first" files={files} steps={steps} controls={<WhoFirst value={childFirst} onChange={setChildFirst} />}>
      {(s) => <ApiViz s={s} />}
    </SimulationPlayer>
  );
}

export function ExecDemo({ files }: { files: CodeFile[] }) {
  const steps = useMemo(() => simulateExec(), []);
  return (
    <SimulationPlayer title="exec(): same process, new program" subtitle="The child turns into wc" files={files} steps={steps}>
      {(s) => <ApiViz s={s} />}
    </SimulationPlayer>
  );
}

export function RedirectDemo({ files }: { files: CodeFile[] }) {
  const steps = useMemo(() => simulateRedirect(), []);
  return (
    <SimulationPlayer title="How the shell does  >  redirection" subtitle="close(1) + open() between fork and exec" files={files} steps={steps}>
      {(s) => <ApiViz s={s} showFds />}
    </SimulationPlayer>
  );
}
