"use client";
import { useMDXComponent } from "next-contentlayer/hooks";

export type MDXContentServerProps = {
  code: string;
  // Optionally pass custom MDX components mapping
  components?: Record<string, React.ComponentType<unknown>>;
};

export function MDXContentServer({ code, components }: MDXContentServerProps) {
  const Component = useMDXComponent(code);
  return <Component components={components} />;
}
