import { useShallow } from "zustand/react/shallow";
import { collectionStoreActions, useCollection } from "./collections";

export function Example() {
  const slugs1 = useCollection((c) => c.allSlugs()); // bad
  const slugs2 = useCollection(useShallow((c) => c.allSlugs())); // confusing
  const slugs3 = useCollection.useSlugs(); // Clear

  // const addOrUpdateGames = useCollection(x => x.addOrUpdateGames)

  return (
    <button
      onClick={() => {
        collectionStoreActions.addToCollection({ slug: "" });
      }}
    />
  );
}
