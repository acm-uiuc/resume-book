import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test-utils';
import FullPageError from './index'; // Adjust the import path as necessary

describe('FullPageError', () => {
  it('renders with default error messages when no props are provided', () => {
    render(<FullPageError />);
    expect(screen.getByText('An error occurred')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong. Please try again later.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Retry' })).toBeNull();
  });

  it('renders custom error codes and messages when provided', () => {
    render(<FullPageError errorCode={404} errorMessage="Page not found" />);
    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('Page not found')).toBeInTheDocument();
  });

  it('displays a retry button when an onRetry handler is provided', async () => {
    const onRetry = vi.fn();
    render(<FullPageError onRetry={onRetry} />);
    const retryButton = screen.getByTestId('errorRetryButton');
    expect(retryButton).toBeInTheDocument();
    await userEvent.click(retryButton);
    expect(onRetry).toHaveBeenCalled();
  });
});
