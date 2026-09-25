import { beforeEach, describe, expect, it } from "vitest";
import { useWindowStore } from "@/lib/windowStore";
import { DEFAULT_OPEN_IDS, projectWindowId } from "@/lib/windows";

/**
 * The module-level initial state, captured before any test mutates the store.
 * This is what the server render and the first client render both see, so it has
 * to be deterministic and fully populated (TRD §5).
 */
const initialState = useWindowStore.getState();

const reset = () => {
  // Reset to the shipped initial state between tests.
  useWindowStore.setState({
    windows: [],
    zCounter: 10,
    focusedId: null,
    announcement: "",
    dragCandidateId: null,
  });
};

describe("windowStore", () => {
  beforeEach(reset);

  it("opens a window without duplicating one that is already open", () => {
    const { open } = useWindowStore.getState();
    open("about");
    const firstCount = useWindowStore.getState().windows.length;
    open("about");
    const state = useWindowStore.getState();

    expect(firstCount).toBe(1);
    expect(state.windows).toHaveLength(1);
    // Re-opening focuses rather than spawning a second copy.
    expect(state.focusedId).toBe("about");
    expect(state.announcement).toBe("Focused about.md");
  });

  it("opens project windows keyed by project id", () => {
    useWindowStore.getState().open(projectWindowId("deploy-forge"));
    const [win] = useWindowStore.getState().windows;

    expect(win.id).toBe("project:deploy-forge");
    expect(win.component).toBe("project");
    expect(win.projectId).toBe("deploy-forge");
    expect(win.title).toBe("Deploy Forge.md");
  });

  it("ignores unknown window ids instead of adding a broken window", () => {
    useWindowStore.getState().open("project:does-not-exist");
    expect(useWindowStore.getState().windows).toHaveLength(0);
  });

  it("taskbar toggle minimizes a focused window and restores a minimized one", () => {
    const { open, toggle } = useWindowStore.getState();
    open("todo");

    toggle("todo");
    expect(useWindowStore.getState().windows[0].minimized).toBe(true);
    expect(useWindowStore.getState().focusedId).toBeNull();

    toggle("todo");
    expect(useWindowStore.getState().windows[0].minimized).toBe(false);
    expect(useWindowStore.getState().focusedId).toBe("todo");
  });

  it("focus raises z-index, and does not inflate the counter when already topmost", () => {
    const { open, focus } = useWindowStore.getState();
    open("about");
    open("resume");

    const afterOpen = useWindowStore.getState().zCounter;
    focus("resume"); // already focused and topmost
    expect(useWindowStore.getState().zCounter).toBe(afterOpen);

    focus("about");
    const state = useWindowStore.getState();
    const about = state.windows.find((w) => w.id === "about");
    const resume = state.windows.find((w) => w.id === "resume");
    expect(state.zCounter).toBe(afterOpen + 1);
    expect(about!.zIndex).toBeGreaterThan(resume!.zIndex);
  });

  it("closing the focused window hands focus to the topmost remaining one", () => {
    const { open, close } = useWindowStore.getState();
    open("about");
    open("todo");

    close("todo");
    const state = useWindowStore.getState();
    expect(state.windows.map((w) => w.id)).toEqual(["about"]);
    expect(state.focusedId).toBe("about");
  });

  it("closing the last window leaves focus empty rather than dangling", () => {
    useWindowStore.getState().open("about");
    useWindowStore.getState().close("about");
    expect(useWindowStore.getState().focusedId).toBeNull();
  });

  it("clears the announcement so a repeated message can re-announce", () => {
    useWindowStore.getState().open("about");
    useWindowStore.getState().clearAnnouncement();
    expect(useWindowStore.getState().announcement).toBe("");
  });

  it("ships with the documented default windows, all open", () => {
    expect(initialState.windows.map((w) => w.id)).toEqual([...DEFAULT_OPEN_IDS]);
    expect(initialState.windows).toHaveLength(6);
    expect(initialState.windows.every((w) => !w.minimized)).toBe(true);
  });

  it("gives every default window a distinct z-index so the stack is ordered", () => {
    const zIndexes = initialState.windows.map((w) => w.zIndex);
    expect(new Set(zIndexes).size).toBe(zIndexes.length);
    expect(initialState.focusedId).toBe(DEFAULT_OPEN_IDS[DEFAULT_OPEN_IDS.length - 1]);
  });
});
