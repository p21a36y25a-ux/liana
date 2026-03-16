import { Router } from 'express';

export interface Framework {
  id: string;
  name: string;
  category: 'frontend' | 'backend' | 'fullstack' | 'bundler';
  language: string;
  description: string;
  useCases: string[];
  officialSite: string;
  tags: string[];
  color: string;
}

const frameworks: Framework[] = [
  {
    id: 'angular',
    name: 'Angular',
    category: 'frontend',
    language: 'TypeScript',
    description:
      'A platform and framework for building single-page client applications using HTML and TypeScript. Angular implements core and optional functionality as a set of TypeScript libraries that you import into your applications.',
    useCases: [
      'Enterprise web applications',
      'Single-page applications (SPA)',
      'Progressive Web Apps (PWA)',
      'Complex UI applications with dependency injection',
    ],
    officialSite: 'https://angular.io',
    tags: ['frontend', 'SPA', 'TypeScript', 'Google', 'MVC', 'RxJS'],
    color: '#dd0031',
  },
  {
    id: 'express',
    name: 'Express',
    category: 'backend',
    language: 'JavaScript / TypeScript',
    description:
      'Fast, unopinionated, minimalist web framework for Node.js. Express provides a thin layer of fundamental web application features, without obscuring Node.js features.',
    useCases: [
      'REST APIs',
      'Web servers',
      'Middleware pipelines',
      'Backend for any frontend framework',
    ],
    officialSite: 'https://expressjs.com',
    tags: ['backend', 'Node.js', 'REST', 'API', 'middleware', 'server'],
    color: '#000000',
  },
  {
    id: 'nestjs',
    name: 'NestJS',
    category: 'backend',
    language: 'TypeScript',
    description:
      'A progressive Node.js framework for building efficient, reliable and scalable server-side applications. Built with TypeScript and combines elements of OOP, FP, and FRP.',
    useCases: [
      'Scalable REST APIs',
      'GraphQL APIs',
      'Microservices',
      'Enterprise-grade backend applications',
    ],
    officialSite: 'https://nestjs.com',
    tags: ['backend', 'TypeScript', 'Node.js', 'decorators', 'DI', 'modular'],
    color: '#e0234e',
  },
  {
    id: 'nextjs',
    name: 'Next.js',
    category: 'fullstack',
    language: 'JavaScript / TypeScript',
    description:
      'The React Framework for the Web. Used by some of the world\'s largest companies, Next.js enables you to create full-stack web applications by extending the latest React features.',
    useCases: [
      'Server-side rendering (SSR)',
      'Static site generation (SSG)',
      'Full-stack React applications',
      'E-commerce sites',
    ],
    officialSite: 'https://nextjs.org',
    tags: ['fullstack', 'React', 'SSR', 'SSG', 'Vercel', 'SEO'],
    color: '#000000',
  },
  {
    id: 'nuxt',
    name: 'Nuxt',
    category: 'fullstack',
    language: 'JavaScript / TypeScript',
    description:
      'The Intuitive Vue Framework. Nuxt is an open-source framework that makes web development intuitive and powerful. Create performant and production-grade full-stack web apps and websites with confidence.',
    useCases: [
      'Server-side rendering (SSR)',
      'Static site generation (SSG)',
      'Full-stack Vue.js applications',
      'Content-driven websites',
    ],
    officialSite: 'https://nuxt.com',
    tags: ['fullstack', 'Vue.js', 'SSR', 'SSG', 'SEO', 'file-based routing'],
    color: '#00dc82',
  },
  {
    id: 'parcel',
    name: 'Parcel',
    category: 'bundler',
    language: 'JavaScript / TypeScript',
    description:
      'The zero configuration build tool for the web. Parcel combines a great out-of-the-box development experience with a scalable architecture that can take your project from just getting started to massive production application.',
    useCases: [
      'Zero-config web app bundling',
      'Multi-page applications',
      'Library bundling',
      'Quick prototyping',
    ],
    officialSite: 'https://parceljs.org',
    tags: ['bundler', 'zero-config', 'HMR', 'build tool', 'fast'],
    color: '#b17acc',
  },
  {
    id: 'react',
    name: 'React',
    category: 'frontend',
    language: 'JavaScript / TypeScript',
    description:
      'The library for web and native user interfaces. React lets you build user interfaces out of individual pieces called components. React components are JavaScript functions.',
    useCases: [
      'Interactive user interfaces',
      'Single-page applications (SPA)',
      'Component-based UIs',
      'Cross-platform apps (React Native)',
    ],
    officialSite: 'https://react.dev',
    tags: ['frontend', 'UI', 'components', 'hooks', 'Meta', 'JSX', 'virtual DOM'],
    color: '#61dafb',
  },
  {
    id: 'vite',
    name: 'Vite',
    category: 'bundler',
    language: 'JavaScript / TypeScript',
    description:
      'Next Generation Frontend Tooling. Vite is a build tool that aims to provide a faster and leaner development experience for modern web projects. It consists of a dev server and a build command.',
    useCases: [
      'Modern frontend development',
      'Fast HMR (Hot Module Replacement)',
      'Bundling for production',
      'Works with React, Vue, Svelte, and more',
    ],
    officialSite: 'https://vite.dev',
    tags: ['bundler', 'build tool', 'HMR', 'ESModules', 'fast', 'Rollup'],
    color: '#646cff',
  },
  {
    id: 'vue',
    name: 'Vue.js',
    category: 'frontend',
    language: 'JavaScript / TypeScript',
    description:
      'The Progressive JavaScript Framework. An approachable, performant and versatile framework for building web user interfaces. Vue builds on top of standard HTML, CSS and JavaScript.',
    useCases: [
      'Single-page applications (SPA)',
      'Progressive enhancement',
      'Component-driven UIs',
      'Full-stack apps (with Nuxt)',
    ],
    officialSite: 'https://vuejs.org',
    tags: ['frontend', 'SPA', 'reactive', 'components', 'Composition API', 'MVVM'],
    color: '#42b883',
  },
];

const router = Router();

router.get('/', (_req, res) => {
  res.json(frameworks);
});

router.get('/:id', (req, res) => {
  const framework = frameworks.find((f) => f.id === req.params.id);
  if (!framework) {
    res.status(404).json({ error: 'Framework not found' });
    return;
  }
  res.json(framework);
});

export default router;
