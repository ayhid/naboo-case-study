import { ActivityListItem, EmptyData, Filters, PageTitle } from "@/components";
import { graphqlClient } from "@/graphql/apollo";
import {
  GetActivitiesByCityQuery,
  GetActivitiesByCityQueryVariables,
} from "@/graphql/generated/types";
import GetActivitiesByCity from "@/graphql/queries/activity/getActivitiesByCity";
import { useDebounced, useViewMode } from "@/hooks";
import { useActivityViewStyles } from "@/utils";
import { Box, Flex, Grid, SegmentedControl } from "@mantine/core";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

interface CityDetailsProps {
  activities: GetActivitiesByCityQuery["getActivitiesByCity"];
  city: string;
}

export const getServerSideProps: GetServerSideProps<CityDetailsProps> = async ({
  params,
  query,
}) => {
  if (!params?.city || Array.isArray(params.city)) return { notFound: true };

  if (
    (query.activity && Array.isArray(query.activity)) ||
    (query.price && Array.isArray(query.price))
  )
    return { notFound: true };

  const response = await graphqlClient.query<
    GetActivitiesByCityQuery,
    GetActivitiesByCityQueryVariables
  >({
    query: GetActivitiesByCity,
    variables: {
      city: params.city,
      activity: query.activity || null,
      price: query.price ? Number(query.price) : null,
    },
  });
  return {
    props: { activities: response.data.getActivitiesByCity, city: params.city },
  };
};

export default function ActivityDetails({
  activities,
  city,
}: CityDetailsProps) {
  const { classes, cx } = useActivityViewStyles();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchActivity, setSearchActivity] = useState<string | undefined>(
    searchParams?.get("activity") || undefined
  );
  const debouncedSearchActivity = useDebounced(searchActivity, 300);

  const [searchPrice, setSearchPrice] = useState<number | undefined>(
    searchParams?.get("price") ? Number(searchParams.get("price")) : undefined
  );
  const debouncedSearchPrice = useDebounced(searchPrice, 300);
  const { viewMode, setViewMode } = useViewMode({
    storageKey: "activities-view:productivity",
    defaultMode: "list",
  });

  useEffect(() => {
    const searchParams = new URLSearchParams();

    if (debouncedSearchActivity !== undefined)
      searchParams.set("activity", debouncedSearchActivity);

    if (debouncedSearchPrice !== undefined)
      searchParams.set("price", debouncedSearchPrice.toString());

    const stringParams = searchParams.toString();
    router.push(`/explorer/${city}${stringParams ? `?${stringParams}` : ""}`);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city, debouncedSearchActivity, debouncedSearchPrice]);

  return (
    <>
      <Head>
        <title>{city} | CDTR</title>
      </Head>
      <PageTitle
        title={`Activités pour la ville de ${city}`}
        prevPath="/explorer"
      />
      <Grid>
        <Grid.Col span={4}>
          <Filters
            {...{
              activity: searchActivity,
              price: searchPrice,
              setSearchActivity,
              setSearchPrice,
            }}
          />
        </Grid.Col>
        <Grid.Col span={8}>
          <Flex direction="column" gap="lg">
            <Flex justify="flex-end">
              <SegmentedControl
                aria-label="Mode d'affichage des activités"
                value={viewMode}
                onChange={(value: "grid" | "list") => setViewMode(value)}
                data={[
                  { label: "Liste", value: "list" },
                  { label: "Grille", value: "grid" },
                ]}
              />
            </Flex>
            {activities.length > 0 ? (
              <Box
                component="ul"
                aria-label="Liste des activités filtrées"
                className={cx(classes.activitiesView, {
                  [classes.gridMode]: viewMode === "grid",
                  [classes.listMode]: viewMode === "list",
                })}
              >
                {activities.map((activity) => (
                  <Box component="li" key={activity.id}>
                    <ActivityListItem activity={activity} />
                  </Box>
                ))}
              </Box>
            ) : (
              <EmptyData />
            )}
          </Flex>
        </Grid.Col>
      </Grid>
    </>
  );
}
