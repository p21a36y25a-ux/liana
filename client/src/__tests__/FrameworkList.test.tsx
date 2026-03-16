import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import FrameworkList from '../components/FrameworkList';
import type { Framework } from '../types';

const mockFrameworks: Framework[] = [
  {
    id: 'react',
    name: 'React',
    category: 'frontend',
    language: 'JavaScript / TypeScript',
    description: 'The library for web and native user interfaces.',
    useCases: ['Interactive user interfaces', 'SPA'],
    officialSite: 'https://react.dev',
    tags: ['frontend', 'UI', 'components'],
    color: '#61dafb',
  },
  {
    id: 'express',
    name: 'Express',
    category: 'backend',
    language: 'JavaScript / TypeScript',
    description: 'Fast, unopinionated web framework for Node.js.',
    useCases: ['REST APIs', 'Web servers'],
    officialSite: 'https://expressjs.com',
    tags: ['backend', 'Node.js', 'REST'],
    color: '#000000',
  },
  {
    id: 'vite',
    name: 'Vite',
    category: 'bundler',
    language: 'JavaScript / TypeScript',
    description: 'Next Generation Frontend Tooling.',
    useCases: ['Fast HMR', 'Bundling for production'],
    officialSite: 'https://vite.dev',
    tags: ['bundler', 'build tool'],
    color: '#646cff',
  },
];

describe('FrameworkList', () => {
  it('renders all frameworks', () => {
    render(<FrameworkList frameworks={mockFrameworks} />);
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Express')).toBeInTheDocument();
    expect(screen.getByText('Vite')).toBeInTheDocument();
  });

  it('filters by category', () => {
    render(<FrameworkList frameworks={mockFrameworks} />);
    // Click the "Backend" filter button within the filter group
    const filterGroup = screen.getByRole('group', { name: 'Filter by category' });
    fireEvent.click(screen.getByRole('button', { name: 'Backend' }));
    // The button is within the filter group
    expect(filterGroup).toBeInTheDocument();
    expect(screen.queryByText('React')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Express' })).toBeInTheDocument();
  });

  it('filters by search query', () => {
    render(<FrameworkList frameworks={mockFrameworks} />);
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'vite' } });
    expect(screen.queryByText('React')).not.toBeInTheDocument();
    expect(screen.getByText('Vite')).toBeInTheDocument();
  });

  it('shows count of visible frameworks', () => {
    render(<FrameworkList frameworks={mockFrameworks} />);
    expect(screen.getByText(/Showing 3 of 3/)).toBeInTheDocument();
  });

  it('opens detail panel on card click', () => {
    render(<FrameworkList frameworks={mockFrameworks} />);
    fireEvent.click(screen.getByText('React'));
    expect(screen.getByText('The library for web and native user interfaces.')).toBeInTheDocument();
  });

  it('closes detail panel when close button is clicked', () => {
    render(<FrameworkList frameworks={mockFrameworks} />);
    fireEvent.click(screen.getByText('React'));
    fireEvent.click(screen.getByLabelText('Close'));
    expect(screen.queryByText('The library for web and native user interfaces.')).not.toBeInTheDocument();
  });
});
