import { Card, Flex, Group, Skeleton, Stack } from "@mantine/core";

export function ActivityListItemSkeleton() {
  return (
    <Card className="activity-list-item" withBorder radius="md" p="sm" sx={{ overflow: "hidden" }}>
      <Flex
        className="activity-list-item__layout"
        align="center"
        justify="space-between"
        gap="md"
        sx={{ minWidth: 0 }}
      >
        <Flex className="activity-list-item__main" gap="md" align="center" sx={{ flex: 1, minWidth: 0 }}>
          <div className="activity-list-item__media">
            <Skeleton className="activity-list-item__image" height="100%" width="100%" radius={0} />
          </div>
          <Stack className="activity-list-item__content" spacing={6} sx={{ flex: 1, minWidth: 0 }}>
            <Skeleton height={16} width="60%" />
            <Group spacing="xs">
              <Skeleton height={22} width={74} radius="xl" />
              <Skeleton height={22} width={64} radius="xl" />
            </Group>
            <Skeleton height={12} width="85%" />
          </Stack>
        </Flex>
        <Skeleton className="activity-list-item__actions" height={36} width={36} radius="xl" sx={{ flexShrink: 0 }} />
      </Flex>
    </Card>
  );
}
