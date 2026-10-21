import type { ReactElement } from "react";
import {
  ArrowLeftRight,
  Banknote,
  CalendarDays,
  CreditCard,
  FileText,
  KeyRound,
  ReceiptText,
  TextAlignStart,
  Undo2,
  User,
  type LucideIcon,
} from "../../../shared/icons";
import type { IconName } from "../data/types";

const ICONS: Record<IconName, LucideIcon> = {
  doc: FileText,
  user: User,
  money: Banknote,
  calendar: CalendarDays,
  card: CreditCard,
  swap: ArrowLeftRight,
  receipt: ReceiptText,
  refund: Undo2,
  code: KeyRound,
  text: TextAlignStart,
};

/**
 * 12 px entity glyph for a field row (Lucide, spec size preserved).
 * @param props - icon key of the entity
 * @returns the icon component at 12 px
 */
export function Icon({ name }: { name: IconName }): ReactElement {
  const Glyph = ICONS[name];
  return <Glyph size={12} strokeWidth={1.8} aria-hidden />;
}
