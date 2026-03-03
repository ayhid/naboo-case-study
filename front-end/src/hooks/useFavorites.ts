import { useAuth } from "./useAuth";
import { useSnackbar } from "./useSnackbar";
import AddFavoriteActivity from "@/graphql/mutations/activity/addFavoriteActivity";
import RemoveFavoriteActivity from "@/graphql/mutations/activity/removeFavoriteActivity";
import ReorderFavoriteActivities from "@/graphql/mutations/activity/reorderFavoriteActivities";
import {
  AddFavoriteActivityMutation,
  AddFavoriteActivityMutationVariables,
  GetFavoriteActivitiesQuery,
  GetFavoriteActivitiesQueryVariables,
  RemoveFavoriteActivityMutation,
  RemoveFavoriteActivityMutationVariables,
  ReorderFavoriteActivitiesMutation,
  ReorderFavoriteActivitiesMutationVariables,
} from "@/graphql/generated/types";
import GetFavoriteActivities from "@/graphql/queries/activity/getFavoriteActivities";
import { useApolloClient, useMutation, useQuery } from "@apollo/client";
import { useCallback, useMemo, useState } from "react";

export function useFavorites() {
  const { user } = useAuth();
  const snackbar = useSnackbar();
  const client = useApolloClient();
  const [togglingFavoriteIds, setTogglingFavoriteIds] = useState<Set<string>>(new Set());
  const [optimisticFavoriteStates, setOptimisticFavoriteStates] = useState<
    Record<string, boolean>
  >({});

  const {
    data,
    loading: isFavoritesLoading,
    error,
  } = useQuery<GetFavoriteActivitiesQuery, GetFavoriteActivitiesQueryVariables>(
    GetFavoriteActivities,
    {
      skip: !user,
      fetchPolicy: "cache-and-network",
    }
  );

  const [addFavoriteActivity] = useMutation<
    AddFavoriteActivityMutation,
    AddFavoriteActivityMutationVariables
  >(AddFavoriteActivity);

  const [removeFavoriteActivity] = useMutation<
    RemoveFavoriteActivityMutation,
    RemoveFavoriteActivityMutationVariables
  >(RemoveFavoriteActivity);

  const [reorderFavoriteActivities, { loading: isReorderingFavorites }] =
    useMutation<
      ReorderFavoriteActivitiesMutation,
      ReorderFavoriteActivitiesMutationVariables
    >(ReorderFavoriteActivities, {
      refetchQueries: [{ query: GetFavoriteActivities }],
      awaitRefetchQueries: true,
    });

  const favoriteActivities = useMemo(
    () => data?.getFavoriteActivities ?? [],
    [data?.getFavoriteActivities]
  );
  const serverFavoriteIds = useMemo(
    () => new Set(favoriteActivities.map((activity) => activity.id)),
    [favoriteActivities]
  );

  const favoriteIds = useMemo(() => {
    const mergedFavoriteIds = new Set(serverFavoriteIds);
    Object.entries(optimisticFavoriteStates).forEach(([activityId, isFavorite]) => {
      if (isFavorite) {
        mergedFavoriteIds.add(activityId);
      } else {
        mergedFavoriteIds.delete(activityId);
      }
    });
    return mergedFavoriteIds;
  }, [optimisticFavoriteStates, serverFavoriteIds]);

  const isFavoriteToggling = useCallback(
    (activityId: string) => togglingFavoriteIds.has(activityId),
    [togglingFavoriteIds]
  );

  const updateFavoriteActivitiesCache = useCallback(
    (activities: GetFavoriteActivitiesQuery["getFavoriteActivities"]) => {
      client.writeQuery<GetFavoriteActivitiesQuery, GetFavoriteActivitiesQueryVariables>({
        query: GetFavoriteActivities,
        data: {
          __typename: "Query",
          getFavoriteActivities: activities,
        },
      });
    },
    [client]
  );

  const toggleFavorite = async (activityId: string) => {
    if (!user) return;
    if (togglingFavoriteIds.has(activityId)) return;

    const currentIsFavorite =
      optimisticFavoriteStates[activityId] ?? serverFavoriteIds.has(activityId);
    const nextIsFavorite = !currentIsFavorite;

    try {
      setTogglingFavoriteIds((previous) => {
        const next = new Set(previous);
        next.add(activityId);
        return next;
      });
      setOptimisticFavoriteStates((previous) => ({
        ...previous,
        [activityId]: nextIsFavorite,
      }));

      if (currentIsFavorite) {
        const { data: mutationData } = await removeFavoriteActivity({
          variables: { activityId },
        });
        if (mutationData?.removeFavoriteActivity) {
          updateFavoriteActivitiesCache(mutationData.removeFavoriteActivity);
        }
      } else {
        const { data: mutationData } = await addFavoriteActivity({
          variables: { activityId },
        });
        if (mutationData?.addFavoriteActivity) {
          updateFavoriteActivitiesCache(mutationData.addFavoriteActivity);
        }
      }

      setOptimisticFavoriteStates((previous) => {
        const { [activityId]: _removed, ...rest } = previous;
        return rest;
      });
    } catch (_error) {
      setOptimisticFavoriteStates((previous) => {
        const { [activityId]: _removed, ...rest } = previous;
        return rest;
      });
      snackbar.error("Impossible de mettre à jour vos favoris");
    } finally {
      setTogglingFavoriteIds((previous) => {
        const next = new Set(previous);
        next.delete(activityId);
        return next;
      });
    }
  };

  const reorderFavorites = async (activityIds: string[]) => {
    if (!user) return;

    try {
      await reorderFavoriteActivities({ variables: { activityIds } });
    } catch (_error) {
      snackbar.error("Impossible de réordonner vos favoris");
    }
  };

  return {
    favoriteActivities,
    favoriteIds,
    isFavoritesLoading,
    favoritesError: error,
    isFavoriteToggling,
    isReorderingFavorites,
    toggleFavorite,
    reorderFavorites,
  };
}
