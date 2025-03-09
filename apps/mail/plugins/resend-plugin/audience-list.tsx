import { PluginDataStorage } from "../../types/plugin";
import { getAudiences } from "./actions";
import { toast } from "sonner";
import * as React from "react";

export const AudiencesList = React.memo(
  React.forwardRef<HTMLDivElement, { storage?: PluginDataStorage }>((props, ref) => {
    const [audiences, setAudiences] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [selectedAudience, setSelectedAudience] = React.useState("");

    // Load saved audience selection
    React.useEffect(() => {
      const loadSavedAudience = async () => {
        try {
          if (props.storage) {
            const saved = await props.storage.get<string>("selectedAudience");
            if (saved) {
              setSelectedAudience(saved);
            }
          }
        } catch (error) {
          console.error("Failed to load saved audience:", error);
        }
      };
      loadSavedAudience();
    }, [props.storage]);

    React.useEffect(() => {
      const fetchAudiences = async () => {
        setLoading(true);
        const { data, error: fetchError } = await getAudiences();
        setAudiences(data);
        setError(fetchError);
        setLoading(false);
      };

      fetchAudiences();
    }, []);

    // Save audience selection
    const handleAudienceChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value;
      setSelectedAudience(value);
      try {
        if (props.storage) {
          await props.storage.set("selectedAudience", value);
        }
      } catch (error) {
        console.error("Failed to save audience selection:", error);
        toast.error("Failed to save audience selection");
      }
    };

    return (
      <div ref={ref} className="flex items-center">
        <div className="text-muted-foreground w-20 flex-shrink-0 pr-3 text-right text-[1rem] font-[600] opacity-50 md:w-24">
          Audience
        </div>
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div>Error: {error}</div>
        ) : (
          <select
            className="text-md relative ml-5 w-full bg-transparent placeholder:text-[#616161] placeholder:opacity-50 focus:outline-none"
            value={selectedAudience}
            onChange={handleAudienceChange}
          >
            <option value="" disabled>
              Select an audience
            </option>
            {audiences.map((audience) => (
              <option key={audience.id} value={audience.id}>
                {audience.name}
              </option>
            ))}
          </select>
        )}
      </div>
    );
  }),
);
