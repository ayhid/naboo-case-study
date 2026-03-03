import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { HasAuth } from "./HasAuth";

const useAuthMock = vi.fn();

vi.mock("@/hooks", () => ({
  useAuth: () => useAuthMock(),
}));

describe("HasAuth", () => {
  beforeEach(() => {
    useAuthMock.mockReset();
  });

  it("renders children when user is authenticated", () => {
    useAuthMock.mockReturnValue({ user: { id: "u1" }, isLoading: false });

    render(
      <HasAuth>
        <div>Private content</div>
      </HasAuth>
    );

    expect(screen.getByText("Private content")).toBeInTheDocument();
  });

  it("renders fallback when user is not authenticated", () => {
    useAuthMock.mockReturnValue({ user: null, isLoading: false });

    render(
      <HasAuth fallback={<div>Public content</div>}>
        <div>Private content</div>
      </HasAuth>
    );

    expect(screen.getByText("Public content")).toBeInTheDocument();
    expect(screen.queryByText("Private content")).not.toBeInTheDocument();
  });

  it("renders loadingFallback while auth state is loading", () => {
    useAuthMock.mockReturnValue({ user: null, isLoading: true });

    render(
      <HasAuth loadingFallback={<div>Loading auth...</div>}>
        <div>Private content</div>
      </HasAuth>
    );

    expect(screen.getByText("Loading auth...")).toBeInTheDocument();
    expect(screen.queryByText("Private content")).not.toBeInTheDocument();
  });
});
