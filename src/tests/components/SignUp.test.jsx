import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SignUp } from '@/components/signUp';
import { TernSecureAuth } from '@/auth';
// Mock the auth module
jest.mock('@/auth', () => ({
    TernSecureAuth: {
        signUp: jest.fn()
    }
}));
describe('SignUp Component', () => {
    const mockUser = { email: 'test@example.com' };
    // Store original window.location
    const originalLocation = window.location;
    beforeEach(() => {
        jest.clearAllMocks();
        // Mock window.location
        delete window.location;
        window.location = Object.assign(Object.assign({}, originalLocation), { href: '' });
    });
    afterEach(() => {
        // Restore window.location
        window.location = originalLocation;
    });
    test('renders sign up form', () => {
        render(<SignUp />);
        expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
        expect(screen.getByTestId('submit-button')).toHaveTextContent('Sign Up');
    });
    test('handles successful sign up with redirect', async () => {
        const onSuccess = jest.fn();
        const redirectUrl = '/dashboard';
        // Mock successful sign up
        TernSecureAuth.signUp.mockResolvedValueOnce(mockUser);
        render(<SignUp onSuccess={onSuccess} redirectUrl={redirectUrl}/>);
        // Fill in form
        fireEvent.change(screen.getByPlaceholderText('Email'), {
            target: { value: 'test@example.com' }
        });
        fireEvent.change(screen.getByPlaceholderText('Password'), {
            target: { value: 'password123' }
        });
        // Submit form
        fireEvent.click(screen.getByTestId('submit-button'));
        await waitFor(() => {
            expect(TernSecureAuth.signUp).toHaveBeenCalledWith('test@example.com', 'password123');
            expect(onSuccess).toHaveBeenCalledWith(mockUser);
            expect(window.location.href).toBe(redirectUrl);
        });
    });
    test('handles sign up error', async () => {
        const onError = jest.fn();
        const errorMessage = 'Email already in use';
        // Mock failed sign up
        TernSecureAuth.signUp.mockRejectedValueOnce(new Error(errorMessage));
        render(<SignUp onError={onError}/>);
        // Fill in form
        fireEvent.change(screen.getByPlaceholderText('Email'), {
            target: { value: 'test@example.com' }
        });
        fireEvent.change(screen.getByPlaceholderText('Password'), {
            target: { value: 'weak' }
        });
        // Submit form
        fireEvent.click(screen.getByTestId('submit-button'));
        await waitFor(() => {
            expect(screen.getByText(errorMessage)).toBeInTheDocument();
            expect(onError).toHaveBeenCalled();
        });
    });
    test('applies custom styles', () => {
        const customStyles = {
            form: 'custom-form',
            input: 'custom-input',
            button: 'custom-button',
            errorText: 'custom-error'
        };
        render(<SignUp customStyles={customStyles}/>);
        const form = screen.getByRole('form');
        const emailInput = screen.getByPlaceholderText('Email');
        const submitButton = screen.getByTestId('submit-button');
        expect(form.className).toContain('custom-form');
        expect(emailInput.className).toContain('custom-input');
        expect(submitButton.className).toContain('custom-button');
    });
    test('shows loading state during submission', async () => {
        // Mock slow sign up
        TernSecureAuth.signUp.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)));
        render(<SignUp />);
        // Fill in form
        fireEvent.change(screen.getByPlaceholderText('Email'), {
            target: { value: 'test@example.com' }
        });
        fireEvent.change(screen.getByPlaceholderText('Password'), {
            target: { value: 'password123' }
        });
        // Submit form
        fireEvent.click(screen.getByTestId('submit-button'));
        // Check loading state immediately after submission
        expect(screen.getByTestId('submit-button')).toHaveTextContent('Signing up...');
        expect(screen.getByTestId('submit-button')).toBeDisabled();
        expect(screen.getByPlaceholderText('Email')).toBeDisabled();
        expect(screen.getByPlaceholderText('Password')).toBeDisabled();
    });
});
