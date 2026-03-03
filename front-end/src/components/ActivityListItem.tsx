import { ActivityFragment } from "@/graphql/generated/types";
import { USER_ROLES } from "@/constants/role";
import { FavoriteButton } from "./FavoriteButton";
import { HasRole } from "./HasRole";
import { Badge, Box, Card, Flex, Group, Image, Stack, Text } from "@mantine/core";
import { useRouter } from "next/router";
import { ReactNode } from "react";

interface ActivityListItemProps {
  activity: ActivityFragment;
  rightActions?: ReactNode;
  isFavorite?: boolean;
  isFavoriteDisabled?: boolean;
  isFavoriteLoading?: boolean;
  onToggleFavorite?: (activityId: string) => void | Promise<void>;
  isClickable?: boolean;
  className?: string;
}

export function ActivityListItem({
  activity,
  rightActions,
  isFavorite,
  isFavoriteDisabled,
  isFavoriteLoading,
  onToggleFavorite,
  isClickable = true,
  className,
}: ActivityListItemProps) {
  const router = useRouter();
  const hasActions = Boolean(rightActions || onToggleFavorite);
  let formattedCreatedAt: string | null = null;
  if (activity.createdAt) {
    const parsedDate = new Date(activity.createdAt as string);
    if (!Number.isNaN(parsedDate.getTime())) {
      formattedCreatedAt = new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
      }).format(parsedDate);
    }
  }

  const handleNavigate = () => {
    if (!isClickable) return;
    router.push(`/activities/${activity.id}`);
  };

  return (
    <Card
      className={`activity-list-item${className ? ` ${className}` : ""}`}
      withBorder
      radius="md"
      p="sm"
      role={isClickable ? "link" : undefined}
      tabIndex={isClickable ? 0 : -1}
      aria-label={isClickable ? `Voir les détails de ${activity.name}` : undefined}
      onClick={handleNavigate}
      onKeyDown={(event) => {
        if (!isClickable) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleNavigate();
        }
      }}
      sx={(theme) => ({
        cursor: isClickable ? "pointer" : "default",
        overflow: "hidden",
        transition: "transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease",
        "&:hover": isClickable
          ? {
              transform: "translateY(-1px)",
              boxShadow: theme.shadows.sm,
              borderColor: theme.colors.gray[4],
            }
          : undefined,
        "&:focus-visible": isClickable
          ? {
              boxShadow: `0 0 0 2px ${theme.colors.teal[2]}`,
              borderColor: theme.colors.teal[5],
            }
          : undefined,
      })}
    >
      <Flex
        className="activity-list-item__layout"
        align="center"
        justify="space-between"
        gap="md"
        direction="row"
        sx={{ minWidth: 0 }}
      >
        <Flex
          className="activity-list-item__main"
          gap="md"
          align="center"
          sx={{ flex: 1, minWidth: 0 }}
        >
          <Box className="activity-list-item__media">
            <Image
              className="activity-list-item__image"
              src="https://dummyimage.com/125"
              radius={0}
              alt={`Illustration de ${activity.name} à ${activity.city}`}
              fit="cover"
            />
          </Box>
          <Stack className="activity-list-item__content" spacing={6} sx={{ flex: 1, minWidth: 0 }}>
            <Text weight={600} lineClamp={2}>
              {activity.name}
            </Text>
            <Group spacing="xs">
              <Badge color="gray" variant="light">
                {activity.city}
              </Badge>
              <Badge color="teal" variant="light">
                {`${activity.price}€/j`}
              </Badge>
            </Group>
            <Text size="sm" color="dimmed" lineClamp={1}>
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
        </Flex>
        {hasActions && (
          <Box
            className="activity-list-item__actions"
            sx={(theme) => ({
              flexShrink: 0,
              minWidth: onToggleFavorite ? 36 : undefined,
              alignSelf: "flex-end",
              [theme.fn.largerThan("sm")]: {
                alignSelf: "center",
              },
            })}
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
          >
            <Group spacing={6} noWrap>
              {rightActions}
              {onToggleFavorite && (
                <FavoriteButton
                  isFavorite={Boolean(isFavorite)}
                  disabled={isFavoriteDisabled}
                  loading={isFavoriteLoading}
                  onClick={() => onToggleFavorite(activity.id)}
                />
              )}
            </Group>
          </Box>
        )}
      </Flex>
    </Card>
  );
}
