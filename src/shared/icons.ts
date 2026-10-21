/**
 * Lucide icons via deep per-icon imports.
 * The package root re-exports ~2000 icon modules; importing it makes the
 * production bundler parse all of them (OOM on small CI runners), while
 * deep imports keep the graph at the icons actually used.
 */
import ArrowLeft from "lucide-react/dist/esm/icons/arrow-left";
import ArrowLeftRight from "lucide-react/dist/esm/icons/arrow-left-right";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import Banknote from "lucide-react/dist/esm/icons/banknote";
import CalendarDays from "lucide-react/dist/esm/icons/calendar-days";
import Check from "lucide-react/dist/esm/icons/check";
import ChevronDown from "lucide-react/dist/esm/icons/chevron-down";
import Copy from "lucide-react/dist/esm/icons/copy";
import CreditCard from "lucide-react/dist/esm/icons/credit-card";
import Crosshair from "lucide-react/dist/esm/icons/crosshair";
import Download from "lucide-react/dist/esm/icons/download";
import Eye from "lucide-react/dist/esm/icons/eye";
import FileBraces from "lucide-react/dist/esm/icons/file-braces";
import FileText from "lucide-react/dist/esm/icons/file-text";
import KeyRound from "lucide-react/dist/esm/icons/key-round";
import Keyboard from "lucide-react/dist/esm/icons/keyboard";
import Network from "lucide-react/dist/esm/icons/network";
import PanelRightClose from "lucide-react/dist/esm/icons/panel-right-close";
import PanelRightOpen from "lucide-react/dist/esm/icons/panel-right-open";
import Pin from "lucide-react/dist/esm/icons/pin";
import ReceiptText from "lucide-react/dist/esm/icons/receipt-text";
import Redo2 from "lucide-react/dist/esm/icons/redo-2";
import RotateCcw from "lucide-react/dist/esm/icons/rotate-ccw";
import Search from "lucide-react/dist/esm/icons/search";
import Star from "lucide-react/dist/esm/icons/star";
import TextAlignStart from "lucide-react/dist/esm/icons/text-align-start";
import Trash from "lucide-react/dist/esm/icons/trash";
import Undo2 from "lucide-react/dist/esm/icons/undo-2";
import User from "lucide-react/dist/esm/icons/user";
import Waypoints from "lucide-react/dist/esm/icons/waypoints";
import X from "lucide-react/dist/esm/icons/x";

export type { LucideIcon } from "lucide-react";
export {
  ArrowLeft,
  ArrowLeftRight,
  ArrowRight,
  Banknote,
  CalendarDays,
  Check,
  ChevronDown,
  Copy,
  CreditCard,
  Crosshair,
  Download,
  Eye,
  FileBraces,
  FileText,
  KeyRound,
  Keyboard,
  Network,
  PanelRightClose,
  PanelRightOpen,
  Pin,
  ReceiptText,
  Redo2,
  RotateCcw,
  Search,
  Star,
  TextAlignStart,
  Trash,
  Undo2,
  User,
  Waypoints,
  X,
};
