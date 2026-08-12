// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import Onboarding from "./Onboarding";

// Stable references so the component's pre-fill effect (keyed on `user`)
// runs once on mount, mirroring the real AuthContext's stable value.
const { mockCompleteOnboarding, mockUser } = vi.hoisted(() => ({
  mockCompleteOnboarding: vi.fn(),
  mockUser: {
    id: "user-1",
    name: "Jane Doe",
    login: "jane",
    avatar_url: "https://example.com/avatar.png",
    email: "jane@example.com",
  },
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: mockUser,
    completeOnboarding: mockCompleteOnboarding,
  }),
}));

describe("Onboarding", () => {
  beforeEach(() => {
    mockCompleteOnboarding.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders the dialog with the user's name pre-filled and all role options", () => {
    render(<Onboarding />);

    expect(screen.getByRole("dialog", { name: "Complete your profile" })).toBeInTheDocument();
    // The name input is pre-filled from the user's OAuth profile
    expect(screen.getByPlaceholderText("Dr. House")).toHaveValue("Jane Doe");

    const select = screen.getByRole("combobox");
    const options = screen.getAllByRole("option");
    // placeholder + the 7 professions
    expect(options).toHaveLength(8);
    for (const role of [
      "Medical Student",
      "Resident",
      "Fellow",
      "Attending Surgeon",
      "Nurse Practitioner",
      "Physician Assistant",
      "Other",
    ]) {
      expect(screen.getByRole("option", { name: role })).toBeInTheDocument();
    }
    expect(select).toHaveValue("");
  });

  it("keeps the submit button disabled until a role is selected", () => {
    render(<Onboarding />);

    const submit = screen.getByRole("button", { name: /start operating/i });
    expect(submit).toBeDisabled();

    fireEvent.change(screen.getByRole("combobox"), { target: { value: "Resident" } });
    expect(submit).toBeEnabled();
  });

  it("submits the display name and selected role via completeOnboarding", () => {
    render(<Onboarding />);

    fireEvent.change(screen.getByPlaceholderText("Dr. House"), { target: { value: "Dr. House" } });
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "Attending Surgeon" } });
    fireEvent.click(screen.getByRole("button", { name: /start operating/i }));

    expect(mockCompleteOnboarding).toHaveBeenCalledTimes(1);
    expect(mockCompleteOnboarding).toHaveBeenCalledWith({
      displayName: "Dr. House",
      profession: "Attending Surgeon",
    });
    // Entering the submitting state swaps the label for a spinner
    expect(screen.queryByRole("button", { name: /start operating/i })).not.toBeInTheDocument();
  });
});
