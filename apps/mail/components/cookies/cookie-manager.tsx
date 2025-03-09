import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { COOKIE_CATEGORIES, type CategoryInfo, type CookieCategory } from "@/lib/cookies";
import { getCookiePreferences } from "@/actions/cookies";
import Toggle from "@/components/cookies/toggle";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

const CookieManager = async () => {
  // const isEuRegion = (await headers()).get("x-user-eu-region") === "true";

  // if (!isEuRegion) {
  //   redirect("/settings");
  // }

  const preferences = await getCookiePreferences();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Cookie Settings</h3>
        <p className="text-muted-foreground text-sm">
          Manage your cookie preferences. Some cookies are necessary for the website to function and
          cannot be disabled.
        </p>
      </div>

      <div className="grid gap-4">
        {(Object.entries(COOKIE_CATEGORIES) as [CookieCategory, CategoryInfo][]).map(
          ([key, info]) => (
            <Card key={key}>
              <CardHeader>
                <CardTitle>{info.name}</CardTitle>
                <CardDescription>{info.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Toggle checked={preferences[key]} disabled={info.required} category={key} />
              </CardContent>
            </Card>
          ),
        )}
      </div>
    </div>
  );
};

export default CookieManager;
