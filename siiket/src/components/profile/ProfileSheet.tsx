import { X } from "lucide-react";
import uiStore from "@/store/uiStore";
import { ProfileContent } from "./ProfileContent";

export function ProfileSheet() {
  const open = uiStore((s) => s.profileSheetOpen);
  const close = uiStore((s) => s.closeProfileSheet);

  return (
    <>
      <div
        onClick={close}
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />
      <aside
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-background z-50 shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-5 border-b border-border/60">
          <h2 className="text-xl font-bold">Profile</h2>
          <button onClick={close} className="h-8 w-8 rounded-full grid place-items-center hover:bg-muted transition">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-5 py-5 overflow-y-auto h-[calc(100%-73px)]">
          <ProfileContent />
        </div>
      </aside>
    </>
  );
}