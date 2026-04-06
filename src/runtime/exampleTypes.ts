export type IntakeExampleSummary = {
  exampleId: string;
  label: string;
  category: string;
};

export type IntakeExampleFixture = {
  exampleId: string;
  label: string;
  category: string;
  rawIntakeMessage: string;
  clarification: {
    needed: boolean;
    reason: string;
    questions: string[];
  };
  normalizedN8nOutput: Record<string, unknown>;
  expectedTrustPlane: Record<string, string>;
  expectedTimelineEvents: string[];
  expectedEvidenceArtifacts: string[];
};
