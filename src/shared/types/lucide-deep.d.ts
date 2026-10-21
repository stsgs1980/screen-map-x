/**
 * Deep per-icon lucide modules ship no per-file types; type them via the
 * package root type surface (type-only import, no runtime cost).
 */
declare module "lucide-react/dist/esm/icons/*" {
  import type { LucideIcon } from "lucide-react";
  const icon: LucideIcon;
  export default icon;
}
