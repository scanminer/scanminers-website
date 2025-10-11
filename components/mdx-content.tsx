"use client";

import * as React from "react";
import { useMDXComponent } from "next-contentlayer/hooks";

type MDXContentProps = {
  code: string;
  components?: Record<string, React.ComponentType<unknown>>;
};

export function MDXContent({ code, components }: MDXContentProps) {
  const Component = useMDXComponent(code);
  return <Component components={components} />;
}
