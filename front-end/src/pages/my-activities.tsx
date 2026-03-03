import {
  ActivityListItem,
  ActivityListItemSkeleton,
  EmptyData,
  PageTitle,
} from "@/components";
import { graphqlClient } from "@/graphql/apollo";
import {
  GetUserActivitiesQuery,
  GetUserActivitiesQueryVariables,
} from "@/graphql/generated/types";
import GetUserActivities from "@/graphql/queries/activity/getUserActivities";
import { withAuth } from "@/hocs";
import { useAuth, useFavorites, useViewMode } from "@/hooks";
import { useActivityViewStyles } from "@/utils";
import {
  Alert,
  Box,
  Button,
  Group,
  Loader,
  SegmentedControl,
  Stack,
  Tabs,
  Text,
} from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";

interface MyActivitiesProps {
  activities: GetUserActivitiesQuery["getActivitiesByUser"];
}

export const getServerSideProps: GetServerSideProps<
  MyActivitiesProps
> = async ({ req }) => {
  const response = await graphqlClient.query<
    GetUserActivitiesQuery,
    GetUserActivitiesQueryVariables
  >({
    query: GetUserActivities,
    context: { headers: { Cookie: req.headers.cookie } },
  });
  return { props: { activities: response.data.getActivitiesByUser } };
};

const MyActivities = ({ activities }: MyActivitiesProps) => {
  const { classes, cx } = useActivityViewStyles();
  const { user } = useAuth();
  const {
    favoriteActivities,
    favoriteIds,
    isFavoritesLoading,
    favoritesError,
    isFavoriteToggling,
    isReorderingFavorites,
    reorderFavorites,
    toggleFavorite,
  } = useFavorites();
  const { viewMode, setViewMode } = useViewMode({
    storageKey: "activities-view:productivity",
    defaultMode: "list",
  });
  const [activeTab, setActiveTab] = useState<"all" | "favorites">("all");
  const [draggedFavoriteIndex, setDraggedFavoriteIndex] = useState<number | null>(null);
  const [dragOverFavoriteIndex, setDragOverFavoriteIndex] = useState<number | null>(null);
  const displayedActivities = activeTab === "favorites" ? favoriteActivities : activities;

  const moveFavoriteByDragAndDrop = async (targetIndex: number) => {
    if (draggedFavoriteIndex === null) return;
    if (targetIndex < 0 || targetIndex >= favoriteActivities.length) return;
    if (targetIndex === draggedFavoriteIndex) return;

    const reordered = [...favoriteActivities];
    const [movedItem] = reordered.splice(draggedFavoriteIndex, 1);
    reordered.splice(targetIndex, 0, movedItem);
    await reorderFavorites(reordered.map((activity) => activity.id));
  };

  return (
    <>
      <Head>
        <title>Mes activités | CDTR</title>
      </Head>
      <Group position="apart">
        <PageTitle title="Mes activités" />
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
      <Tabs
        value={activeTab}
        onTabChange={(value) => setActiveTab((value as "all" | "favorites") || "all")}
        mb="md"
      >
        <Tabs.List>
          <Tabs.Tab value="all">{`Toutes (${activities.length})`}</Tabs.Tab>
          <Tabs.Tab value="favorites">{`Mes favoris (${favoriteActivities.length})`}</Tabs.Tab>
        </Tabs.List>
      </Tabs>
      {activeTab === "favorites" && isFavoritesLoading && (
        <Box
          component="ul"
          aria-label="Chargement des favoris"
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
      )}
      {activeTab === "favorites" && favoritesError && (
        <Alert icon={<IconAlertCircle size="1rem" />} title="Erreur" color="red" mb="md">
          Impossible de charger vos favoris.
        </Alert>
      )}
      {!((activeTab === "favorites" && isFavoritesLoading) || (activeTab === "favorites" && favoritesError)) &&
      displayedActivities.length > 0 ? (
        <Box
          component="ul"
          aria-label={
            activeTab === "favorites" ? "Liste de mes activités favorites" : "Liste de mes activités"
          }
          className={cx(classes.activitiesView, {
            [classes.gridMode]: viewMode === "grid",
            [classes.listMode]: viewMode === "list",
          })}
        >
          {displayedActivities.map((activity, index) => (
            <Box
              component="li"
              key={activity.id}
              draggable={activeTab === "favorites" && !isReorderingFavorites}
              aria-grabbed={
                activeTab === "favorites" ? draggedFavoriteIndex === index : undefined
              }
              onDragStart={() => {
                if (activeTab !== "favorites" || isReorderingFavorites) return;
                setDraggedFavoriteIndex(index);
              }}
              onDragOver={(event) => {
                if (activeTab !== "favorites" || isReorderingFavorites) return;
                event.preventDefault();
                setDragOverFavoriteIndex(index);
              }}
              onDrop={async (event) => {
                if (activeTab !== "favorites" || isReorderingFavorites) return;
                event.preventDefault();
                await moveFavoriteByDragAndDrop(index);
                setDraggedFavoriteIndex(null);
                setDragOverFavoriteIndex(null);
              }}
              onDragEnd={() => {
                setDraggedFavoriteIndex(null);
                setDragOverFavoriteIndex(null);
              }}
              sx={(theme) => ({
                ...(activeTab === "favorites"
                  ? {
                      cursor: isReorderingFavorites ? "default" : "grab",
                      opacity: draggedFavoriteIndex === index ? 0.7 : 1,
                      outline:
                        dragOverFavoriteIndex === index
                          ? `1px dashed ${theme.colors.teal[5]}`
                          : "none",
                      outlineOffset: 4,
                      borderRadius: theme.radius.md,
                    }
                  : {}),
              })}
            >
              <ActivityListItem
                activity={activity}
                isFavorite={favoriteIds.has(activity.id)}
                isFavoriteDisabled={isFavoriteToggling(activity.id) || isReorderingFavorites}
                isFavoriteLoading={isFavoriteToggling(activity.id)}
                onToggleFavorite={toggleFavorite}
              />
            </Box>
          ))}
        </Box>
      ) : (
        <Stack align="center" spacing="sm">
          <EmptyData />
          {activeTab === "favorites" ? (
            <>
              <Text color="dimmed" size="sm">
                Glissez-déposez vos favoris pour les réordonner.
              </Text>
              <Text color="dimmed">Vous n&apos;avez pas encore de favoris.</Text>
              <Link href="/discover">
                <Button>Découvrir des activités</Button>
              </Link>
            </>
          ) : (
            <Text color="dimmed">Vous n&apos;avez pas encore créé d&apos;activité.</Text>
          )}
        </Stack>
      )}
    </>
  );
};

export default withAuth(MyActivities);
