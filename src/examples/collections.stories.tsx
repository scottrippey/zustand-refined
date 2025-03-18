import { useShallow } from "zustand/react/shallow";
import { collectionActions, useCollection } from "./collections";

export function Example() {
  const slugs3 = useCollection.useSlugs(); // Clear

  return (
    <button
      onClick={() => {
        collectionActions.addToCollection({ slug: "new" });
      }}
    >
      {slugs3.join(", ")}
    </button>
  );
}
