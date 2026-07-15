declare module "react-markdown" {
  import { ComponentType } from "react";
  const ReactMarkdown: ComponentType<{
    children: string;
    remarkPlugins?: any[];
    rehypePlugins?: any[];
    components?: Record<string, any>;
  }>;
  export default ReactMarkdown;
}

declare module "remark-gfm" {
  const remarkGfm: any;
  export default remarkGfm;
}

declare module "clsx" {
  export type ClassValue = string | number | boolean | undefined | null | Record<string, boolean> | ClassValue[];
  export function clsx(...args: ClassValue[]): string;
  export default clsx;
}

declare module "tailwind-merge" {
  export function twMerge(...args: string[]): string;
}
