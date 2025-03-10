import { Plus, UserPlus } from "lucide-react"
import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { emailProviders } from "@/constants/emailProviders"
import { cn } from "@/lib/utils"
import { useTranslations } from "next-intl";

export const AddConnectionDialog = ({ children, className }: { children?: React.ReactNode, className?: string }) => {

    const t = useTranslations();

    return <Dialog>
        <DialogTrigger asChild>
            <Button size={'dropdownItem'} variant={'dropdownItem'} className={cn("gap-2 w-full justify-start", className)}>
                <UserPlus size={16} strokeWidth={2} className="opacity-60" aria-hidden="true" />
                <p className="text-[13px] opacity-60">{t("pages.settings.connections.addEmail")}</p>
            </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>{t("pages.settings.connections.connectEmail")}</DialogTitle>
                <DialogDescription>{t("pages.settings.connections.connectEmailDescription")}</DialogDescription>
            </DialogHeader>
            <div className="mt-4 grid grid-cols-2 gap-4">
                {emailProviders.map((provider) => (
                    <a key={provider.name} href={`/api/v1/mail/auth/${provider.providerId}/init`}>
                        <Button
                            variant="outline"
                            className="h-24 w-full flex-col items-center justify-center gap-2"
                        >
                            <svg viewBox="0 0 24 24" className="h-12 w-12">
                                <path fill="currentColor" d={provider.icon} />
                            </svg>
                            <span className="text-xs">{provider.name}</span>
                        </Button>
                    </a>
                ))}
                <Button
                    variant="outline"
                    className="h-24 flex-col items-center justify-center gap-2 border-dashed"
                >
                    <Plus className="h-12 w-12" />
                    <span className="text-xs">{t("pages.settings.connections.moreComingSoon")}</span>
                </Button>
            </div>
        </DialogContent>
    </Dialog>
}