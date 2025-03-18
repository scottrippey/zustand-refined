import { createStore, ExtractState, UseBoundStore, useStore } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { createGlobalStateWithActions, UseStoreHook } from "../zustand-actions";
import {
  createActions,
  createLocalStore,
  createGlobalStore,
  createLocalStore,
} from "../zustand-actions-2";

type CollectionItem = { slug: string };

export const [useCollection, collectionActions] = createGlobalStore({
  store: () => {
    return createStore(() => ({
      collection: [] as CollectionItem[],
    }));
  },
  hook: (useCollection) =>
    Object.assign(useCollection, {
      useSlugs() {
        return useCollection(
          useShallow((state) => {
            return allSlugs(state.collection);
          }),
        );
      },
      useItemWithSlug(slug: string) {
        return useCollection((state) => {
          return state.collection.find((item) => item.slug === slug);
        });
      },
      useHasSlug(slug: string) {
        return !!useCollection.useItemWithSlug(slug);
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

type CollectionProps = { maxLength: number };
export const [
  ///
  useCollectionLocal,
  useCollectionActions,
  CollectionProvider,
] = createLocalStore({
  allowGlobal: false,
  store: (props?: CollectionProps) => {
    if (!props) throw new Error("Missing 'CollectionProvider'");
    return createStore(() => ({
      collection: [] as CollectionItem[],
    }));
  },
  hook: (useCollection) => ({
    useSlugs() {
      return useCollection(
        useShallow((state) => {
          return allSlugs(state.collection);
        }),
      );
    },
    useItemWithSlug(slug: string) {
      return useCollection((state) => {
        return state.collection.find((item) => item.slug === slug);
      });
    },
    useHasSlug(slug: string) {
      return !!useCollection.useItemWithSlug(slug);
    },
  }),
  actions: (setState, getState, props) => ({
    addToCollection(item: CollectionItem) {
      setState((state) => ({
        collection: clamp([item, ...state.collection], props!.maxLength),
      }));
    },
    removeBySlug(slug: string) {
      setState((state) => ({
        collection: state.collection.filter((item) => item.slug !== slug),
      }));
    },
  }),
});

// Misc Utils:
function clamp<T>(items: T[], maxLength: number) {
  return items.length > maxLength ? items.slice(0, maxLength) : items;
}
function allSlugs(collection: CollectionItem[]) {
  return collection.map((item) => item.slug);
}
