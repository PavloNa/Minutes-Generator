const API_BASE_URL = process.env.REACT_APP_300_API_BASE_URL || 'http://localhost:8000';

export const login = async (username, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/login?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (response.ok && data.message && !data.message.includes('Invalid')) {
      // Store the token
      localStorage.setItem('token', data.message);
      return { success: true, token: data.message };
    } else {
      return { success: false, error: data.message || 'Login failed' };
    }
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Network error. Please try again.' };
  }
};

export const register = async (username, password, email) => {
  try {
    const response = await fetch(`${API_BASE_URL}/create_user?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&email=${encodeURIComponent(email)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (response.ok && data.message && data.message.includes('successfully')) {
      return { success: true, message: data.message };
    } else {
      return { success: false, error: data.message || 'Registration failed' };
    }
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, error: 'Network error. Please try again.' };
  }
};

export const verifyToken = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/verify_token?token=${encodeURIComponent(token)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (response.ok && data.username) {
      return { success: true, username: data.username };
    } else {
      return { success: false, error: data.message || 'Token invalid' };
    }
  } catch (error) {
    console.error('Token verification error:', error);
    return { success: false, error: 'Network error. Please try again.' };
  }
};

export const resetPassword = async (email) => {
  try {
    const response = await fetch(`${API_BASE_URL}/reset_password?email=${encodeURIComponent(email)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (response.ok && data.message && data.message.includes('sent')) {
      return { success: true, message: data.message };
    } else {
      return { success: false, error: data.message || 'Password reset failed' };
    }
  } catch (error) {
    console.error('Password reset error:', error);
    return { success: false, error: 'Network error. Please try again.' };
  }
};

export const logout = () => {
  localStorage.removeItem('token');
};

export const getStoredToken = () => {
  return localStorage.getItem('token');
};

export const isLoggedIn = async () => {
  const token = getStoredToken();
  if (!token) return false;
  
  const result = await verifyToken(token);
  return result.success;
};

export const getUser = async () => {
  const token = getStoredToken();
  if (!token) return { success: false, error: 'Not logged in' };

  try {
    const response = await fetch(`${API_BASE_URL}/get_user?token=${encodeURIComponent(token)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (response.ok && data.username) {
      return { 
        success: true, 
        username: data.username, 
        email: data.email,
        openai_api_key: data.openai_api_key || ''
      };
    } else {
      return { success: false, error: data.message || 'Failed to get user' };
    }
  } catch (error) {
    console.error('Get user error:', error);
    return { success: false, error: 'Network error. Please try again.' };
  }
};

export const updateUser = async (openaiApiKey) => {
  const token = getStoredToken();
  if (!token) return { success: false, error: 'Not logged in' };

  try {
    const response = await fetch(`${API_BASE_URL}/update_user?token=${encodeURIComponent(token)}&openai_api_key=${encodeURIComponent(openaiApiKey)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (response.ok && data.message && data.message.includes('successfully')) {
      return { success: true, message: data.message };
    } else {
      return { success: false, error: data.message || 'Update failed' };
    }
  } catch (error) {
    console.error('Update user error:', error);
    return { success: false, error: 'Network error. Please try again.' };
  }
};