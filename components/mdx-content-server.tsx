"use client";
import * as React from "react";
import { getMDXComponent } from "next-contentlayer/hooks";

export type MDXContentServerProps = {
  code: string;
  // Optionally pass custom MDX components mapping
  components?: Record<string, React.ComponentType<unknown>>;
};

export function MDXContentServer({ code, components }: MDXContentServerProps) {
  const Component = React.useMemo(() => getMDXComponent(code), [code]);
  return <Component components={components} />;
}
