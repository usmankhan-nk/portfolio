export const nav = ["Home", "About", "Expertise", "Skills", "Projects", "Contact"];

export const hero = {
  words: [
    {
      h: ["Creative", "Developer"],
      s: "Turning ideas into reality",
      d: "Available for hire. Building fast, responsive web applications using modern tech stacks.",
    },
    {
      h: ["Full Stack", "Dev"],
      s: "Modern scalable applications",
      d: "Frontend to backend: React, Node.js and .NET for high-performance web apps.",
    },
    {
      h: ["Scalable", "Systems"],
      s: "Robust backend architecture",
      d: "Designing reliable backends, clean APIs and well-structured databases.",
    },
  ],
};

export const profile = {
  name: "Muhammad Usman Khan",
  photoStorageKey: "jp-photo",
  statusBadge: "Open to opportunities",
  yearBadge: "2026",
  headline: "Hello, I'm",
  bio: "A passionate computer science student and full-stack developer, crafting clean, functional and scalable web applications. I care about intuitive user experiences and robust backend pipelines, from database design to deployment.",
  stats: [
    { a: "Full-Stack", b: "Architecture" },
    { a: "MERN & ASP.NET", b: "Core tech" },
    { a: "Scalable", b: "Systems" },
  ],
};

export const services = [
  {
    t: "Frontend Development",
    d: "Building pixel-perfect, highly responsive, and immersive web interfaces powered by fluid animations and modern UI/UX principles.",
    c: "React & Tailwind",
  },
  {
    t: "Backend Development",
    d: "Architecting scalable REST APIs, secure authentication flows, and high-throughput server logic designed for enterprise growth.",
    c: "Node.js & Express",
  },
  {
    t: "Database Design",
    d: "Designing robust relational and NoSQL schemas optimized for lightning-fast queries, data integrity, and seamless scalability.",
    c: "SQL & MongoDB",
  },
  {
    t: "Cloud & DevOps",
    d: "Deploying secure, scalable cloud infrastructure with automated CI/CD pipelines and high-availability server management.",
    c: "AWS, Docker & CI/CD",
  },
  {
    t: "Flutter & Dart + SEO",
    d: "Crafting high-performance cross-platform mobile applications integrated with advanced SEO strategies to maximize digital reach and visibility.",
    c: "Flutter & SEO",
  },
];

export const technologyRows = [
  [
    "React",
    "Next.js",
    "Node.js",
    "Express.js",
    "MongoDB",
    "Angular",
    "ASP.NET Core",
    "C#",
    "SQL Server",
    "Java",
    "REST APIs",
    "Three.js",
  ],
  [
    "JavaScript",
    "TypeScript",
    "HTML5",
    "CSS3",
    "Tailwind",
    "JWT Auth",
    "Git & GitHub",
    "OOP",
    "Database Systems",
  ],
];

/* Each card links itself: `url` (live site) wins over `repo` (GitHub), and
   the first non-empty one makes the whole card clickable - it opens in a new
   tab. Leave both empty to keep a card non-clickable.

   The `url` values below are PLACEHOLDERS (example.com) because no live URLs
   exist yet - replace them with the real ones when the projects are deployed,
   and drop the GitHub URL into `repo` for projects that only have a repository. */
export const projects = [
  {
    n: "College Event Management",
    tag: "MERN Stack",
    d: "Full-stack event platform with registrations, admin dashboard and an immersive 3D animated frontend.",
    tech: ["React", "Node.js", "MongoDB", "Express", "Three.js"],
    url: "https://example.com/?project=college-event-management", // TODO: real live URL
    repo: "", // TODO: GitHub URL (used only when `url` is empty)
  },
  {
    n: "PathSeeker",
    tag: "MEAN Stack",
    d: "Career guidance web app that recommends paths based on interests and skills. Built for a full-stack competition.",
    tech: ["Angular", "Node.js", "MongoDB", "Express"],
    url: "https://example.com/?project=pathseeker", // TODO: real live URL
    repo: "", // TODO: GitHub URL (used only when `url` is empty)
  },
  {
    n: "NedAcademy",
    tag: "ASP.NET Core MVC",
    d: "Large-scale academic management system built phase by phase with role-based access and reporting.",
    tech: ["C#", "ASP.NET Core", "SQL Server", "EF Core"],
    url: "https://example.com/?project=nedacademy", // TODO: real live URL
    repo: "", // TODO: GitHub URL (used only when `url` is empty)
  },
];

export const socials = [
  { name: "GitHub", url: "https://github.com/usmankhan-nk", external: true },
  { name: "LinkedIn", url: "https://www.linkedin.com/in/muhammad-usman-khan-943a60444", external: true },
  // TODO: drop the resume PDF in `public/` (e.g. "/resume.pdf") or paste the
  // hosted resume link — the button renders as a non-clickable placeholder
  // until `url` is filled in.
  { name: "Resume", url: "", external: true },
];

export const contact = {
  email: "mukusmankhan0@gmail.com",
  headline: "CONTACT",
  subline: "Let's build something great together",
  intro: "Have a project in mind or just want to say hi? I'm always open to discussing new ideas, collaborations, or opportunities — drop me a message and I'll get back to you.",
};