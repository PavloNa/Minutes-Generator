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
        ai_config: data.ai_config || { ai_provider: 'OpenAI', api_key: '' },
        stats: data.stats || { characters_processed: 0, audio_seconds_processed: 0, transcripts_generated: 0 }
      };
    } else {
      return { success: false, error: data.message || 'Failed to get user' };
    }
  } catch (error) {
    console.error('Get user error:', error);
    return { success: false, error: 'Network error. Please try again.' };
  }
};

export const updateUser = async (data) => {
  const token = getStoredToken();
  if (!token) return { success: false, error: 'Not logged in' };

  try {
    const response = await fetch(`${API_BASE_URL}/update_user?token=${encodeURIComponent(token)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (response.ok && result.message && result.message.includes('successfully')) {
      return { success: true, message: result.message };
    } else {
      return { success: false, error: result.message || 'Update failed' };
    }
  } catch (error) {
    console.error('Update user error:', error);
    return { success: false, error: 'Network error. Please try again.' };
  }
};

export const processTranscript = async ({ text, file }) => {
  const token = getStoredToken();
  if (!token) return { success: false, error: 'Not logged in' };

  try {
    const formData = new FormData();
    formData.append('token', token);
    
    if (file) {
      formData.append('file', file);
    } else if (text) {
      formData.append('transcript_text', text);
    } else {
      return { success: false, error: 'No transcript or file provided' };
    }

    const response = await fetch(`${API_BASE_URL}/process_transcript`, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (result.success) {
      return { success: true, minutes: result.minutes, transcriptLength: result.transcript_length };
    } else {
      return { success: false, error: result.message || 'Processing failed' };
    }
  } catch (error) {
    console.error('Process transcript error:', error);
    return { success: false, error: 'Network error. Please try again.' };
  }
};

export const getPdfTemplates = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/pdf_templates`, {
      method: 'GET',
    });

    const data = await response.json();

    if (data.success) {
      return { success: true, templates: data.templates };
    } else {
      return { success: false, error: 'Failed to get templates' };
    }
  } catch (error) {
    console.error('Get templates error:', error);
    return { success: false, error: 'Network error. Please try again.' };
  }
};

export const createPdf = async ({ template, minutes, filename }) => {
  const token = getStoredToken();
  if (!token) return { success: false, error: 'Not logged in' };

  try {
    const formData = new FormData();
    formData.append('token', token);
    formData.append('template', template);
    formData.append('minutes', JSON.stringify(minutes));
    formData.append('filename', filename);

    const response = await fetch(`${API_BASE_URL}/create_pdf`, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (result.success) {
      return { 
        success: true, 
        message: result.message,
        pdfData: result.pdf_data,
        filename: result.filename
      };
    } else {
      return { success: false, error: result.message || 'Failed to create PDF' };
    }
  } catch (error) {
    console.error('Create PDF error:', error);
    return { success: false, error: 'Network error. Please try again.' };
  }
};

export const getUserFiles = async () => {
  const token = getStoredToken();
  if (!token) return { success: false, error: 'Not logged in' };

  try {
    const response = await fetch(`${API_BASE_URL}/get_user_files?token=${encodeURIComponent(token)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (data.success) {
      return { success: true, files: data.files };
    } else {
      return { success: false, error: data.message || 'Failed to get files' };
    }
  } catch (error) {
    console.error('Get user files error:', error);
    return { success: false, error: 'Network error. Please try again.' };
  }
};

export const getFile = async (filename) => {
  const token = getStoredToken();
  if (!token) return { success: false, error: 'Not logged in' };

  try {
    const response = await fetch(`${API_BASE_URL}/get_file?token=${encodeURIComponent(token)}&filename=${encodeURIComponent(filename)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (data.success) {
      return { success: true, data: data.data, filename: data.filename };
    } else {
      return { success: false, error: data.message || 'Failed to get file' };
    }
  } catch (error) {
    console.error('Get file error:', error);
    return { success: false, error: 'Network error. Please try again.' };
  }
};