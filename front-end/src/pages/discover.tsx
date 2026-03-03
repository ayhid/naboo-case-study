import {
  ActivityListItem,
  ActivityListItemSkeleton,
  EmptyData,
  PageTitle,
} from "@/components";
import { graphqlClient } from "@/graphql/apollo";
import {
  GetActivitiesQuery,
  GetActivitiesQueryVariables,
} from "@/graphql/generated/types";
import GetActivities from "@/graphql/queries/activity/getActivities";
import { useAuth, useFavorites, useViewMode } from "@/hooks";
import { useActivityViewStyles } from "@/utils";
import { Alert, Box, Button, Group, Loader, SegmentedControl } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";

interface DiscoverProps {
  activities: GetActivitiesQuery["getActivities"];
}

export const getServerSideProps: GetServerSideProps<
  DiscoverProps
> = async () => {
  const response = await graphqlClient.query<
    GetActivitiesQuery,
    GetActivitiesQueryVariables
  >({
    query: GetActivities,
  });
  return { props: { activities: response.data.getActivities } };
};

export default function Discover({ activities }: DiscoverProps) {
  const { classes, cx } = useActivityViewStyles();
  const { user } = useAuth();
  const {
    favoriteIds,
    isFavoritesLoading,
    favoritesError,
    isFavoriteToggling,
    toggleFavorite,
  } = useFavorites();
  const { viewMode, setViewMode } = useViewMode({
    storageKey: "activities-view:discovery",
    defaultMode: "grid",
  });

  return (
    <>
      <Head>
        <title>Discover | CDTR</title>
      </Head>
      <Group position="apart">
        <PageTitle title="Découvrez des activités" />
        <Group>
          <SegmentedControl
            aria-label="Mode d'affichage des activités"
            value={viewMode}
            onChange={(value: "grid" | "list") => setViewMode(value)}
            data={[
              { label: "Liste", value: "list" },
              { label: "Grille", value: "grid" },
            ]}
          />
          {user && (
            <Link href="/activities/create">
              <Button>Ajouter une activité</Button>
            </Link>
          )}
        </Group>
      </Group>
      {user && isFavoritesLoading && <Loader size="sm" mb="md" />}
      {user && favoritesError && (
        <Alert
          icon={<IconAlertCircle size="1rem" />}
          title="Erreur"
          color="red"
          mb="md"
        >
          Impossible de charger vos favoris.
        </Alert>
      )}
      {activities.length > 0 ? (
        <Box
          component="ul"
          aria-label="Liste des activités"
          className={cx(classes.activitiesView, {
            [classes.gridMode]: viewMode === "grid",
            [classes.listMode]: viewMode === "list",
          })}
        >
          {activities.map((activity) => (
            <Box component="li" key={activity.id}>
              <ActivityListItem
                activity={activity}
                isFavorite={favoriteIds.has(activity.id)}
                isFavoriteLoading={isFavoriteToggling(activity.id)}
                onToggleFavorite={user ? toggleFavorite : undefined}
              />
            </Box>
          ))}
        </Box>
      ) : user && isFavoritesLoading ? (
        <Box
          component="ul"
          aria-label="Chargement des activités"
          className={cx(classes.activitiesView, {
            [classes.gridMode]: viewMode === "grid",
            [classes.listMode]: viewMode === "list",
          })}
        >
          <Box component="li">
            <ActivityListItemSkeleton />
          </Box>
          <Box component="li">
            <ActivityListItemSkeleton />
          </Box>
          <Box component="li">
            <ActivityListItemSkeleton />
          </Box>
        </Box>
      ) : (
        <EmptyData />
      )}
    </>
  );
}
