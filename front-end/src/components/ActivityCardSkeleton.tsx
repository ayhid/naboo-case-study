import { Card, Grid, Group, Skeleton, Stack } from "@mantine/core";

export function ActivityCardSkeleton() {
  return (
    <Grid.Col span={12} sm={6} lg={4}>
      <Card
        shadow="xs"
        padding="md"
        radius="md"
        withBorder
        sx={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}
      >
        <Card.Section>
          <Skeleton height={160} />
        </Card.Section>

        <Stack spacing="sm" mt="md" sx={{ flex: 1, minWidth: 0 }}>
          <Group position="apart" noWrap>
            <Skeleton height={18} width="65%" />
            <Skeleton height={24} width={24} radius="xl" />
          </Group>

          <Group spacing="xs">
            <Skeleton height={22} width={78} radius="xl" />
            <Skeleton height={22} width={66} radius="xl" />
          </Group>

          <Skeleton height={12} width="100%" />
          <Skeleton height={12} width="80%" />
        </Stack>
      </Card>
    </Grid.Col>
  );
}
