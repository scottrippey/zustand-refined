import { createStore } from "zustand/index";
import { useShallow } from "zustand/react/shallow";
import { createGlobalState } from "../zustand-refined";

type CollectionItem = { slug: string };
export const [useCollection, collectionActions] = createGlobalState({
  store: () => {
    return createStore(() => ({
      collection: [] as CollectionItem[],
    }));
  },
  hooks: (useStore) => ({
    useSlugs() {
      return useStore(
        useShallow((state) => {
          return allSlugs(state.collection);
        }),
      );
    },
    useItemWithSlug(slug: string) {
      return useStore((state) => {
        return state.collection.find((item) => item.slug === slug);
      });
    },
    useHasSlug(slug: string) {
      return !!this.useItemWithSlug(slug);
    },
  }),
  actions: (setState, getState) => ({
    addToCollection(item: CollectionItem) {
      setState((state) => ({ collection: [...state.collection, item] }));
    },
    removeBySlug(slug: string) {
      setState((state) => ({
        collection: state.collection.filter((item) => item.slug !== slug),
      }));
    },
  }),
});

// Misc Utils:
function allSlugs(collection: CollectionItem[]) {
  return collection.map((item) => item.slug);
}

// UI Demo

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
