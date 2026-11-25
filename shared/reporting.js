export const reportNames = [
  "Research Inventory",
  "Research Progress",
  "Completed Research",
  "Ongoing Research",
  "Pending Submissions",
  "Missing Requirements",
  "Department Performance",
  "Faculty Research Profile",
  "Research Productivity",
  "Research Review",
  "Research Compliance",
  "Research Activity",
  "Research Archive",
];

export function buildReport(
  { projects, documents, users, audit },
  name,
  checklist,
) {
  const person = (p) =>
    users.find((u) => u.id === p.ownerId)?.name || "Faculty researcher";
  const phase = (p) => checklist[p.phase].name;
  const items = (p) => checklist[p.phase].groups.flatMap((g) => g.items);
  const passed = (p, i) =>
    ["Approved", "Not Applicable"].includes(p.requirements[i.id]?.status);
  const counts = (p) => {
    const list = items(p);
    return [list.filter((i) => passed(p, i)).length, list.length];
  };
  const scope = new Set(projects.map((p) => p.id));
  const docs = documents.filter((d) => scope.has(d.projectId));
  const summaryColumns = [
    "Title",
    "Researcher",
    "Type",
    "Department",
    "Program",
    "Year",
    "Phase",
    "Status",
    "Synthetic",
  ];
  const inventory = (list) => ({
    columns: summaryColumns,
    rows: list.map((p) => [
      p.title,
      person(p),
      p.type,
      p.department,
      p.program,
      p.year,
      phase(p),
      p.status,
      p.synthetic ? "Yes" : "No",
    ]),
  });
  if (name === "Completed Research")
    return inventory(projects.filter((p) => p.status === "Completed"));
  if (name === "Ongoing Research")
    return inventory(projects.filter((p) => p.status === "Ongoing"));
  if (name === "Research Archive")
    return inventory(projects.filter((p) => p.status === "Archived"));
  if (name === "Research Progress")
    return {
      columns: [
        "Title",
        "Researcher",
        "Type",
        "Department",
        "Year",
        "Current phase",
        "Approved / applicable requirements",
        "Phase readiness",
      ],
      rows: projects.map((p) => {
        const [n, total] = counts(p);
        return [
          p.title,
          person(p),
          p.type,
          p.department,
          p.year,
          phase(p),
          `${n} / ${total}`,
          n === total ? "Ready for advancement" : "Requirements outstanding",
        ];
      }),
    };
  if (name === "Pending Submissions" || name === "Research Review") {
    const list =
      name === "Pending Submissions"
        ? docs.filter((d) => d.status === "Pending Review")
        : docs;
    return {
      columns: [
        "Document",
        "Version",
        "Research title",
        "Type",
        "Department",
        "Status",
        "Uploader",
        "Submitted",
        "Reviewer",
        "Decision feedback",
      ],
      rows: list.map((d) => {
        const p = projects.find((p) => p.id === d.projectId);
        return [
          d.name,
          d.version,
          p.title,
          p.type,
          p.department,
          d.status,
          d.uploaderName,
          d.createdAt,
          d.review?.reviewer || "",
          d.feedback || "",
        ];
      }),
    };
  }
  if (name === "Missing Requirements")
    return {
      columns: [
        "Research title",
        "Type",
        "Department",
        "Phase",
        "Requirement",
        "Status",
        "Feedback",
      ],
      rows: projects
        .filter((p) => p.status === "Ongoing")
        .flatMap((p) =>
          items(p)
            .filter((i) => !passed(p, i))
            .map((i) => [
              p.title,
              p.type,
              p.department,
              phase(p),
              i.label,
              p.requirements[i.id]?.status || "Missing",
              p.requirements[i.id]?.feedback || "",
            ]),
        ),
    };
  if (name === "Research Compliance")
    return {
      columns: [
        "Research title",
        "Type",
        "Department",
        "Phase",
        "Approved",
        "Not applicable",
        "Pending review",
        "Needs revision / rejected",
        "Missing",
        "Compliance",
      ],
      rows: projects.map((p) => {
        const list = items(p),
          n = (s) =>
            list.filter((i) => p.requirements[i.id]?.status === s).length;
        return [
          p.title,
          p.type,
          p.department,
          phase(p),
          n("Approved"),
          n("Not Applicable"),
          n("Pending Review"),
          n("Needs Revision") + n("Rejected"),
          n("Missing"),
          `${Math.round((counts(p)[0] / list.length) * 100)}%`,
        ];
      }),
    };
  if (name === "Department Performance")
    return {
      columns: [
        "Department",
        "Total research",
        "Ongoing",
        "Completed",
        "Archived",
        "Completion rate",
      ],
      rows: [...new Set(projects.map((p) => p.department))].map((dept) => {
        const list = projects.filter((p) => p.department === dept),
          n = (s) => list.filter((p) => p.status === s).length;
        return [
          dept,
          list.length,
          n("Ongoing"),
          n("Completed"),
          n("Archived"),
          `${Math.round(((n("Completed") + n("Archived")) / list.length) * 100)}%`,
        ];
      }),
    };
  if (name === "Faculty Research Profile" || name === "Research Productivity")
    return {
      columns: [
        "Researcher",
        "Department",
        "Academic year",
        "Research type",
        "Projects",
        "Ongoing",
        "Completed / archived",
      ],
      rows: [
        ...new Set(projects.map((p) => [p.ownerId, p.year, p.type].join("|"))),
      ].map((key) => {
        const [ownerId, year, type] = key.split("|"),
          list = projects.filter(
            (p) =>
              p.ownerId === ownerId &&
              String(p.year) === year &&
              p.type === type,
          );
        return [
          person(list[0]),
          list[0].department,
          year,
          type,
          list.length,
          list.filter((p) => p.status === "Ongoing").length,
          list.filter((p) => p.status !== "Ongoing").length,
        ];
      }),
    };
  if (name === "Research Activity")
    return {
      columns: [
        "Actor",
        "Action",
        "Research title / entity",
        "Reason",
        "Timestamp",
      ],
      rows: audit
        .filter((a) => scope.has(a.entity))
        .map((a) => [
          a.actor,
          a.action,
          projects.find((p) => p.id === a.entity)?.title || a.entity,
          a.reason,
          a.createdAt,
        ]),
    };
  return inventory(projects);
}
