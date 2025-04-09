export function validateLogin(data) {
    const errors = {};

    if (!data.email) {
    errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
    errors.email = 'Email is invalid';
    }

    if (!data.password) {
    errors.password = 'Password is required';
    } else if (data.password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
    }

    return errors;
}

export function validateSignup(data) {
    const errors = {};

    if (!data.name) {
    errors.name = 'Name is required';
    }

    if (!data.email) {
    errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
    errors.email = 'Email is invalid';
    }

    if (!data.password) {
    errors.password = 'Password is required';
    } else if (data.password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
    }

    if (!data.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password';
    } else if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
    }

    return errors;
}
