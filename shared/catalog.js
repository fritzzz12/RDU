// Transcribed from RDU-CHECKLIST.jpg. Personally funded uses this provisional checklist.
export const types = [
  "Agenda Based Research Project",
  "Curricular Based Research Project",
  "Externally Funded Research Project",
  "Personally Funded Research Project",
  "Equivalent Teaching Research Project (ETL)",
];
export const departments = [
  "College of Technology",
  "College of Nursing",
  "College of Education",
  "College of Arts and Sciences",
  "College of Business",
  "College of Public Administration and Governance",
  "College of Medicine",
];
export const programs = [
  ["BS Information Technology", "BS Industrial Technology"],
  ["BS Nursing"],
  ["Bachelor of Elementary Education", "Bachelor of Secondary Education"],
  ["BS Biology", "BA Sociology"],
  ["BS Business Administration", "BS Accountancy"],
  ["Bachelor of Public Administration"],
  ["Doctor of Medicine"],
].flatMap((names, i) =>
  names.map((name) => ({ id: name, name, department: departments[i] })),
);
export const roles = [
  "Super Admin",
  "Research Director",
  "Department Head",
  "Researcher",
];
const group = (id, name, labels) => ({
  id,
  name,
  items: labels.map((entry, index) => {
    const [label, conditional = false] = Array.isArray(entry) ? entry : [entry];
    return { id: `${id}-${index + 1}`, label, conditional };
  }),
});
export const checklist = [
  {
    id: "conceptualization",
    name: "I. CONCEPTUALIZATION PHASE",
    groups: [
      group("call", "A. Call for Proposal", [
        "Call for Research Proposals",
        "Capsule Proposal of Faculty/Researcher",
        [
          "Other supporting document/s related to the conceptualization of the research, if applicable",
          true,
        ],
      ]),
      group("inhouse", "B. In-House Review of Research Proposals", [
        "Program – In-House Review of Research Proposals",
        "Proposal submitted for In-House Review",
        "Summary of Comments and Suggestions from the Panel",
        "Notice of Acceptance or Notice of Non-Acceptance",
      ]),
    ],
  },
  {
    id: "development",
    name: "II. DEVELOPMENT PHASE",
    groups: [
      group("proposal", "A. Proposal Development For Accepted Proposals:", [
        "Revised Proposal / Full-Blown Research Proposal",
        "Action Done Matrix addressing the comments and suggestions of the panel",
      ]),
      group("rec", "B. Research Ethics Committee (REC) Requirements", [
        "Letter Request for REC Evaluation addressed to the REC Chair",
        "Accomplished REC Form 4A",
        "Accomplished REC Form 6A",
        "Curriculum Vitae (CV) of Researcher/s",
        "Research Instruments / Questionnaires / Data Gathering Tools",
        "Informed Consent Form",
        "Screenshot, Email, Letter, or other proof of endorsement/submission to REC",
        ["Action Done Matrix, if revisions were required by REC", true],
        ["Other document/s required by REC, if applicable", true],
      ]),
      group("general", "C. Gender and Development Requirement", [
        "Accomplished HGDG Form",
      ]),
    ],
  },
  {
    id: "implementation",
    name: "III. IMPLEMENTATION PHASE",
    groups: [
      group("authorization", "A. Authorization and Compliance", [
        "Ethics Clearance",
        ["Research Contract, if applicable", true],
        ["Approved Letter/Authority to Conduct the Study, if applicable", true],
      ]),
      group("implementation", "B. Research Implementation", [
        ["Progress Report/s, if applicable", true],
        "Accomplished Data Gathering Tools and Instruments",
        [
          "Other supporting evidence/documentation of research implementation, if applicable",
          true,
        ],
      ]),
      group("paper", "C. Completed Research Paper", [
        "Complete/Final Research Paper",
        "Abstract",
        "Introduction",
        [
          "Review of Related Literature / Theoretical or Conceptual Framework, as applicable",
          true,
        ],
        "Methodology",
        "Results and Discussion",
        "Conclusions",
        ["Recommendations, if applicable", true],
        "References",
        ["Appendices, if applicable", true],
        "Quality and Originality Checks",
        "Grammarly Report",
        "Plagiarism/Similarity Report",
      ]),
      group("dissemination", "D. Dissemination", [
        "In-House Dissemination",
        "Complete Research Paper",
        "Presentation Material / Presentation File",
        "Certificate of Presentation/Participation",
        "External Dissemination",
        ["Approved Letter/Authority to Present, if applicable", true],
        "Certificate of Presentation / Participation",
        ["Conference/Research Presentation Program, if applicable", true],
        ["Copy of Presentation Material, if required", true],
        ["Signed Consent to Present, if applicable", true],
        ["Other proof of dissemination, if applicable", true],
      ]),
      group("publication", "E. Publication", [
        "Accomplished Journal Verification Form",
        ["Signed Consent to Publish, if applicable", true],
        "Copy of Published Research Paper",
        ["Other proof of publication, if applicable", true],
      ]),
      group("utilization", "E. Utilization", [
        "Signed MOA/MOU",
        "Certificate of Utilization",
        "Testimony",
        "Proof of Utilization",
      ]),
    ],
  },
];
export const monitoring =
  "IV. MONITORING AND EVALUATION\nA. Monitoring\nMonitoring covers the whole process of the research project\nB. Evaluation\nEvaluation is conducted at key stages of the research process, particularly during conceptualization, dissemination and publication.";
export const phaseItems = (phase) =>
  checklist[phase].groups.flatMap((g) => g.items);
export const allItems = checklist.flatMap((_, i) => phaseItems(i));
export const emptyRequirements = () =>
  Object.fromEntries(
    allItems.map((item) => [item.id, { status: "Missing", versions: [] }]),
  );
