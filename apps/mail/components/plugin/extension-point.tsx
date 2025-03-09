import { usePlugins } from "../../hooks/use-plugins";
import { cloneElement, isValidElement } from "react";

interface ExtensionPointProps {
  location: string;
  data?: Record<string, unknown>;
}

export function ExtensionPoint({ location, data }: ExtensionPointProps) {
  const { getUIExtensions } = usePlugins();
  const extensions = getUIExtensions(location);

  return (
    <>
      {extensions.map((extension, index) => {
        try {
          const element = extension.component;
          if (!isValidElement(element)) {
            console.error(`Invalid React element at extension point ${location}:`, element);
            return null;
          }

          return (
            <div
              key={`${location}-${index}`}
              className="inline-flex items-center"
              data-extension-point={location}
              data-extension-index={index}
            >
              {cloneElement(element, {
                // @ts-ignore
                data,
                key: `${location}-${index}`,
                "data-extension": "true",
              })}
            </div>
          );
        } catch (error) {
          console.error(`Error rendering extension at ${location}:`, error);
          return null;
        }
      })}
    </>
  );
}
