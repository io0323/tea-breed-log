import { render, screen } from '@testing-library/react';

describe('Example Test', () => {
  it('renders correctly', () => {
    render(<div>Test</div>);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
