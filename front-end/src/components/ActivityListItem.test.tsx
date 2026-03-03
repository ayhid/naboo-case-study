import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { USER_ROLES } from "@/constants/role";
import { ActivityListItem } from "./ActivityListItem";

const push = vi.fn();
const useAuthMock = vi.fn();

vi.mock("next/router", () => ({
  useRouter: () => ({
    push,
  }),
}));

vi.mock("@/hooks", () => ({
  useAuth: () => useAuthMock(),
}));

describe("ActivityListItem debug date", () => {
  const activity = {
    id: "activity-1",
    name: "Kayak Tour",
    city: "Annecy",
    description: "Lac d'Annecy",
    price: 50,
    createdAt: "2026-03-01T10:00:00.000Z",
    owner: {
      firstName: "Alice",
      lastName: "Doe",
    },
  } as any;

  beforeEach(() => {
    push.mockReset();
    useAuthMock.mockReset();
  });

  it("shows the creation date for admin users", () => {
    useAuthMock.mockReturnValue({
      user: { role: USER_ROLES.ADMIN },
    });

    render(<ActivityListItem activity={activity} isClickable={false} />);

    expect(screen.getByText(/Created/i)).toBeInTheDocument();
  });

  it("does not show the creation date for non-admin users", () => {
    useAuthMock.mockReturnValue({
      user: { role: USER_ROLES.USER },
    });

    render(<ActivityListItem activity={activity} isClickable={false} />);

    expect(screen.queryByText(/Created/i)).not.toBeInTheDocument();
  });
});
