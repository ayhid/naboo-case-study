import { createStyles } from "@mantine/core";

export const useActivityViewStyles = createStyles((theme) => ({
  activitiesView: {
    listStyle: "none",
    margin: 0,
    padding: 0,

    "& > li": {
      width: "100%",
    },
  },

  listMode: {
    display: "block",

    "& > li + li": {
      marginTop: theme.spacing.sm,
    },

    "& .activity-list-item": {
      padding: 0,
      overflow: "hidden",
    },

    "& .activity-list-item__layout": {
      gap: theme.spacing.sm,
      alignItems: "stretch",
    },

    "& .activity-list-item__main": {
      gap: theme.spacing.md,
      alignItems: "stretch",
    },

    "& .activity-list-item__media": {
      width: 125,
      minWidth: 125,
      flex: "0 0 125px",
      overflow: "hidden",
      alignSelf: "stretch",
      borderTopLeftRadius: theme.radius.md,
      borderBottomLeftRadius: theme.radius.md,
    },

    "& .activity-list-item__image": {
      width: "100%",
      height: "100%",
      borderRadius: 0,
    },

    "& .activity-list-item__image > figure": {
      height: "100%",
      margin: 0,
      width: "100%",
    },

    "& .activity-list-item__image > figure > div": {
      height: "100%",
      width: "100%",
    },

    "& .activity-list-item__image img": {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      display: "block",
    },

    "& .activity-list-item__content": {
      paddingTop: theme.spacing.sm,
      paddingBottom: theme.spacing.sm,
    },

    "& .activity-list-item__actions": {
      paddingRight: theme.spacing.sm,
      alignSelf: "center",
    },
  },

  gridMode: {
    display: "grid",
    gap: theme.spacing.md,
    gridTemplateColumns: "repeat(1, minmax(0, 1fr))",

    [theme.fn.largerThan("sm")]: {
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    },

    [theme.fn.largerThan("lg")]: {
      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    },

    "& .activity-list-item": {
      height: "100%",
      position: "relative",
      padding: 0,
      overflow: "hidden",
    },

    "& .activity-list-item__layout": {
      display: "block",
      minWidth: 0,
    },

    "& .activity-list-item__main": {
      display: "block",
      minWidth: 0,
    },

    "& .activity-list-item__media": {
      width: "100%",
      minWidth: 0,
      borderTopLeftRadius: theme.radius.md,
      borderTopRightRadius: theme.radius.md,
      overflow: "hidden",
    },

    "& .activity-list-item__image": {
      width: "100%",
      height: 160,
      borderRadius: 0,
    },

    "& .activity-list-item__image > figure": {
      height: 160,
      margin: 0,
      width: "100%",
    },

    "& .activity-list-item__image > figure > div": {
      height: "100%",
      width: "100%",
    },

    "& .activity-list-item__image img": {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      display: "block",
    },

    "& .activity-list-item__content": {
      paddingTop: theme.spacing.md,
      paddingLeft: theme.spacing.md,
      paddingRight: theme.spacing.md,
      paddingBottom: theme.spacing.md,
      display: "flex",
      flexDirection: "column",
      gap: 6,
      minWidth: 0,
    },

    "& .activity-list-item__actions": {
      position: "absolute",
      top: theme.spacing.sm,
      right: theme.spacing.sm,
      zIndex: 2,
      paddingRight: 0,
      minWidth: 36,
    },
  },
}));
