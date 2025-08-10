import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from './App';

// Mock the fetch function
global.fetch = vi.fn();

describe('App Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();

    // Default mock for successful fetch
    (fetch as vi.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ output: 'Default output' }),
    });
  });

  it('should render the main components correctly', () => {
    render(<App />);
    expect(screen.getByText('Problem: Missing Number')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /run/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter input here...')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Output will be shown here...')).toBeInTheDocument();
  });

  it('should update input state when user types in the input textarea', async () => {
    render(<App />);
    const inputArea = screen.getByPlaceholderText<HTMLTextAreaElement>('Enter input here...');
    await userEvent.type(inputArea, '5');
    expect(inputArea.value).toBe('5');
  });

  it('should call fetch with the correct data when Run button is clicked', async () => {
    render(<App />);
    const runButton = screen.getByRole('button', { name: /run/i });
    const inputArea = screen.getByPlaceholderText<HTMLTextAreaElement>('Enter input here...');

    const initialCode = `#include <iostream>
#include <vector>
#include <string>

int main() {
    std::cout << "Hello, World!";
    return 0;
}`;

    await userEvent.type(inputArea, '123');
    await userEvent.click(runButton);

    expect(fetch).toHaveBeenCalledWith('http://localhost:3001/api/code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code: initialCode, input: '123' }),
    });
  });

  it('should display the output when code execution is successful', async () => {
    const mockResponse = { output: 'Hello, World! 123' };
    (fetch as vi.Mock).mockResolvedValue({
      json: () => Promise.resolve(mockResponse),
    });

    render(<App />);
    const runButton = screen.getByRole('button', { name: /run/i });
    
    await userEvent.click(runButton);

    // Check for the final output
    expect(await screen.findByDisplayValue('Hello, World! 123')).toBeInTheDocument();
  });

  it('should display an error message if the fetch call fails', async () => {
    (fetch as vi.Mock).mockRejectedValue(new Error('Network error'));

    render(<App />);
    const runButton = screen.getByRole('button', { name: /run/i });

    await userEvent.click(runButton);

    // Check for the error message
    expect(await screen.findByDisplayValue('Failed to connect to the backend. Is the server running?')).toBeInTheDocument();
  });
});