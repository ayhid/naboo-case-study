import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";

const graphqlUri =
  process.env.NEXT_PUBLIC_GRAPHQL_URL ??
  process.env.GRAPHQL_URL ??
  "http://localhost:3000/graphql";

if (process.env.NODE_ENV !== "production") {
  // Apollo Client 3.14 can emit noisy canonizeResults deprecation warnings
  // from internal cache paths even when the app does not set the option.
  (globalThis as any)[Symbol.for("apollo.deprecations")] = true;
}

export const graphqlClient = new ApolloClient({
  cache: new InMemoryCache(),
  link: new HttpLink({
    uri: graphqlUri,
    credentials: "include",
  }),
  ssrMode: typeof window === "undefined",
});
