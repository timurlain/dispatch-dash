import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RoundTimerModal from '../RoundTimerModal';

function setup(overrides: Partial<React.ComponentProps<typeof RoundTimerModal>> = {}) {
  const onStart = vi.fn();
  const onCancel = vi.fn();
  const props = {
    roundNumber: 2,
    defaultSeconds: 90,
    onStart,
    onCancel,
    ...overrides,
  };
  const utils = render(<RoundTimerModal {...props} />);
  return { ...utils, onStart, onCancel };
}

describe('RoundTimerModal', () => {
  it('renders heading with round number and input with default seconds', () => {
    setup({ roundNumber: 2, defaultSeconds: 90 });

    expect(screen.getByText('Kolo 2 — nastav čas')).toBeInTheDocument();
    const input = screen.getByLabelText(/Čas v sekundách/i) as HTMLInputElement;
    expect(input.value).toBe('90');
  });

  it('calls onStart once with the current value when Start is clicked', async () => {
    const user = userEvent.setup();
    const { onStart } = setup({ roundNumber: 1, defaultSeconds: 60 });

    const startBtn = screen.getByRole('button', { name: /Spustit kolo 1/i });
    await user.click(startBtn);

    expect(onStart).toHaveBeenCalledTimes(1);
    expect(onStart).toHaveBeenCalledWith(60);
  });

  it('disables Start when value is below 30', () => {
    const { onStart } = setup({ roundNumber: 1, defaultSeconds: 60 });

    const input = screen.getByLabelText(/Čas v sekundách/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: '10' } });

    const startBtn = screen.getByRole('button', { name: /Spustit kolo 1/i });
    expect(startBtn).toBeDisabled();

    fireEvent.click(startBtn);
    expect(onStart).not.toHaveBeenCalled();
  });

  it('calls onCancel when Escape is pressed', () => {
    const { onCancel } = setup();

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
