import { ActivityListItem, EmptyData, PageTitle } from "@/components";
import { withAuth } from "@/hocs";
import { useAuth, useFavorites } from "@/hooks";
import {
  Alert,
  Avatar,
  Badge,
  Box,
  Button,
  Divider,
  Flex,
  Group,
  Loader,
  Stack,
  Text,
} from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";

const Profile = () => {
  const { user } = useAuth();
  const {
    favoriteActivities,
    isFavoritesLoading,
    favoritesError,
    isFavoriteToggling,
    isReorderingFavorites,
    reorderFavorites,
    toggleFavorite,
  } = useFavorites();
  const [draggedFavoriteIndex, setDraggedFavoriteIndex] = useState<number | null>(null);
  const [dragOverFavoriteIndex, setDragOverFavoriteIndex] = useState<number | null>(null);

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
        <title>Mon profil | CDTR</title>
      </Head>
      <PageTitle title="Mon profil" />
      <Flex align="center" gap="md">
        <Avatar color="cyan" radius="xl" size="lg">
          {user?.firstName[0]}
          {user?.lastName[0]}
        </Avatar>
        <Flex direction="column">
          <Text>{user?.email}</Text>
          <Text>{user?.firstName}</Text>
          <Text>{user?.lastName}</Text>
        </Flex>
      </Flex>
      <Box mt="xl">
        <Group position="apart" mb="xs">
          <Text weight={600}>Mes favoris</Text>
          <Badge color="teal" variant="light">
            {favoriteActivities.length}
          </Badge>
        </Group>
        <Divider mb="md" />
        {isFavoritesLoading && <Loader size="sm" />}
        {favoritesError && (
          <Alert
            icon={<IconAlertCircle size="1rem" />}
            title="Erreur"
            color="red"
            mb="md"
          >
            Impossible de charger vos activités favorites.
          </Alert>
        )}
        {!isFavoritesLoading && !favoritesError && favoriteActivities.length === 0 && (
          <Stack align="center" spacing="sm">
            <EmptyData />
            <Text color="dimmed">
              Vous n&apos;avez pas encore d&apos;activités favorites.
            </Text>
            <Link href="/discover">
              <Button>Découvrir des activités</Button>
            </Link>
          </Stack>
        )}
        {!isFavoritesLoading && !favoritesError && favoriteActivities.length > 0 && (
          <Text size="sm" color="dimmed" mb="sm">
            Glissez-déposez vos favoris pour les réordonner.
          </Text>
        )}
        <Stack spacing="sm">
          {favoriteActivities.map((activity, index) => (
            <Box
              key={activity.id}
              component="div"
              draggable={!isReorderingFavorites}
              aria-grabbed={draggedFavoriteIndex === index}
              onDragStart={() => {
                if (isReorderingFavorites) return;
                setDraggedFavoriteIndex(index);
              }}
              onDragOver={(event) => {
                if (isReorderingFavorites) return;
                event.preventDefault();
                setDragOverFavoriteIndex(index);
              }}
              onDrop={async (event) => {
                if (isReorderingFavorites) return;
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
                cursor: isReorderingFavorites ? "default" : "grab",
                opacity: draggedFavoriteIndex === index ? 0.7 : 1,
                outline:
                  dragOverFavoriteIndex === index
                    ? `1px dashed ${theme.colors.teal[5]}`
                    : "none",
                outlineOffset: 4,
                borderRadius: theme.radius.md,
              })}
            >
              <ActivityListItem
                activity={activity}
                isFavorite
                isFavoriteDisabled={
                  isFavoriteToggling(activity.id) || isReorderingFavorites
                }
                isFavoriteLoading={isFavoriteToggling(activity.id)}
                onToggleFavorite={toggleFavorite}
              />
            </Box>
          ))}
        </Stack>
      </Box>
    </>
  );
};

export default withAuth(Profile);
