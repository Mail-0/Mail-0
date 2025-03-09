import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import CookieManager from "@/components/cookies/cookie-manager";

export default function CookieSettingsPage() {
  return (
    <Dialog open modal>
      <DialogContent className="sm:max-w-[600px]">
        <DialogTitle className="sr-only">Cookie Settings</DialogTitle>
        <CookieManager />
      </DialogContent>
    </Dialog>
  );
}
