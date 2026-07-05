type MeScreenProps = {
  onResetPrototypeData: () => void;
};

export function MeScreen({ onResetPrototypeData }: MeScreenProps) {
  return (
    <section className="me-screen">
      <p className="eyebrow">Me</p>
      <h1>Prototype Settings</h1>
      <p>
        Local prototype data is saved in this browser only. Resetting restores the original seed
        thoughts, loops, insights, and Lumi chat placeholders.
      </p>
      <button className="danger-button" onClick={onResetPrototypeData} type="button">
        Reset prototype data
      </button>
    </section>
  );
}
