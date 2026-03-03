import { ActivityFragment } from "@/graphql/generated/types";
import { USER_ROLES } from "@/constants/role";
import { useGlobalStyles } from "@/utils";
import { FavoriteButton } from "./FavoriteButton";
import { HasRole } from "./HasRole";
import { Badge, Card, Grid, Group, Image, Stack, Text } from "@mantine/core";
import { useRouter } from "next/router";

interface ActivityProps {
  activity: ActivityFragment;
  isFavorite?: boolean;
  isFavoriteLoading?: boolean;
  onToggleFavorite?: (activityId: string) => void | Promise<void>;
}

export function Activity({
  activity,
  isFavorite,
  isFavoriteLoading,
  onToggleFavorite,
}: ActivityProps) {
  const router = useRouter();
  const { classes } = useGlobalStyles();
  let formattedCreatedAt: string | null = null;
  if (activity.createdAt) {
    const parsedDate = new Date(activity.createdAt as string);
    if (!Number.isNaN(parsedDate.getTime())) {
      formattedCreatedAt = new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
      }).format(parsedDate);
    }
  }

  return (
    <Grid.Col span={12} sm={6} lg={4}>
      <Card
        shadow="xs"
        padding="md"
        radius="md"
        withBorder
        sx={(theme) => ({
          height: "100%",
          display: "flex",
          flexDirection: "column",
          cursor: "pointer",
          transition: "transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: theme.shadows.md,
            borderColor: theme.colors.gray[4],
          },
          "&:focus-visible": {
            boxShadow: `0 0 0 2px ${theme.colors.teal[2]}`,
            borderColor: theme.colors.teal[5],
          },
        })}
        role="link"
        tabIndex={0}
        aria-label={`Voir les détails de ${activity.name}`}
        onClick={() => router.push(`/activities/${activity.id}`)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            router.push(`/activities/${activity.id}`);
          }
        }}
      >
        <Card.Section>
          <Image
            src="https://dummyimage.com/480x4:3"
            height={160}
            alt={`Illustration de ${activity.name} à ${activity.city}`}
          />
        </Card.Section>

        <Stack spacing="sm" mt="md" sx={{ flex: 1 }}>
          <Group position="apart" align="flex-start" noWrap>
            <Text weight={600} size="md" className={classes.ellipsis}>
              {activity.name}
            </Text>
            {onToggleFavorite && (
              <FavoriteButton
                isFavorite={Boolean(isFavorite)}
                loading={isFavoriteLoading}
                onClick={() => onToggleFavorite(activity.id)}
              />
            )}
          </Group>

          <Group spacing="xs">
            <Badge color="gray" variant="light">
              {activity.city}
            </Badge>
            <Badge color="teal" variant="light">
              {`${activity.price}€/j`}
            </Badge>
          </Group>

          <Text size="sm" color="dimmed" lineClamp={2}>
            {activity.description}
          </Text>
          <HasRole role={USER_ROLES.ADMIN}>
            {formattedCreatedAt && (
              <Text size="xs" color="dimmed">
                Created {formattedCreatedAt}
              </Text>
            )}
          </HasRole>
        </Stack>
      </Card>
    </Grid.Col>
  );
}
