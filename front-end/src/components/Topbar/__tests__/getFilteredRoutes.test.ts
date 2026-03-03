import { GetUserQuery } from "@/graphql/generated/types";
import { USER_ROLES } from "@/constants/role";
import { checkRouteAccess, getFilteredRoutes } from "../getFilteredRoutes";
import { Route, SubRoute } from "../types";

interface CheckRouteAccessTest {
  description: string;
  route: Route | SubRoute;
  hasUser: boolean;
  result: boolean;
}

const user: GetUserQuery["getMe"] = {
  id: "user1",
  email: "user1@test.fr",
  firstName: "john",
  lastName: "doe",
  role: USER_ROLES.USER,
};

const admin: GetUserQuery["getMe"] = {
  id: "admin1",
  email: "admin@test.fr",
  firstName: "admin",
  lastName: "boss",
  role: USER_ROLES.ADMIN,
};

describe("checkRouteAccess", () => {
  it.each([
    {
      description:
        "returns true for a route with requiredAuth = undefined when user is null",
      route: { requiredAuth: undefined, label: "route1", route: "/route1" },
      hasUser: false,
      result: true,
    },
    {
      description:
        "returns true for a route with requiredAuth = false when user is null",
      route: { requiredAuth: false, label: "route1", route: "/route1" },
      hasUser: false,
      result: true,
    },
    {
      description:
        "returns false for a route with requiredAuth = true when user is null",
      route: { requiredAuth: true, label: "route1", route: "/route1" },
      hasUser: false,
      result: false,
    },
    {
      description:
        "returns false for a route with requiredAuth = false when user is authenticated",
      route: { requiredAuth: false, label: "route1", route: "/route1" },
      hasUser: true,
      result: false,
    },
    {
      description:
        "returns true for a route with requiredAuth = undefined when user is authenticated",
      route: { requiredAuth: undefined, label: "route1", route: "/route1" },
      hasUser: true,
      result: true,
    },
    {
      description:
        "returns true for a route with requiredAuth = true when user is authenticated",
      route: { requiredAuth: true, label: "route1", route: "/route1" },
      hasUser: true,
      result: true,
    },
  ])("$description", ({ route, hasUser, result }: CheckRouteAccessTest) => {
    expect(checkRouteAccess(route, hasUser ? user : null)).toBe(result);
  });
});

describe("getFilteredRoutes", () => {
  const routes: Route[] = [
    { label: "Route1", route: "/route1" },
    { label: "Route2", route: "/route2", requiredAuth: true },
    { label: "Route3", route: "/route3", requiredAuth: false },
    {
      label: "Route4",
      route: [
        {
          label: "Route4.1",
          link: "/route4.1",
          requiredAuth: false,
        },
        {
          label: "Route4.2",
          link: "/route4.2",
          requiredAuth: true,
        },
      ],
    },
  ];
  it("returns the expected routes when a regular user is authenticated", () => {
    const filtereRoutes = getFilteredRoutes(routes, user);
    expect(filtereRoutes).toEqual([
      { label: "Route1", route: "/route1" },
      { label: "Route2", route: "/route2", requiredAuth: true },
      {
        label: "Route4",
        route: [
          {
            label: "Route4.2",
            link: "/route4.2",
            requiredAuth: true,
          },
        ],
      },
    ]);
  });

  it("returns the expected routes when an admin user is authenticated", () => {
    const filtereRoutes = getFilteredRoutes(routes, admin);
    expect(filtereRoutes).toEqual([
      { label: "Route1", route: "/route1" },
      { label: "Route2", route: "/route2", requiredAuth: true },
      {
        label: "Route4",
        route: [
          {
            label: "Route4.2",
            link: "/route4.2",
            requiredAuth: true,
          },
        ],
      },
    ]);
  });

  it("returns the expected routes when no user is authenticated", () => {
    const filtereRoutes = getFilteredRoutes(routes, null);
    expect(filtereRoutes).toEqual([
      { label: "Route1", route: "/route1" },
      { label: "Route3", route: "/route3", requiredAuth: false },
      {
        label: "Route4",
        route: [
          {
            label: "Route4.1",
            link: "/route4.1",
            requiredAuth: false,
          },
        ],
      },
    ]);
  });
});
