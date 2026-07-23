type MeScreenProps = {
  onResetEntireWorkspace: () => Promise<void>;
  onRestoreDemoWorkspace: () => void;
  resetError: string;
  resetInProgress: boolean;
};

export function MeScreen({
  onResetEntireWorkspace,
  onRestoreDemoWorkspace,
  resetError,
  resetInProgress,
}: MeScreenProps) {
  function confirmReset() {
    const confirmed = window.confirm(
      "Reset this entire workspace? This permanently deletes your bubbles, all three home panels, Business DNA answers and profiles, thoughts, Lumi conversations, saved name, and recovery data. This cannot be undone.",
    );
    if (confirmed) void onResetEntireWorkspace();
  }

  return (
    <section className="me-screen">
      <p className="eyebrow">Me</p>
      <h1>Workspace Settings</h1>
      <p>
        Resetting permanently clears this participant's complete workspace from this browser and
        the Business DNA server. It does not affect any other participant.
      </p>
      <button className="danger-button" disabled={resetInProgress} onClick={confirmReset} type="button">
        {resetInProgress ? "Resetting workspace…" : "Reset Entire Workspace"}
      </button>
      {resetError ? <p className="reset-error" role="alert">{resetError}</p> : null}
      <div className="developer-settings">
        <p className="section-label">Testing</p>
        <p>Restore the original sample bubbles and home-panel content for demonstration only.</p>
        <button className="ghost-button" onClick={onRestoreDemoWorkspace} type="button">
          Restore Demo Workspace
        </button>
      </div>
    </section>
  );
}
