// Dados de mentores - substitua com dados reais ou busque do Firebase
export const MENTORS = [
  {
    id: "mentor-1",
    name: "Rebeca Sales",
    specialty: "Desenvolvimento Full Stack",
    bio: "Especialista em JavaScript, React e arquitetura de software. Apaixonada por ensinar.",
    technologies: ["JavaScript", "React", "Node.js", "Firebase"],
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rebeca",
    linkedin: "https://linkedin.com/in/rebeca-sales",
    available: true
  },
  {
    id: "mentor-2",
    name: "Ana Silva",
    specialty: "Frontend React",
    bio: "10+ anos em desenvolvimento web. Especialista em React e performance.",
    technologies: ["React", "TypeScript", "CSS", "Next.js"],
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ana",
    linkedin: "https://linkedin.com/in/ana-silva",
    available: true
  },
  {
    id: "mentor-3",
    name: "Carlos Santos",
    specialty: "Backend Node.js",
    bio: "Arquiteto de software com foco em escalabilidade. Node.js e Python.",
    technologies: ["Node.js", "PostgreSQL", "Docker", "AWS"],
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos",
    linkedin: "https://linkedin.com/in/carlos-santos",
    available: true
  },
  {
    id: "mentor-4",
    name: "Mariana Costa",
    specialty: "DevOps & Cloud",
    bio: "Especialista em infraestrutura cloud e CI/CD. AWS certified.",
    technologies: ["AWS", "Docker", "Kubernetes", "Terraform"],
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mariana",
    linkedin: "https://linkedin.com/in/mariana-costa",
    available: true
  }
];

export const BOOKING_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  NO_SHOW: "no_show"
};

export const BOOKING_STATUS_LABELS = {
  pending: "Pendente",
  confirmed: "Confirmada",
  completed: "Concluída",
  cancelled: "Cancelada",
  no_show: "Não compareceu"
};

export const BOOKING_STATUS_COLORS = {
  pending: "#FFC107",      // Amarelo
  confirmed: "#28A745",    // Verde
  completed: "#17A2B8",    // Azul
  cancelled: "#DC3545",    // Vermelho
  no_show: "#6C757D"       // Cinza
};
