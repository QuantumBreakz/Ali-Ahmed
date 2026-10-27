import sourceRepository from "./source-repository.json";
import portrait from "../assets/images/ali-ahmed.jpg";

export type Link = {
  label: string;
  href: string;
  external?: boolean;
};

export const identity = {
  firstName: "Ali",
  fullName: "Ali Ahmed",
  nameUrdu: "علی",
} as const;

export const site = {
  ...identity,
  name: `${identity.firstName}/${identity.nameUrdu}`,
  url: "https://aliahmed.si",
  email: "ali.ahmed.work.dev@gmail.com",
  sourceRepositoryUrl: sourceRepository.url,
  sourceRepositoryPublic: sourceRepository.public,
  sourceRepositoryBranch: sourceRepository.branch,
  description: "AI engineer, product builder, security enthusiast (in that order).",
  favicon: "/favicon.svg",
  socialImage: {
    src: "/images/ali-ahmed.jpg",
    alt: "Ali Ahmed standing in a park at night",
    width: portrait.width,
    height: portrait.height,
  },
} as const;

export const pageDescriptions = {
  about: site.description,
  projects:
    "AI products, full-stack platforms, and open-source experiments I have built, from multi-agent financial intelligence to offline RAG and computer vision.",
  experience: "Where I have worked: AI engineering, computer vision for identity verification, LLM-powered products, and product management.",
  leadership: "Communities I have helped lead at FAST-NUCES, from SOFTEC to the university's first capture-the-flag competition.",
  education: "My Computer Science education at FAST-NUCES, together with the tools and technologies I work with.",
  contact: "Feel free to reach out about AI products, collaboration opportunities, or questions.",
} as const;

export const navigation = [
  { label: "about", href: "/" },
  { label: "projects", href: "/projects/" },
  { label: "experience", href: "/experience/" },
  { label: "leadership", href: "/leadership/" },
  { label: "education", href: "/education/" },
  { label: "blog", href: "/blog/" },
  { label: "notes", href: "/notes/" },
  { label: "contact", href: "/contact/" },
] as const;

export const githubRepositoriesUrl = "https://github.com/QuantumBreakz?tab=repositories";

export const about = {
  profileImage: "/images/ali-ahmed.jpg",
  profileFacts: [
    "Leading AI and full-stack product development @ SmartLogics",
    "Product Manager I @ Arrivy (2025–2026)",
    "Built KYC computer vision and multilingual OCR @ ShuftiPro",
    "Organizer of FAST's first CTF competition (150+ participants)",
    "CS Grad from FAST-NUCES",
  ],
} as const;

export const contactProfiles = [
  {
    icon: "email",
    label: "Email",
    title: "Email",
    value: site.email,
    href: `mailto:${site.email}`,
    external: false,
  },
  {
    icon: "github",
    label: "GitHub",
    title: "GitHub",
    value: "@QuantumBreakz",
    href: "https://github.com/QuantumBreakz",
    external: true,
  },
  {
    icon: "linkedin",
    label: "LinkedIn",
    title: "LinkedIn",
    value: "@ali-ahmed-hustletothemax92",
    href: "https://www.linkedin.com/in/ali-ahmed-hustletothemax92",
    external: true,
  },
] as const;

export const portfolioContact = {
  message: "Feel free to reach out, always happy to talk about hard problems and good products.",
  links: contactProfiles.map(({ icon, label, href, external }) => ({ icon, label, href, external })),
} as const;

export const homeProjects: ReadonlyArray<{
  title: string;
  href: string;
  year?: string;
  description: string;
  secondary?: Link;
}> = [
  {
    title: "Nitspot CRM",
    href: "https://nitspot-frontend-rust.vercel.app",
    year: "2026",
    description:
      "A CRM for sales teams: lead pipeline, LinkedIn outreach, daily reports, web push, and an MCP connector with OAuth so AI assistants can work with the data.",
  },
  {
    title: "Cuttlefish",
    href: "https://cuttlefish-frontend.vercel.app",
    year: "2026",
    description: "An AI-powered RAG dashboard for financial intelligence, with ESG scoring, semantic document search, and multi-agent orchestration.",
  },
  {
    title: "Turbo Alan Refiner",
    href: "https://turboalanrefiner-ten.vercel.app",
    year: "2025",
    description: "An AI text refinement platform with real-time SSE streaming, multi-pass processing, and side-by-side comparisons.",
    secondary: { label: "Read the frontend source", href: "https://github.com/QuantumBreakz/TurboAlanRefinerFrontend" },
  },
];

export const featuredProjects: ReadonlyArray<{
  title: string;
  summary: string;
  stack: string;
  description: string;
  href?: string;
  resources: ReadonlyArray<Link>;
}> = [
  {
    title: "Nitspot CRM",
    summary: "A CRM for SDR and sales teams, with an MCP connector so AI assistants can work alongside the people using it.",
    stack: "React 19 · Hono · Supabase · Cloudflare Workers",
    href: "https://nitspot-frontend-rust.vercel.app",
    description:
      "Contacts and lead pipeline, LinkedIn outreach, opportunities, daily reports, calendar, dashboards, and notifications across in-app, email, and web push. The browser talks to Supabase directly behind row-level security, while a Hono API on Cloudflare Workers or Render handles privileged work, scheduled jobs, and an OAuth-secured MCP connector for AI clients.",
    resources: [{ label: "Live app", href: "https://nitspot-frontend-rust.vercel.app" }],
  },
  {
    title: "Cuttlefish",
    summary: "An agentic financial intelligence platform built on LLM orchestration and retrieval-augmented generation.",
    stack: "Python · FastAPI · React · LangChain",
    href: "https://cuttlefish-frontend.vercel.app",
    description:
      "I built an agentic financial intelligence platform combining LLM orchestration, document ingestion, semantic retrieval, conversational memory, and RAG. The FastAPI backend adds ESG scoring, multi-agent swarm orchestration, and a trust graph that keeps an audit trail of every agent's work.",
    resources: [{ label: "Live app", href: "https://cuttlefish-frontend.vercel.app" }],
  },
  {
    title: "Turbo Alan Refiner",
    summary: "An AI text refinement platform with real-time streaming, multi-pass processing, and side-by-side comparisons.",
    stack: "Next.js · TypeScript · Python · FastAPI",
    href: "https://turboalanrefiner-ten.vercel.app",
    description:
      "I engineered a full-stack AI refinement platform with real-time SSE streaming, multi-pass processing, batch execution, and interactive text comparisons. The Next.js frontend covers live refinement, diffing, batch results, and analytics on top of a FastAPI backend.",
    resources: [
      { label: "Live app", href: "https://turboalanrefiner-ten.vercel.app" },
      { label: "Frontend source", href: "https://github.com/QuantumBreakz/TurboAlanRefinerFrontend" },
      { label: "Backend source", href: "https://github.com/QuantumBreakz/TurboRefinerBackend" },
    ],
  },
  {
    title: "Research-to-LinkedIn Automation",
    summary: "Turns published research into factual, verified LinkedIn posts, straight from a researcher's publication record.",
    stack: "Next.js · TypeScript · PostgreSQL · LLMs",
    href: "https://github.com/QuantumBreakz/Linkedin-Automation",
    description:
      "A privacy-first platform for researchers: connect a research identity once through ORCID, OpenAlex, arXiv, PubMed, or Crossref, and it continuously turns new publications into authentic LinkedIn content that stays faithful to the source.",
    resources: [{ label: "Source", href: "https://github.com/QuantumBreakz/Linkedin-Automation" }],
  },
  {
    title: "NitLead",
    summary: "AI-powered B2B lead intelligence: automated web research, decision-maker discovery, and structured data extraction.",
    stack: "Python · JavaScript · REST APIs · LLMs",
    description:
      "An in-house SmartLogics product. I built an AI-driven lead enrichment system combining automated web research, decision-maker discovery, structured data extraction, and cost-aware API routing across model providers.",
    resources: [],
  },
  {
    title: "LeadForge",
    summary: "Lead generation, enrichment, scoring, drafting, and outreach in one staged pipeline.",
    stack: "Python · TypeScript · Docker",
    description:
      "LeadForge turns raw business search results into qualified leads. Each stage, from prospect discovery and company enrichment to scoring, email drafting, and campaign preparation, runs and can be tested on its own.",
    resources: [],
  },
  {
    title: "ZKFT",
    summary: "An identity-verified soulbound NFT platform linking KYC verification to non-transferable tokens.",
    stack: "Solidity · JavaScript · Web3 · KYC APIs",
    description:
      "I contributed to a decentralized identity platform connecting KYC verification, non-transferable NFT minting, and authenticated blockchain transactions.",
    resources: [],
  },
];

export const openSourceProjects: ReadonlyArray<{ title: string; href: string; description: string }> = [
  {
    title: "XOR RAG Chatbot",
    href: "https://github.com/QuantumBreakz/RAG-CHATBOT",
    description:
      "A fully offline, multi-document RAG chatbot with a React frontend, FastAPI backend, ChromaDB, and local models through Ollama, with agentic RAG and multi-OCR layout analysis.",
  },
  {
    title: "Real-Time KYC Card Verification",
    href: "https://github.com/QuantumBreakz/MQTT-K-Project",
    description: "A KYC card verification pipeline over MQTT, with independent client, verifier, and analyst services and a monitoring dashboard.",
  },
  {
    title: "WardrobeWhiz",
    href: "https://github.com/QuantumBreakz/WardrobeWiz",
    description:
      "An AI wardrobe assistant that recommends outfits from your own clothes using CLIP embeddings, FAISS vector search, and styling rules.",
  },
  {
    title: "Virtual Doctor",
    href: "https://github.com/QuantumBreakz/Virtual-Doctor",
    description: "A healthcare assistant combining AI-powered symptom diagnosis, emotional state tracking, and medication reminders.",
  },
  {
    title: "Hi Agent",
    href: "https://github.com/QuantumBreakz/Hi-Agent-Frontend",
    description: "A voice AI agent for recovering missed calls, with an in-browser voice widget, a live transcript, and an ROI calculator.",
  },
  {
    title: "GitHub Data Lake",
    href: "https://github.com/QuantumBreakz/data-engineering",
    description: "A medallion-architecture data lake that tracks the data engineering community on GitHub through a Kafka event pipeline.",
  },
  {
    title: "Fintl",
    href: "https://github.com/QuantumBreakz/fintl-frontend",
    description: "A full-stack financial management app built with React Native (Expo) and an Express and MongoDB API.",
  },
  {
    title: "Campus Navigation Assistant",
    href: "https://github.com/QuantumBreakz/Heuristic-Mobile-Based-Campus-Navigation-Assistant",
    description: "A mobile app for navigating the FAST-NUCES campus using computer vision and trilateration.",
  },
];

export const experiences = [
  {
    company: "SmartLogics",
    role: "Chief Technology Officer (CTO)",
    date: "Jun 2026 – Present",
    summary: "I lead technology at SmartLogics and its sister company Nitnode, from architecture to delivery.",
    points: [
      "Own the technical direction of SmartLogics and its sister company Nitnode, setting architecture, engineering standards, and delivery for every product.",
      "Lead development of multiple AI-powered and full-stack products for US-based clients across solution architecture, backend engineering, AI integration, and product delivery.",
      "Built in-house SaaS products such as NitLead and NitCreate, combining React, Next.js, Node.js, Python, and AI-powered automation to solve real business problems.",
    ],
  },
  {
    company: "Arrivy",
    role: "Product Manager I",
    date: "Dec 2025 – May 2026",
    summary: "I turned customer needs into specifications and led the company's security compliance work.",
    points: [
      "Translated customer and product requirements into technical specifications and collaborated with engineering teams to deliver and refine enterprise software features.",
      "Led SOC 2, ISO 27001, and GDPR compliance initiatives for the company.",
      "Coordinated cross-functional product work, shipping multiple features in collaboration with every team.",
    ],
  },
  {
    company: "Kryptomind",
    role: "AI/ML Engineer",
    date: "Aug 2025 – Dec 2025",
    summary: "I architected multi-agent AI products and LLM-powered financial intelligence pipelines.",
    points: [
      "Architected and deployed AI products utilizing multi-agent systems and LLM-powered financial intelligence pipelines.",
      "Designed deep learning pipelines using PyTorch for NLP, computer vision, and multimodal applications.",
      "Worked extensively with transformer architectures, vector databases, and distributed AI workflows.",
    ],
  },
  {
    company: "Programmers Force / ShuftiPro",
    role: "Associate Software & AI Engineer / Associate Data Scientist",
    date: "Mar 2024 – Aug 2025",
    summary: "I built computer vision and OCR pipelines for identity verification across 100+ countries.",
    points: [
      "Led optimization and refactoring of 100+ machine learning microservices under the ML1 AI division.",
      "Developed PyTorch-based computer vision pipelines for KYC/KYB verification, OCR, face matching, document classification, and liveness detection.",
      "Built multilingual OCR systems supporting identity verification across 100+ countries.",
      "Worked extensively with CNNs, transformers, object detection models, and document understanding architectures.",
      "Reduced processing latency by 25% while improving throughput and model accuracy.",
    ],
  },
] as const;

export const communityLeadership = [
  {
    title: "Cyber Security Society, FAST-NUCES",
    role: "Head",
    description:
      "Led the university's Cyber Security Society and organized FAST's first capture-the-flag (CTF) competition, bringing together 150+ participants to solve hands-on security challenges.",
  },
  {
    title: "SOFTEC, FAST-NUCES",
    role: "Head of International Affairs Department",
    description: "Headed the International Affairs Department for SOFTEC, FAST-NUCES' flagship national software competition and tech festival.",
  },
  {
    title: "Career Counselling Society, FAST",
    role: "Event Coordinator",
    description: "Coordinated career counselling events connecting students with guidance on internships, jobs, and career paths.",
  },
] as const;

export const events = [
  {
    title: "FAST’s First Capture-the-Flag Competition",
    meta: "Cyber Security Society | FAST-NUCES",
    description:
      "Organized the university’s first CTF competition as head of the Cyber Security Society, bringing together 150+ participants to work through hands-on security challenges.",
    links: [],
  },
  {
    title: "SOFTEC App Development Competition",
    meta: "SOFTEC | FAST-NUCES",
    description: "Built and submitted an app for the App Development Competition at SOFTEC, FAST-NUCES’ national software competition.",
    links: [{ label: "View on GitHub", href: "https://github.com/QuantumBreakz/softec25" }],
  },
] as const;

export const education = {
  degree: {
    title: "BS - Computer Science",
    institution: "National University of Computer and Emerging Sciences (FAST-NUCES)",
    date: "Aug 2021 - Jun 2025",
  },
  skills: [
    { title: "Languages", items: "Python, TypeScript, JavaScript, C++, C, SQL, Solidity, HTML, CSS" },
    { title: "Frontend & Mobile", items: "React.js, Next.js, React Native, Redux, Tailwind CSS, Context API" },
    {
      title: "Backend & Frameworks",
      items: "Node.js, Express.js, FastAPI, Django, REST APIs, WebSockets, SSE, JWT, OAuth 2.0, Microservices",
    },
    {
      title: "AI & Machine Learning",
      items:
        "PyTorch, TensorFlow, Scikit-learn, Hugging Face, OpenCV, LangChain, LangGraph, RAG, Agentic AI, LLMs, NLP, OCR, Computer Vision, Multimodal AI, Voice Agents",
    },
    {
      title: "Databases",
      items: "PostgreSQL, MySQL, MongoDB, SQLite, MS SQL, Supabase, Redis, ChromaDB, Qdrant, FAISS",
    },
    {
      title: "Cloud & DevOps",
      items: "AWS, Docker, Git, GitHub, Linux, CI/CD, Vercel, Render, Postman, npm, pnpm, nginx",
    },
    {
      title: "Additional Expertise",
      items: "System Design, Full-Stack Development, API Integration, Distributed Systems, Web3, Smart Contracts, Product Management, Agile/Scrum",
    },
  ],
} as const;

export const contactChannels = contactProfiles.map(({ icon, title, value, href, external }) => ({
  icon,
  title,
  value,
  href,
  external,
}));
