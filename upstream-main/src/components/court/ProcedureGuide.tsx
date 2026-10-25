const ProcedureGuide = () => {
  return (
    <article className="prose dark:prose-invert max-w-none">
      <h2>Proceedings Overview</h2>
      <p>
        This international AI-assisted court provides a transparent, accessible process.
        Parties submit case details through an intake assistant, receive structured
        guidance based on established legal methods (e.g., IRAC), and can summon
        participants for hearings. A live simulation mode allows broader participation
        and education with gamification elements.
      </p>

      <h3>Roles</h3>
      <ul>
        <li>Plaintiff/Claimant and Defendant/Respondent</li>
        <li>Counsel and Advisors</li>
        <li>Judge Panel (verified)</li>
        <li>Observers/Jurors (simulation mode)</li>
      </ul>

      <h3>Standard Flow</h3>
      <ol>
        <li>Case Intake: structured questionnaire to clarify facts, issues, and goals.</li>
        <li>Party Summons: notify and invite parties or witnesses.</li>
        <li>Hearing Scheduling: propose and confirm dates/time zones.</li>
        <li>Evidence Preparation: AI-assisted checklists and formatting.</li>
        <li>Hearing: arguments, questions, and interim rulings.</li>
        <li>Decision/Summary: outcomes and next steps.</li>
      </ol>

      <h3>Important Notes</h3>
      <ul>
        <li>AI output is assistive and must be reviewed by qualified professionals.</li>
        <li>Privacy and consent are required for sharing sensitive information.</li>
        <li>Digital signing and multi-language support will be introduced next.</li>
      </ul>
    </article>
  );
};

export default ProcedureGuide;
