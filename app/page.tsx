"use client";

import dynamic from "next/dynamic";

const DispatchShell = dynamic(
  () => import("@/components/layout/DispatchShell").then((m) => m.DispatchShell),
  { ssr: false }
);

export default function Home() {
  return <DispatchShell />;
}
