import { about, communityLeadership, contactProfiles, education, events, experiences, featuredProjects, pageDescriptions, site } from "../data/site";
import { getWritingPath, getPublishedBlog } from "./blog-source";
import { getBlogExport } from "./blog-export";
import { getNoteMarkdownPath, getNotesIndexPages, getNotesLLMsFullText, getPublishedNotes } from "./notes-llm";

const portfolioPages = [
  { label: "About", path: "/", description: pageDescriptions.about },
  { label: "Projects", path: "/projects/", description: pageDescriptions.projects },
  { label: "Experience", path: "/experience/", description: pageDescriptions.experience },
  { label: "Leadership", path: "/leadership/", description: pageDescriptions.leadership },
  { label: "Education", path: "/education/", description: pageDescriptions.education },
  { label: "Blog", path: "/blog/", description: "Tutorials, experiments, personal updates, and observations." },
  { label: "Contact", path: "/contact/", description: pageDescriptions.contact },
] as const;

function absoluteUrl(path: string): string {
  return new URL(path, site.url).toString();
}

function link(label: string, href: string, description: string): string {
  return `- [${label}](${href}): ${description}`;
}

export async function getSiteLLMsIndex(): Promise<string> {
  const posts = await getPublishedBlog();
  const notesIndexes = getNotesIndexPages();
  const publishedNotes = getPublishedNotes();
  const lines = [
    `# ${site.fullName}`,
    "",
    `> ${site.description}`,
    "",
    `${site.fullName}'s personal website covers his work experience, projects, community leadership, education, writing, and ${
      publishedNotes.length > 0 ? "published notes" : "Notes indexes prepared for future publications"
    }.`,
    "",
    `Canonical site: ${site.url}/`,
    "",
    "## Portfolio",
    "",
    ...portfolioPages.map((page) =>
      link(page.label, absoluteUrl(page.path), page.path === "/blog/" && posts.length === 0 ? "No blog posts are published yet." : page.description)
    ),
    "",
    "## Selected projects",
    "",
    ...featuredProjects.map((project) => link(project.title, project.href ?? absoluteUrl("/projects/"), `${project.stack}. ${project.summary}`)),
  ];

  lines.push("", posts.length ? "## Published blog posts" : "## Blog", "");
  if (posts.length === 0) lines.push("No blog posts are published yet.");
  else lines.push(...posts.map((post) => link(post.data.title, absoluteUrl(getWritingPath(post)), post.data.description)));

  lines.push(
    "",
    "## Notes",
    "",
    link("Notes website", absoluteUrl("/notes/"), "The human-readable Notes area and its topic, course, and tag indexes."),
    "",
    "### Notes indexes",
    "",
    ...notesIndexes.map((page) => link(page.data.title, absoluteUrl(getNoteMarkdownPath(page.url)), page.data.description)),
    ...(publishedNotes.length === 0
      ? ["", "No notes are published yet. The links above are index pages prepared for future notes."]
      : [
          "",
          "### Published notes",
          "",
          ...publishedNotes.map((page) => link(page.data.title, absoluteUrl(getNoteMarkdownPath(page.url)), page.data.description)),
        ]),
    "",
    "## Contact",
    "",
    ...contactProfiles.map((profile) => link(profile.title, profile.href, profile.value)),
    "",
    "## Machine-readable resources",
    "",
    link("Blog RSS", absoluteUrl("/blog/rss.xml"), "Subscribe to published Blog posts."),
    link("Notes RSS", absoluteUrl("/notes/rss.xml"), "Subscribe to published Notes."),
    link("Extended site context", absoluteUrl("/llms-full.txt"), "Portfolio details, published Blog posts, and Notes in one text file."),
    link("Notes-only LLM index", absoluteUrl("/notes/llms.txt"), "A scoped index generated from the Fumadocs Notes collection."),
    link(
      "Notes content export",
      absoluteUrl("/notes/llms-full.txt"),
      "Available note content with an explicit empty state when no notes are published."
    ),
    link("Sitemap", absoluteUrl("/sitemap-index.xml"), "All indexable website routes."),
    ""
  );

  return lines.join("\n");
}

export async function getSiteLLMsFullText(): Promise<string> {
  const [index, posts] = await Promise.all([getSiteLLMsIndex(), getPublishedBlog()]);
  const publishedNotes = getPublishedNotes();
  const lines = [
    index,
    "---",
    "",
    "## Extended profile",
    "",
    ...about.profileFacts.map((fact) => `- ${fact}`),
    "",
    "## Experience",
    "",
    ...experiences.flatMap((experience) => [
      `### ${experience.role}, ${experience.company}`,
      "",
      experience.date,
      "",
      ...experience.points.map((point) => `- ${point}`),
      "",
    ]),
    "## Projects",
    "",
    ...featuredProjects.flatMap((project) => [`### ${project.title}`, "", project.stack, "", project.description, ""]),
    "## Community leadership",
    "",
    ...communityLeadership.flatMap((initiative) => [`### ${initiative.title}`, "", initiative.role, "", initiative.description, ""]),
    "## Events",
    "",
    ...events.flatMap((event) => [`### ${event.title}`, "", event.meta, "", event.description, ""]),
    "## Education",
    "",
    `- ${education.degree.title}, ${education.degree.institution} (${education.degree.date})`,
    ...education.skills.map((skill) => `- ${skill.title}: ${skill.items}`),
    "",
    ...(posts.length ? ["## Published blog posts", "", ...posts.map((post) => getBlogExport(post).markdownContent.trim()), ""] : []),
    ...(publishedNotes.length === 0
      ? ["## Notes content", "", "No notes are published yet."]
      : [
          "## Published notes",
          "",
          getNotesLLMsFullText()
            .replace(/^# Notes\n+/, "")
            .trim(),
        ]),
  ];

  return `${lines.join("\n").trim()}\n`;
}
